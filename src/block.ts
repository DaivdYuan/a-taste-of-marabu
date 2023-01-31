import { ObjectId, ObjectStorage } from "./store";
import { AnnotatedError, BlockObjectType, TransactionInputObjectType, TransactionObjectType, TransactionOutputObjectType, OutpointObjectType, SpendingTransactionObject } from "./message";
import { UTXOManager } from "./UTXOmanager";
import { network } from './network'
import { Transaction } from './transaction'
import delay from 'delay';

const TIMEOUT_DELAY = 10000
const BLOCK_REWARD = 50 * (10**12)

export class Block {
    objectid: ObjectId
    previousBlock: ObjectId | null
    transactions: ObjectId[] = []
    nonce: string
    created: number
    T: string
    miner: string = ""
    note: string = ""

    // checking two things here: Block Validation 7. & 8. & 9b
    async resolveCoinbase(transactions: Transaction[]) {
        var coinbaseTx_hash: string | null = null;
        var coinbaseTx_value: number | null = null;
        var total_reward: number = BLOCK_REWARD;
        transactions.forEach((tx, tx_idx) => {
            if (tx.height != null) { // this is a coinbase tx
                if (tx_idx != 0) {
                    throw new AnnotatedError('INVALID_BLOCK_COINBASE', `Coinbase tx appeared @ ${tx_idx}`) // Block Validation 7.
                } else {
                    coinbaseTx_hash = tx.txid
                    coinbaseTx_value = tx.outputs[0].value
                }
            } else { // this is a normal transaction
                if (coinbaseTx_hash != null) {
                    var spend_tx_hashes = tx.inputs.map((input, input_idx)=>{
                        return input.outpoint.txid
                    })
                    if (spend_tx_hashes.includes(coinbaseTx_hash)) {
                        throw new AnnotatedError('INVALID_TX_OUTPOINT', 'Detect spending Coinbase Tx @ ${tx_idx}')  // Block Validation 8.
                    }
                }
            }
        })

        // check for 9b
        if (coinbaseTx_value != null) {
            for (const tx of transactions) {
                var rewards_this_tx = await Promise.all(
                    tx.inputs.map(async (input, input_idx) => {
                        const prevOutput = await input.outpoint.resolve()
                        return prevOutput.value
                }))
                let sumInputs = 0
                let sumOutputs = 0
                for (const inputValue of rewards_this_tx) {
                    sumInputs += inputValue
                }
                for (const output of tx.outputs) {
                    sumOutputs += output.value
                }
                let fee = sumInputs - sumOutputs
                total_reward += fee
            }
            if (total_reward < coinbaseTx_value) {
                throw new AnnotatedError('INVALID_BLOCK_COINBASE', `Not observing Law of Conservation in the block.`)
            }
        }
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