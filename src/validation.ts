import { logger } from './logger'
import {  BlockType, TransactionType, Transaction } from './message'
import { ObjectManager, objectManager } from './objectmanager'
import { canonicalize } from 'json-canonicalize'
import * as blake2 from 'blake2'
import * as ed from '@noble/ed25519'
import { match } from 'runtypes'
import assert from 'assert'


const GenesisBlock:BlockType = {
    "T": "00000000abc00000000000000000000000000000000000000000000000000000",
    "created": 1671062400,
    "miner": "Marabu",
    "nonce": "000000000000000000000000000000000000000000000000000000021bea03ed",
    "note": "The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers",
    "previd": null,
    "txids": [],
    "type": "block"
}

objectManager.storeObject(GenesisBlock)

function removeAllSigHex(tx:TransactionType): TransactionType {
    let ret:TransactionType = Object.assign({}, tx)
    assert("inputs" in ret)
    var new_inputs: any = []
    ret.inputs.forEach((input, idx) => {
        assert("inputs" in ret)
        var new_input = Object.assign({}, input)
        new_input.sig = null
        new_inputs.push(new_input)
    })
    ret.inputs = new_inputs
    return ret
}

export async function block_validate(tx:BlockType): Promise<boolean> {
    // you may consider blocks and coinbase transactions to always be valid
    return true
}


export async function transaction_validate(tx:TransactionType): Promise<number> {
    logger.info(`validating transaction`)
    if ("height" in tx) {
        // coinbase
        // you may consider blocks and coinbase transactions to always be valid
        return 0
    }
    try {
        let msg = canonicalize(removeAllSigHex(tx))
        let inputSum = 0
        for (let input of tx.inputs)
        {
            if (!await objectManager.haveObjectID(input.outpoint.txid)) {
                logger.debug(`We dont't have transction input.`)
                return -1 //unknown object
            }
            let prev_tx = Transaction.check(await objectManager.getObject(input.outpoint.txid))
            inputSum += prev_tx.outputs[input.outpoint.index].value
            if (input.outpoint.index > prev_tx.outputs.length - 1) {
                logger.debug(`Indexing out of range with transaction ${prev_tx}.`)
                return -3 //invalid outpoint
            }
            let pubkey = prev_tx.outputs[input.outpoint.index].pubkey
            if (input.sig == null) {
                logger.debug(`signature is null. INVALID_TX_SIGNATURE error`)
                return -2 //invalid signature
            }
            let result = await ed.verify(Uint8Array.from(Buffer.from(input.sig, 'hex')),
                                        Uint8Array.from(Buffer.from(msg)),
                                        Uint8Array.from(Buffer.from(pubkey, 'hex')))
            if (!result) return -2 //invalid signature
        }
        let outputSum = 0
        for (let output of tx.outputs)
        {
            outputSum += output.value
        }
        if (inputSum < outputSum) {
            logger.debug(`inputSum < outputSum. INVALID_TX_AMOUNT error`)
            return -4 //invalid amount
        }
    } catch (e) {
        logger.debug(`transaction validation failed with error ${e}`)
        return -5 //else
    }
    return 0
}