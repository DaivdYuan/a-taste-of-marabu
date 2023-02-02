import { logger } from './logger'
import { argv } from 'process'

export const TESTING_MODE = argv.indexOf('--test') > 0
if (TESTING_MODE) {
    logger.warn("!!!!! YOU ARE IN TESTING MODE !!!!!")
}

import { network } from './network'

const BIND_PORT = 18018
const BIND_IP = '0.0.0.0'

logger.info(`Malibu - A Marabu node`)
logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`)




network.init(BIND_PORT, BIND_IP, TESTING_MODE)
