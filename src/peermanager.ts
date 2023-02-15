import { db } from './object'
import { logger } from './logger'
import isValidHostname from 'is-valid-hostname'

const BOOTSTRAP_PEERS: string[] = ['45.63.84.226:18018', '45.63.89.228:18018', '144.202.122.8:18018']

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
    logger.info(`Known peers: ${this.knownPeers.size}`)
  }
  peerFailed(peerAddr: string) {
    logger.warn(`Removing known peer, as it is considered faulty`)
    this.knownPeers.delete(peerAddr)
    this.store() // intentionally delayed await
    logger.info(`Known peers: ${this.knownPeers.size}`)
  }
}

export const peerManager = new PeerManager()
