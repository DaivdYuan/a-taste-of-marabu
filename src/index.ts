import { logger } from './logger'
import { network } from './network'
import { chainManager } from './chain'
import { mempool } from './mempool'
import { miner } from './miner'
import { AnnotatedError } from './message'

const BIND_PORT = 18018
const BIND_IP = '0.0.0.0'

logger.info(`Malibu - A Marabu node`)
logger.info(`David Yuan, Ende Shen, Betty Wu`)

async function main() {
  await chainManager.init()
  await mempool.init()
  await miner.init()
  network.init(BIND_PORT, BIND_IP)
}

main()
