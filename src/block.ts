import { ObjectId, ObjectStorage } from "./store";
import { AnnotatedError, BlockObjectType, TransactionInputObjectType, TransactionObjectType, TransactionOutputObjectType, OutpointObjectType, SpendingTransactionObject } from "./message";
import { UTXOManager } from "./UTXOmanager";
import { network } from './network'
import delay from 'delay';

const TIMEOUT_DELAY = 10000

export class Block {
    objectid: ObjectId
    previousBlock: ObjectId | null
    transactions: ObjectId[] = []
    nonce: string
    created: number
    T: string
    miner: string = ""
    note: string = ""

    static fromNetworkObject(blockMsg: BlockObjectType): Block {
        return new Block(
            ObjectStorage.id(blockMsg),
            blockMsg.previd,
            blockMsg.txids,
            blockMsg.nonce,
            blockMsg.created,
            blockMsg.T,
            blockMsg.miner,
            blockMsg.note
        )
    }

    static async byId(blockid: ObjectId): Promise<Block> {
        return this.fromNetworkObject(await ObjectStorage.get(blockid));
    }

    constructor(objectid: ObjectId, previousBlock: ObjectId | null, transactions: ObjectId[], nonce: string, created: number, T: string, miner: string = "", note: string = "") {
        this.objectid = objectid
        this.previousBlock = previousBlock
        this.transactions = transactions
        this.nonce = nonce
        this.created = created
        this.T = T
        this.miner = miner
        this.note = note
    }

    async validate(){
        // TODO validate block

        // here to validate basics of the block
        // your code here...

        if (this.T != "00000000abc00000000000000000000000000000000000000000000000000000") {
            throw new AnnotatedError('INVALID_FORMAT', `Target isn't set to ...00abc00...`)
        }
        if (this.objectid > this.T) {
            throw new AnnotatedError('INVALID_BLOCK_POW', `Block ID isn't below target.`)
        }
        const transactions_present = await Promise.all(
            this.transactions.map(async (transaction) => {
                const present = await ObjectStorage.exists(transaction)
                if (!present) {
                    network.broadcast({
                        type: 'getobject',
                        objectid: transaction
                    })
                }
                return present
            })
        )
        var missing_tx: string[] = [];
        transactions_present.forEach((has_tx_id, tx_idx) => {
            if (!has_tx_id) {
                missing_tx.push(this.transactions[tx_idx])
            }
        })
        if (missing_tx.length > 0) {
            await delay(TIMEOUT_DELAY);
        }
        const transactoins_present_final = await Promise.all(
            missing_tx.map(async (tx) => {
                const present = await ObjectStorage.exists(tx)
                return present
            })
        )
        transactoins_present_final.forEach((has_tx, tx_idx) => {
            if (!has_tx) {
                throw new AnnotatedError('UNFINDABLE_OBJECT', `Cannot find tx ${missing_tx[tx_idx]}.`)
            }
        })

        // validate UTXO
        UTXOManager.extendUTXO(this.objectid)

    }
}