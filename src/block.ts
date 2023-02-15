import { BlockObject, BlockObjectType,
         TransactionObject, ObjectType, AnnotatedError } from './message'
import { hash } from './crypto/hash'
import { canonicalize } from 'json-canonicalize'
import { Peer } from './peer'
import { objectManager, ObjectId, db } from './object'
import util from 'util'
import { UTXOSet } from './utxo'
import { logger } from './logger'
import { Transaction } from './transaction'

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
const BU = 10**12
const BLOCK_REWARD = 50 * BU

export class Block {
  previd: string | null
  txids: ObjectId[]
  nonce: string
  T: string
  created: number
  miner: string | undefined
  note: string | undefined
  studentids: string[] | undefined
  blockid: string
  fees: number | undefined
  
  public static async fromNetworkObject(object: BlockObjectType): Promise<Block> {
    return new Block(
      object.previd,
      object.txids,
      object.nonce,
      object.T,
      object.created,
      object.miner,
      object.note,
      object.studentids
    )
  }
  constructor(
    previd: string | null,
    txids: string[],
    nonce: string,
    T: string,
    created: number,
    miner: string | undefined,
    note: string | undefined,
    studentids: string[] | undefined
  ) {
    this.previd = previd
    this.txids = txids
    this.nonce = nonce
    this.T = T
    this.created = created
    this.miner = miner
    this.note = note
    this.studentids = studentids
    this.blockid = hash(canonicalize(this.toNetworkObject()))
  }
  async loadStateAfter(): Promise<UTXOSet | undefined> {
    try {
      return new UTXOSet(new Set<string>(await db.get(`blockutxo:${this.blockid}`)))
    }
    catch (e) {
      return
    }
  }
  async getCoinbase(): Promise<Transaction> {
    if (this.txids.length === 0)  {
      throw new Error('The block has no coinbase transaction')
    }
    const txid = this.txids[0]
    logger.debug(`Checking whether ${txid} is the coinbase`)
    const obj = await objectManager.get(txid)

    if (!TransactionObject.guard(obj)) {
      throw new Error('The block contains non-transaction txids')
    }

    const tx: Transaction = Transaction.fromNetworkObject(obj)

    if (tx.isCoinbase()) {
      return tx
    }
    throw new Error('The block has no coinbase transaction')
  }
  toNetworkObject() {
    const netObj: BlockObjectType = {
      type: 'block',
      previd: this.previd,
      txids: this.txids,
      nonce: this.nonce,
      T: this.T,
      created: this.created,
      miner: this.miner,
    }

    if (this.note !== undefined) {
      netObj.note = this.note
    }
    if (this.studentids !== undefined) {
      netObj.studentids = this.studentids
    }
    return netObj
  }
  hasPoW(): boolean {
    return BigInt(`0x${this.blockid}`) <= BigInt(`0x${TARGET}`)
  }
  isGenesis(): boolean {
    return this.previd === null
  }
  async getTxs(peer?: Peer): Promise<Transaction[]> {
    const txPromises: Promise<ObjectType>[] = []
    let maybeTransactions: ObjectType[] = []
    const txs: Transaction[] = []

    for (const txid of this.txids) {
      if (peer === undefined) {
        txPromises.push(objectManager.get(txid))
      }
      else {
        txPromises.push(objectManager.retrieve(txid, peer))
      }
    }
    try {
      maybeTransactions = await Promise.all(txPromises)
    }
    catch (e) {
      throw new AnnotatedError('UNFINDABLE_OBJECT', `Retrieval of transactions of block ${this.blockid} failed; rejecting block`)
    }
    logger.debug(`We have all ${this.txids.length} transactions of block ${this.blockid}`)
    for (const maybeTx of maybeTransactions) {
      if (!TransactionObject.guard(maybeTx)) {
        throw new AnnotatedError('UNFINDABLE_OBJECT', `Block reports a transaction with id ${objectManager.id(maybeTx)}, but this is not a transaction.`)
      }
      const tx = Transaction.fromNetworkObject(maybeTx)
      txs.push(tx)
    }

    return txs
  }
  async validateTx(peer: Peer, stateBefore: UTXOSet) {
    logger.debug(`Validating ${this.txids.length} transactions of block ${this.blockid}`)

    const stateAfter = stateBefore.copy()

    const txs = await this.getTxs(peer)

    for (let idx = 0; idx < txs.length; idx++) {
      await txs[idx].validate(idx, this)
    }

    await stateAfter.applyMultiple(txs, this)
    logger.debug(`UTXO state of block ${this.blockid} calculated`)

    let fees = 0
    for (const tx of txs) {
      if (tx.fees === undefined) {
        throw new AnnotatedError('INTERNAL_ERROR', `Transaction fees not calculated`)
      }
      fees += tx.fees
    }
    this.fees = fees

    let coinbase

    try {
      coinbase = await this.getCoinbase()
    }
    catch (e) {}

    if (coinbase !== undefined) {
      if (coinbase.outputs[0].value > BLOCK_REWARD + fees) {
        throw new AnnotatedError('INVALID_BLOCK_COINBASE',`Coinbase transaction does not respect macroeconomic policy. `
                      + `Coinbase output was ${coinbase.outputs[0].value}, while reward is ${BLOCK_REWARD} and fees were ${fees}.`)
      }
    }

    await db.put(`blockutxo:${this.blockid}`, Array.from(stateAfter.outpoints))
    logger.debug(`UTXO state of block ${this.blockid} cached: ${JSON.stringify(Array.from(stateAfter.outpoints))}`)
  }
  async validateAncestry(peer: Peer): Promise<Block | null> {
    if (this.previd === null) {
      // genesis
      return null
    }

    let parentBlock: Block
    try {
      logger.debug(`Retrieving parent block of ${this.blockid} (${this.previd})`)
      const parentObject = await objectManager.retrieve(this.previd, peer)

      if (!BlockObject.guard(parentObject)) {
        throw new AnnotatedError('UNFINDABLE_OBJECT', `Got parent of block ${this.blockid}, but it was not of BlockObject type; rejecting block.`)
      }
      parentBlock = await Block.fromNetworkObject(parentObject)
      await parentBlock.validate(peer)
    }
    catch (e: any) {
      throw new AnnotatedError('UNFINDABLE_OBJECT', `Retrieval of block parent for block ${this.blockid} failed; rejecting block: ${e.message}`)
    }
    return parentBlock
  }
  async validate(peer: Peer) {
    logger.debug(`Validating block ${this.blockid}`)

    try {
      if (this.T !== TARGET) {
        throw new AnnotatedError('INVALID_FORMAT', `Block ${this.blockid} does not specify the fixed target ${TARGET}, but uses target ${this.T} instead.`)
      }
      logger.debug(`Block target for ${this.blockid} is valid`)
      if (!this.hasPoW()) {
        throw new AnnotatedError('INVALID_BLOCK_POW', `Block ${this.blockid} does not satisfy the proof-of-work equation; rejecting block.`)
      }
      logger.debug(`Block proof-of-work for ${this.blockid} is valid`)

      let parentBlock: Block | null = null
      let stateBefore: UTXOSet | undefined

      if (this.isGenesis()) {
        if (!util.isDeepStrictEqual(this.toNetworkObject(), GENESIS)) {
          throw new AnnotatedError('INVALID_FORMAT', `Invalid genesis block ${this.blockid}: ${JSON.stringify(this.toNetworkObject())}`)
        }
        logger.debug(`Block ${this.blockid} is genesis block`)
        // genesis state
        stateBefore = new UTXOSet(new Set<string>())
        logger.debug(`State before block ${this.blockid} is the genesis state`)
      }
      else {
        parentBlock = await this.validateAncestry(peer)

        if (parentBlock === null) {
          throw new AnnotatedError('UNFINDABLE_OBJECT', `Parent block of block ${this.blockid} was null`)
        }

        // this block's starting state is the previous block's ending state
        stateBefore = await parentBlock.loadStateAfter()
        logger.debug(`Loaded state before block ${this.blockid}`)
      }
      logger.debug(`Block ${this.blockid} has valid ancestry`)

      if (stateBefore === undefined) {
        throw new AnnotatedError('UNFINDABLE_OBJECT', `We have not calculated the state of the parent block,`
                      + `so we cannot calculate the state of the current block with blockid = ${this.blockid}`)
      }

      logger.debug(`State before block ${this.blockid} is ${stateBefore}`)

      await this.validateTx(peer, stateBefore)
      logger.debug(`Block ${this.blockid} has valid transactions`)
    }
    catch (e: any) {
      throw e
    }
  }
}
