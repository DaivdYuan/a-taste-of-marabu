import { ObjectId, ObjectStorage } from "./store"
import { Block } from "./Block"
import { Transaction } from "./transaction"
import { AnnotatedError } from "./message"

export class UTXO {
    lastBlockid: ObjectId | null = null

    async getCurrentSet() {
        return UTXO.getUTXObyId(this.lastBlockid)
    }

    async extendUTXO(blockid: ObjectId): Promise<string[]> {
        const block = await Block.byId(blockid)
        if (block.previousBlock !== this.lastBlockid) {
            console.log("Not extending on the last block")
            return []
        }
        await block.validate()
        let newUTXO = await UTXO.getUTXObyId(this.lastBlockid)
        for (const txid of block.transactions) {
            const tx = await Transaction.byId(txid)
            await tx.validate()
            const txInputs = tx.inputs;
            for (const txInput of txInputs) {
                const txInputId = txInput.outpoint.txid;
                const prevTx = await Transaction.byId(txInputId);
                await prevTx.validate();
                if (!newUTXO.includes(txInputId)) {
                    throw new AnnotatedError('INVALID_TX_OUTPOINT', `Transaction ${txInputId} is not in the UTXO set`)
                }
                newUTXO = newUTXO.filter((id) => id !== txInputId)
            }
            newUTXO.push(txid)
        }
        this.lastBlockid = blockid
        ObjectStorage.putUTXO(this.lastBlockid, newUTXO)
        return newUTXO
    }

    static async getUTXObyId(blockid: ObjectId | null): Promise<ObjectId[]> {
        if (blockid === null) {
            console.log("No UTXO set for null blockid")
            return []
        }
        return await ObjectStorage.getUTXO(blockid)
    }
}
export const UTXOManager = new UTXO()