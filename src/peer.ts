import { logger } from './logger'
import { MessageSocket } from './network'
import semver from 'semver'
import { Messages, ChainObject,
         Message, HelloMessage, PeersMessage, GetPeersMessage, ErrorMessage, GetObjectMessage, IHaveObjectMessage, ObjectMessage,
         MessageType, HelloMessageType, PeersMessageType, GetPeersMessageType, ErrorMessageType, GetObjectMessageType, IHaveObjectMessageType, ObjectMessageType,
         AnnotatedError 
        } from './message'
import { peerManager } from './peermanager'
import { ObjectManager, objectManager } from './objectmanager'
import { canonicalize } from 'json-canonicalize'
import { EventEmitter } from 'events'
import { block_validate, transaction_validate } from './validation'

const VERSION = '0.9.0'
const NAME = 'Malibu (pset1)'

export class Peer extends EventEmitter{
  active: boolean = false
  socket: MessageSocket
  handshakeCompleted: boolean = false

  async sendHello() {
    this.sendMessage({
      type: 'hello',
      version: VERSION,
      agent: NAME
    })
  }
  async sendGetPeers() {
    this.sendMessage({
      type: 'getpeers'
    })
  }
  async sendPeers() {
    this.sendMessage({
      type: 'peers',
      peers: [...peerManager.knownPeers]
    })
  }
  async sendError(err: AnnotatedError) {
    try {
      this.sendMessage(err.getJSON())
    } catch (error) {
      this.sendMessage(new AnnotatedError('INTERNAL_ERROR', `Failed to serialize error message: ${error}`).getJSON())
    }
  }
  async sendGetObject(objectid: string) {
    this.sendMessage({
      type: 'getobject',
      objectid: objectid
    })
  }
  async sendIHaveObject(objectid: string) {
    this.sendMessage({
      type: 'ihaveobject',
      objectid: objectid
    })
  }
  async sendObject(objectid: string) {
    this.sendMessage({
      type: 'object',
      object: await objectManager.getObject(objectid),
    })
  }
  sendMessage(obj: object) {
    const message: string = canonicalize(obj)

    this.debug(`Sending message: ${message}`)
    this.socket.sendMessage(message)
  }
  async fatalError(err: AnnotatedError) {
    await this.sendError(err)
    this.warn(`Peer error: ${err}`)
    this.active = false
    this.socket.end()
  }
  async onConnect() {
    this.active = true
    await this.sendHello()
    await this.sendGetPeers()
  }
  async onTimeout() {
    return await this.fatalError(new AnnotatedError('INVALID_FORMAT', 'Timed out before message was complete'))
  }
  async onMessage(message: string) {
    this.debug(`Message arrival: ${message}`)

    let msg: object

    try {
      msg = JSON.parse(message)
      this.debug(`Parsed message into: ${JSON.stringify(msg)}`)
    }
    catch {
      return await this.fatalError(new AnnotatedError('INVALID_FORMAT', `Failed to parse incoming message as JSON: ${message}`))
    }
    if (!Message.guard(msg)) {
      return await this.fatalError(new AnnotatedError('INVALID_FORMAT', `The received message does not match one of the known message formats: ${message}`))
    }
    if (!this.handshakeCompleted) {
      if (HelloMessage.guard(msg)) {
        return this.onMessageHello(msg)
      }
      return await this.fatalError(new AnnotatedError('INVALID_HANDSHAKE', `Received message ${message} prior to "hello"`))
    }

    Message.match(
      async () => {
        return await this.fatalError(new AnnotatedError('INVALID_HANDSHAKE', `Received a second "hello" message, even though handshake is completed`))
      },
      this.onMessageGetPeers.bind(this),
      this.onMessagePeers.bind(this),
      this.onMessageError.bind(this),
      this.onMessageGetObject.bind(this),
      this.onMessageIHaveObject.bind(this),
      this.onMessageObject.bind(this),
    )(msg)
  }
  async onMessageHello(msg: HelloMessageType) {
    if (!semver.satisfies(msg.version, `^${VERSION}`)) {
      return await this.fatalError(new AnnotatedError('INVALID_FORMAT', `You sent an incorrect version (${msg.version}), which is not compatible with this node's version ${VERSION}.`))
    }
    this.info(`Handshake completed. Remote peer running ${msg.agent} at protocol version ${msg.version}`)
    this.handshakeCompleted = true
  }
  async onMessagePeers(msg: PeersMessageType) {
    for (const peer of msg.peers) {
      this.info(`Remote party reports knowledge of peer ${peer}`)

      peerManager.peerDiscovered(peer)
    }
  }
  async onMessageGetPeers(msg: GetPeersMessageType) {
    this.info(`Remote party is requesting peers. Sharing.`)
    await this.sendPeers()
  }
  async onMessageError(msg: ErrorMessageType) {
    this.warn(`Peer reported error: ${msg.name}`)
  }
  async onMessageGetObject(msg: GetObjectMessageType) {
    this.info(`Peer requested object ${msg.objectid}`)
    if (await objectManager.haveObjectID(msg.objectid)) {
      this.info(`We have object ${msg.objectid}. Sending.`)
      await this.sendObject(msg.objectid)
    } else {
      this.info(`We do not have object ${msg.objectid}.`)
      return await this.fatalError(new AnnotatedError('UNFINDABLE_OBJECT', `Peer requested object ${msg.objectid} which we do not have`))
    }
  }
  async onMessageIHaveObject(msg: IHaveObjectMessageType) {
    this.info(`Peer reported knowledge of object ${msg.objectid}`)
    if (! await objectManager.haveObjectID(msg.objectid)) {
      this.info(`We do not have object ${msg.objectid}. Requesting.`)
      await this.sendGetObject(msg.objectid)
    }
  }
  async onMessageObject(msg: ObjectMessageType) {
    let objectid = ObjectManager.hashObject(msg.object)
    logger.info(`Peer sent object ${objectid}`)
    if (await objectManager.haveObjectID(objectid)) {
      this.info(`We already have object ${objectid}. Updating.`)
    } else {
      this.info(`We do not have object ${objectid}. Proceeding.`)
    }

    ChainObject.match(
      async (block) => {
        this.info(`Processing BLOCK object`)
        if (await block_validate(block)) {
          this.info(`Storing BLOCK object ${objectid}.`)
          await objectManager.storeObject(msg.object, objectid)
          this.emit("gossiping", objectid)
        }
      },
      async (tx) => {
        this.info(`Processing TRANSACTION object`)
        let validationCode = await transaction_validate(tx)
        switch (validationCode) {
          case 0:
            this.info(`Storing TRANSACTION object ${objectid}.`)
            await objectManager.storeObject(msg.object, objectid)
            this.emit("gossiping", objectid)
            break
          case -1: //unkown object
            this.info(`Transaction ${objectid} references an unknown object.`)
            return await this.fatalError(new AnnotatedError('UNKNOWN_OBJECT', `Transaction ${objectid} references an unknown object.`))
          case -2: //invalid signature
            this.info(`Transaction ${objectid} has an invalid signature.`)
            return await this.fatalError(new AnnotatedError('INVALID_TX_SIGNATURE', `Transaction ${objectid} has an invalid signature.`))
          case -3: //invalid outpoint range
            this.info(`Transaction ${objectid} has an invalid outpoint.`)
            return await this.fatalError(new AnnotatedError('INVALID_TX_OUTPOINT', `Transaction ${objectid} has an invalid outpoint range.`))
          case -4: //violation of conservation of value
            this.info(`Transaction ${objectid} violates conservation of value.`)
            return await this.fatalError(new AnnotatedError('INVALID_TX_CONSERVATION', `Transaction ${objectid} violates conservation of value.`))
          case -5: //other errors
            this.info(`Transaction ${objectid} is invalid.`)
            return await this.fatalError(new AnnotatedError('INVALID_FORMAT', `Transaction ${objectid} is invalid.`))
        }
      }
    )(msg.object)
  }

  log(level: string, message: string) {
    logger.log(level, `[peer ${this.socket.peerAddr}:${this.socket.netSocket.remotePort}] ${message}`)
  }
  warn(message: string) {
    this.log('warn', message)
  }
  info(message: string) {
    this.log('info', message)
  }
  debug(message: string) {
    this.log('debug', message)
  }
  constructor(socket: MessageSocket) {
    super()
    this.socket = socket

    socket.netSocket.on('connect', this.onConnect.bind(this))
    socket.netSocket.on('error', err => {
      this.warn(`Socket error: ${err}`)
    })
    socket.on('message', this.onMessage.bind(this))
    socket.on('timeout', this.onTimeout.bind(this))
  }
}
