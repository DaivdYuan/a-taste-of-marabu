import { logger } from './logger'
import {  BlockType, TransactionType, Transaction } from './message'
import { ObjectManager, objectManager } from './objectmanager'
import { canonicalize } from 'json-canonicalize'
import * as blake2 from 'blake2'
import * as ed from '@noble/ed25519';
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
    let ret:TransactionType = Object.create(tx)
    assert("inputs" in ret)
    for (let input of ret.inputs)
        input.sig = null;
    return ret
}

export async function block_validate(tx:BlockType): Promise<boolean> {
    // you may consider blocks and coinbase transactions to always be valid
    return true
}

// const fromHexString = (hexString: string | null) =>
//   Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

export async function transaction_validate(tx:TransactionType): Promise<boolean> {
    if ("height" in tx) {
        // coinbase
        // you may consider blocks and coinbase transactions to always be valid
        return true
    }
    let msg = canonicalize(removeAllSigHex(tx))
    for (let input of tx.inputs)
    {
        if (!await objectManager.haveObjectID(input.outpoint.txid)) {
            logger.debug(`We dont't have transction input.`)
            return false;
        }
        let prev_tx = Transaction.check(await objectManager.getObject(input.outpoint.txid))
        let pubkey = prev_tx.outputs[input.outpoint.index].pubkey
        let result = await ed.verify(input.sig??"__NULL__", msg, pubkey)
        if (!result) return false;
    }
    return true
}