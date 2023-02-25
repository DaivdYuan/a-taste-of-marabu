import { Transaction } from './transaction';
import { Block } from "./block";
import { logger } from "./logger";

class MempoolManager{
    longestChainHeight: number = 0
    longestChainTip: Block | null = null
    txs: Transaction[] = []

}

export const mempoolManager = new MempoolManager()