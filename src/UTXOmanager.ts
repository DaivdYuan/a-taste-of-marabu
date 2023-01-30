import { ObjectId, ObjectStorage } from "./store"
import { Block } from "./Block"
import { Transaction } from "./transaction"
import { AnnotatedError } from "./message"

export class UTXO {
    txids: ObjectId[] = []
    lastBlockid: ObjectId | null = null

    async getSet() {
        return this.txids
    }

    async extendUTXO(blockid: ObjectId) {
        const block = await Block.byId(blockid)
        if (block.previousBlock !== this.lastBlockid) {
            console.log("Not extending on the last block")
            return
        }
        await block.validate()
        let newUTXO = this.txids.slice()
        for (const txid of block.transactions) {
            const tx = await Transaction.byId(txid)
            await tx.validate()
            const txInputs = tx.inputs;
            for (const txInput of txInputs) {
                const txInputId = txInput.outpoint.txid;
                const prevTx = await Transaction.byId(txInputId);
                await prevTx.validate();
                if (!this.txids.includes(txInputId)) {
                    throw new AnnotatedError('INVALID_TX_OUTPOINT', `Transaction ${txInputId} is not in the UTXO set`)
                }
                newUTXO = newUTXO.filter((id) => id !== txInputId)
            }
            newUTXO.push(txid)
        }
        this.txids = newUTXO
        this.lastBlockid = blockid
        ObjectStorage.putUTXO(this.lastBlockid, this.txids)
    }

    static async getFormerUTXObyId(blockid: ObjectId): Promise<ObjectId[]> {
        const block = await Block.byId(blockid)
        if (block.previousBlock === null) {
            return []
        }
        return await ObjectStorage.getUTXO(block.previousBlock)
    }

    static async getUTXObyId(blockid: ObjectId): Promise<ObjectId[]> {
        return await ObjectStorage.getUTXO(blockid)
    }
}