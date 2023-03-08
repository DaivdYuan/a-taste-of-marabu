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
        logger.debug(`mining with chaintip ${this.chaintip.blockid}`)
        this.height = chainManager.longestChainHeight + 1
        this.coinBaseTx = this.createCoinBaseTx();
        this.txs = [this.coinBaseTx.txid, ...mempool.getTxIds()]
        this.previd = this.chaintip.blockid

        let mining_obj = {
            type: 'object',
            previd: this.previd,
            txids: this.txs,
            nonce: "",
            T: this.target,
            created: Math.floor(new Date().getTime() / 1000),
            miner: this.miner,
            note: "zzz",
            studentids: this.studentids
        }
        let nonce = 0;
        while (true) {
            mining_obj.nonce = String(nonce).padStart(NONCE_LEN, '0')
            if (!BlockObject.guard(mining_obj)) {
                throw new Error('Error creating block')
            }
            let blockid = (await Block.fromNetworkObject(mining_obj)).blockid
            if (blockid < this.target) {
                // success
                // 1. store into our database
                // 2. broadcast to peers
            }
            nonce++;
        }
    }

    init() {
        try {
            setInterval(this.mine, MINING_INTERVAL)
        } catch (e) {
            throw new AnnotatedError('INTERNAL_ERROR', 'Something went wrong while mining blocks.')
        }
    }

}

export const miner = new Miner()