import { logger } from './logger'
import {  BlockType, TransactionType } from './message'
import { ObjectManager, objectManager } from './objectmanager'
import { canonicalize } from 'json-canonicalize'
import * as blake2 from 'blake2'


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

function transaction_validate(tx:TransactionType): boolean {


    return false
}