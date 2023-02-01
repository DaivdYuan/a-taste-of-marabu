import { ObjectId, ObjectStorage } from "./store"
import { Block } from "./block"
import { Transaction } from "./transaction"
import { AnnotatedError } from "./message"

export class UTXO {
    async extendUTXO(block: Block): Promise<string[]> {
        const blockid = block.objectid
        console.log("Extending UTXO set with block %s", blockid)
        if (!await UTXO.existUTXObyId(block.previousBlock)) {
            console.info("Previous block %s is not in the UTXO set", block.previousBlock)
            return []
        }
        if (await UTXO.existUTXObyId(blockid)) {
            console.info("Block %s is already in the UTXO set", blockid)
            return []
        }
        let newUTXO = await UTXO.getUTXObyId(block.previousBlock)
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
        ObjectStorage.putUTXO(blockid, newUTXO)
        return newUTXO
    }

    static async getUTXObyId(blockid: ObjectId | null): Promise<ObjectId[]> {
        if (blockid === null) {
            console.log("No UTXO set for null blockid")
            return []
        }
        return await ObjectStorage.getUTXO(blockid)
    }

    static async existUTXObyId(blockid: ObjectId | null): Promise<boolean> {
        if (blockid === null) {
            return true
        }
        return await ObjectStorage.existUTXO(blockid)
    }
}
export const UTXOManager = new UTXO()