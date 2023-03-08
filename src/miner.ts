import { Transaction, Output } from './transaction';
import { Block } from './block'
import { hash } from './crypto/hash'
import { canonicalize } from 'json-canonicalize';
import { chainManager } from './chain'
import { logger } from "./logger";
import { mempool } from './mempool'
import { OUR_PUBLIC_KEY } from './crypto/signature';
import { TransactionInputObjectType,
    TransactionObjectType,
    TransactionObject,
    CoinbaseTransactionObject,
    BlockObject,
    TransactionOutputObjectType,
    OutpointObjectType,
    SpendingTransactionObject, 
    ErrorMessageType,
    AnnotatedError} from './message'
import { network } from './network'

const MINING_INTERVAL = 2000
const NONCE_LEN = 64

// miner for the main server
class Miner {
    coinBaseTx: Transaction | null = null;
    height: number = 0;
    txs: string[] = []
    nonce: string = "";
    target: string = "00000000abc00000000000000000000000000000000000000000000000000000";
    previd: string | null = null;
    studentids: string[] = ['davidy02', 'endeshen', 'bettyyw'];
    miner: string = "Student Miner";
    currentBlock: Block | null = null;
    chaintip: Block | null = null;

    createCoinBaseTx(): Transaction {
        let txobj = {
            type: "transaction",
            height: this.height,
            outputs: [
                {
                    pubkey: OUR_PUBLIC_KEY,
                    value: 50000000000
                }
            ]
        }
        if (!CoinbaseTransactionObject.guard(txobj)) {
            throw new Error('Error creating coinbase Tx')
        }
        return Transaction.fromNetworkObject(txobj)
    }

    // mine a block
    async mine() {

        this.chaintip = chainManager.longestChainTip
        if (this.chaintip == null) {
            logger.warn("no chaintip... skip mining")
            return
        }
        this.height = chainManager.longestChainHeight + 1
        logger.debug(`mining with chaintip ${this.chaintip.blockid}, height: ${this.height}`)
        this.coinBaseTx = this.createCoinBaseTx() // need to store coinbase tx TODO
        this.txs = [this.coinBaseTx.txid, ...mempool.getTxIds()]
        this.previd = this.chaintip.blockid

        let nonce = 0;
        while (true) {
            let mined_block = new Block(
                this.previd,
                this.txs,
                String(nonce).padStart(NONCE_LEN, '0'),
                this.target,
                Math.floor(new Date().getTime() / 1000),
                this.miner,
                "zzz",
                this.studentids
            )
            let blockid = mined_block.blockid
            if (blockid < this.target) {
                logger.debug("MINING SUCCESS.")
                await mined_block.validate(network.peers[0])
                network.broadcast({
                    type: 'ihaveobject',
                    blockid
                  })
            }
            nonce++;
            if (nonce % 50000 == 49999) {logger.debug("tried 50000 nounces")}
        }
    }

    async init() {
        // await setTimeout(10000);
        try {
            setInterval(this.mine.bind(this), MINING_INTERVAL)
        } catch (e) {
            throw new AnnotatedError('INTERNAL_ERROR', 'Something went wrong while mining blocks.')
        }
    }

}

export const miner = new Miner()