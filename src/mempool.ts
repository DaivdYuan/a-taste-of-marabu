import { Transaction } from './transaction';
import { Block } from "./block";
import { logger } from "./logger";
import { UTXOSet } from './utxo';
import { Peer } from './peer'

class MempoolManager{
    longestChainHeight: number | undefined = 0
    longestChainTip: Block | null = null
    txs: Transaction[] = []
    stateAfter: UTXOSet | undefined
    
    async init() {
        this.longestChainTip = await Block.makeGenesis()
        this.longestChainHeight = this.longestChainTip.height
        this.stateAfter = this.longestChainTip.stateAfter
    }

    // 1. validate the transaction,
    // 2. add it into txs
    // 3. apply it into stateAfter: UTXOSet
    async onValidTransactionArrival(tx: Transaction) {
        if (this.stateAfter === undefined) {
            logger.warn(`Mempool was not initialized when a transaction arrived`)
            return
        }
        this.stateAfter.apply(tx)
        this.txs.push(tx)
        return
    }

    // 1. validate the block,
    // 2. update the longest Chain Tip and its height
    // 3. depending on if this is reorg,
    // -- a. (no reorg),
    //    -- i. update this.stateAfter: UTXOSet to be exactly the newly arrived block's
    //    -- ii. try to apply transactions in this.txs to this.stateAfter: UTXOSet
                      // most of the transactions in txs should already make 
                      // their way into stateAfter: UTXOSet
    // -- b. (yes reorg, see https://ee374.stanford.edu/blockchain-foundations.pdf, page 75),
    //    -- i. validate the block
    //    -- ii. try to recursively apply transactions FROM the common ancestor B (of
    //           the new tip and the old tip) TO B_2' (the old tip), by querying the
    //           txids field in those BlockObject
    //    -- iii. try to apply transactions in this.txs to this.stateAfter: UTXOSet
    async onValidBlockArrival(prevChaintip: Block, newChaintip: Block) {
        this.longestChainHeight = newChaintip.height
        this.longestChainTip = newChaintip
        if (newChaintip.previd == prevChaintip.blockid) {
            logger.debug(`New longest chain extends previous longest chain`)
            this.stateAfter = newChaintip.stateAfter
            if (this.stateAfter === undefined) {
                logger.warn(`Mempool was not initialized when a transaction arrived`)
                return
            }
            for (const tx of this.txs) {
                try {
                    this.stateAfter.apply(tx)
                    this.txs.push(tx)
                } catch (e: any) {
                    logger.debug(`tx: ${tx} is not consistent with the new longest chain`)
                    logger.debug(`name: ${e.name}. description: ${e.description}`)
                }
            }
        } else {
            // this.findCommonAncestor(prevChaintip, newChaintip)
        }
        return
    }

}

export const mempoolManager = new MempoolManager()