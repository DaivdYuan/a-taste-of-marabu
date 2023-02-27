import { Transaction } from './transaction';
import { Block } from "./block";
import { logger } from "./logger";
import { UTXOSet } from './utxo';

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
    async onValidBlockArrival(block: Block) {

    }

}

export const mempoolManager = new MempoolManager()