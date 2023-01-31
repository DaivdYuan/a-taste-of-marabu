import { ObjectId, ObjectStorage } from "./store";
import { AnnotatedError, BlockObjectType, TransactionInputObjectType, TransactionObjectType, TransactionOutputObjectType, OutpointObjectType, SpendingTransactionObject } from "./message";
import { UTXOManager } from "./UTXOmanager";
import { network } from './network'
import { Transaction } from './transaction'
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

    // checking two things here: Block Validation 7. & 8.
    async resolveCoinbase(transactions: Transaction[]) {
        var coinbaseTx_hash: string | null = null;
        transactions.forEach((tx, tx_idx) => {
            if (tx.height != null) { // this is a coinbase tx
                if (tx_idx != 0) { // coinbase tx can only have tx_idx 0, i.e. be the first tx
                    throw new AnnotatedError('INVALID_BLOCK_COINBASE', `Coinbase tx appeared @ ${tx_idx}`)
                } else { // valid coinbase tx
                    coinbaseTx_hash = tx.txid
                }
            } else { // verify Block Validation 8
                if (coinbaseTx_hash != null) {
                    var spend_tx_hashes = tx.inputs.map((input, input_idx)=>{
                        return input.outpoint.txid
                    })
                    if (spend_tx_hashes.includes(coinbaseTx_hash)) {
                        throw new AnnotatedError('INVALID_TX_OUTPOINT', 'Detect spending Coinbase Tx @ ${tx_idx}')
                    }
                }
            }
        })
    }

    async resolve(transactions: ObjectId[]) {
        const transactions_present = await Promise.all(
            transactions.map(async (transaction) => {
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
                missing_tx.push(transactions[tx_idx])
            }
        })
        if (missing_tx.length > 0) {
            await delay(TIMEOUT_DELAY);
        }
        const transactoins_present_final_check = await Promise.all(
            missing_tx.map(async (tx) => {
                const present = await ObjectStorage.exists(tx)
                return present
            })
        )
        transactoins_present_final_check.forEach((has_tx, tx_idx) => {
            if (!has_tx) {
                throw new AnnotatedError('UNFINDABLE_OBJECT', `Cannot find tx ${missing_tx[tx_idx]}.`)
            }
        })
        return true
    }

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
        await this.resolve(this.transactions)
        var transactions_arr: Transaction[] = [];
        for (const tx of this.transactions){
            try {
                const curr_tx = Transaction.fromNetworkObject(await ObjectStorage.get(tx))
                transactions_arr.push(curr_tx)
                await curr_tx.validate()
            }
            catch (e: any) {
                throw new AnnotatedError('UNFINDABLE_OBJECT', `Transaction invalid: id-${tx}.`)
            }
        }
        await this.resolveCoinbase(transactions_arr)

        // validate UTXO
        UTXOManager.extendUTXO(this.objectid)

    }
}