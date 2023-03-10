import { db } from './object'
import { logger } from './logger'
import isValidHostname from 'is-valid-hostname'

const BOOTSTRAP_PEERS: string[] = ["149.28.200.131:18018","45.63.84.226:18018","45.63.89.228:18018","144.202.122.8:18018","45.63.87.246:18018","54.67.110.108:18018","135.181.112.99:18018","dionyziz.com:18018","139.162.130.195:18018","45.32.141.159:18018","140.82.50.252:18018","149.28.204.235:18018","149.28.220.241:18018","183.173.223.133:18018","138.197.191.170:18018","10.31.225.188:60387","10.31.225.188:60375","10.31.238.80:18018","10.31.225.188:60398","10.31.225.188:60419","10.31.225.188:60447","10.31.225.188:60457","10.31.225.188:60466","10.31.225.188:60482","10.31.225.188:18018","10.31.225.188:60590","10.31.240.47:55101","10.31.225.188:61354","10.128.188.253:62666","128.12.122.218:10042","128.12.122.218:10078"]

class PeerManager {
  knownPeers: Set<string> = new Set()

  async load() {
    try {
      this.knownPeers = new Set(await db.get('peers'))
      logger.debug(`Loaded known peers: ${[...this.knownPeers]}`)
    }
    catch {
      logger.info(`Initializing peers database`)
      this.knownPeers = new Set(BOOTSTRAP_PEERS)
      await this.store()
    }
  }
  async store() {
    await db.put('peers', [...this.knownPeers])
  }
  peerDiscovered(peerAddr: string) {
    const peerParts = peerAddr.split(':')
    if (peerParts.length !== 2) {
      logger.warn(`Remote party reported knowledge of invalid peer ${peerAddr}, which is not in the host:port format; skipping`)
      return
    }
    const [host, portStr] = peerParts
    const port = +portStr

    if (!(port >= 0 && port <= 65535)) {
      logger.warn(`Remote party reported knowledge of peer ${peerAddr} with invalid port number ${port}`)
      return
    }
    if (!isValidHostname(host)) {
      logger.warn(`Remote party reported knowledge of invalid peer ${peerAddr}; skipping`)
      return
    }

    this.knownPeers.add(peerAddr)
    this.store() // intentionally delayed await
    //logger.info(`Known peers: ${this.knownPeers.size}`)
  }
  peerFailed(peerAddr: string) {
    //logger.warn(`Removing known peer, as it is considered faulty`)
    this.knownPeers.delete(peerAddr)
    this.store() // intentionally delayed await
    //logger.info(`Known peers: ${this.knownPeers.size}`)
  }
}

export const peerManager = new PeerManager()
