import { ObjectId, ObjectStorage } from "./store";
import { AnnotatedError, BlockObjectType, TransactionInputObjectType, TransactionObjectType, TransactionOutputObjectType, OutpointObjectType, SpendingTransactionObject } from "./message";
import { UTXOManager } from "./UTXOmanager";

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

        // validate UTXO
        UTXOManager.extendUTXO(this.objectid)

    }
}