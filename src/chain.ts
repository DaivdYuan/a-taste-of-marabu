import { Block } from "./block";
import { logger } from "./logger";
import { ObjectTxOrBlock, ObjectType,
    TransactionObjectType, BlockObjectType, AnnotatedError } from './message'
import { objectManager } from './object'
import { hash } from './crypto/hash'
import { canonicalize } from 'json-canonicalize'

class ChainManager { 
    longestChainHeight: number = 0
    longestChainTipHash: string;

    async onValidBlockArrival(block: Block) {
        const height = await block.getHeight()

        if (height === null) {
            return
        }
        if (height > this.longestChainHeight) {
            logger.debug(`New longest chain has height ${height} and tip ${block.blockid}`)
            this.longestChainHeight = height
            this.longestChainTipHash = objectManager.id(block.toNetworkObject())
        }
    }

    constructor() {
        const TARGET = '00000000abc00000000000000000000000000000000000000000000000000000'
        const GENESIS: BlockObjectType = {
          T: TARGET,
          created: 1671062400,
          miner: 'Marabu',
          nonce: '000000000000000000000000000000000000000000000000000000021bea03ed',
          note: 'The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers',
          previd: null,
          txids: [],
          type: 'block'
        }
        this.longestChainTipHash = hash(canonicalize(GENESIS))
    }
}

export const chainManager = new ChainManager()