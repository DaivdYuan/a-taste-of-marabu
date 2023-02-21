import { Block } from "./block";
import { logger } from "./logger";

class ChainManager { 
    longestChainHeight: number = 0
    longestChainTip: Block | null = null

    async onValidBlockArrival(block: Block) {
        const height = await block.getHeight()

        if (height === null) {
            return
        }
        if (height > this.longestChainHeight) {
            logger.debug(`New longest chain has height ${height} and tip ${block.blockid}`)
            this.longestChainHeight = height
            this.longestChainTip = block
        }
    }
}

export const chainManager = new ChainManager()