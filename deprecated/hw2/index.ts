import { logger } from './logger'
import { Network } from './network'

const BIND_PORT = 18018
const BIND_IP = '0.0.0.0'

logger.info(`Malibu - A Marabu node`)
logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`)

const network = new Network()
network.init(BIND_PORT, BIND_IP)
