import { Literal,
         Record, Array, Union,
         String, Number,
         Static, Null, Unknown, Optional } from 'runtypes'
import { logger } from './logger'

const Hash = String.withConstraint(s => /^[0-9a-f]{64}$/.test(s))
const Sig = String.withConstraint(s => /^[0-9a-f]{128}$/.test(s))
const PK = String.withConstraint(s => /^[0-9a-f]{64}$/.test(s))
const NonNegative = Number.withConstraint(n => n >= 0 && global.Number.isInteger(n))
const Coins = NonNegative
const ErrorChoices = Union(
  Literal('INTERNAL_ERROR'),
  Literal('INVALID_FORMAT'),
  Literal('UNKNOWN_OBJECT'),
  Literal('UNFINDABLE_OBJECT'),
  Literal('INVALID_HANDSHAKE'),
  Literal('INVALID_TX_OUTPOINT'),
  Literal('INVALID_TX_SIGNATURE'),
  Literal('INVALID_TX_CONSERVATION'),
  Literal('INVALID_BLOCK_COINBASE'),
  Literal('INVALID_BLOCK_TIMESTAMP'),
  Literal('INVALID_BLOCK_POW'),
  Literal('INVALID_GENESIS')
)

export const ErrorMessage = Record({
  type: Literal('error'),
  name: ErrorChoices,
  description: String
})
export type ErrorMessageType = Static<typeof ErrorMessage>
export type ErrorChoice = Static<typeof ErrorChoices>

export class AnnotatedError extends Error {
  err = ""
  constructor(name: ErrorChoice, description: string) {
    super(description)
    this.name = name
    Object.setPrototypeOf(this, AnnotatedError.prototype)
  }

  getJSON() {
    const jsonError = {type: "error", name: this.name, description: this.message}
    if (ErrorMessage.guard(jsonError)) {
      return jsonError
    }else {
      return {type: "error", name: "INTERNAL_ERROR", description: "Something went wrong."}
    }
  }
}

export const OutpointObject = Record({
  txid: Hash,
  index: NonNegative
})
export type OutpointObjectType = Static<typeof OutpointObject>

export const TransactionInputObject = Record({
  outpoint: OutpointObject,
  sig: Union(Sig, Null)
})
export type TransactionInputObjectType = Static<typeof TransactionInputObject>

export const TransactionOutputObject = Record({
  pubkey: PK,
  value: Coins
})
export type TransactionOutputObjectType = Static<typeof TransactionOutputObject>

export const CoinbaseTransactionObject = Record({
  type: Literal('transaction'),
  outputs: Array(TransactionOutputObject).withConstraint(a => a.length <= 1),
  height: NonNegative
})
export const SpendingTransactionObject = Record({
  type: Literal('transaction'),
  inputs: Array(TransactionInputObject),
  outputs: Array(TransactionOutputObject)
})
export const TransactionObject = Union(CoinbaseTransactionObject, SpendingTransactionObject)
export type TransactionObjectType = Static<typeof TransactionObject>
export const HumanReadable = String.withConstraint(
  s =>
  s.length <= 128 &&
  s.match(/^[ -~]+$/) !== null // ASCII-printable
)

export const BlockObject = Record({
  type: Literal('block'),
  txids: Array(Hash),
  nonce: String,
  previd: Union(Hash, Null),
  created: NonNegative,
  T: Hash,
  miner: Optional(HumanReadable),
  note: Optional(HumanReadable),
  studentids: Optional(Array(String))
})
export type BlockObjectType = Static<typeof BlockObject>

export const HelloMessage = Record({
  type: Literal('hello'),
  version: String,
  agent: String
})
export type HelloMessageType = Static<typeof HelloMessage>

export const GetPeersMessage = Record({
  type: Literal('getpeers')
})
export type GetPeersMessageType = Static<typeof GetPeersMessage>

export const PeersMessage = Record({
  type: Literal('peers'),
  peers: Array(String)
})
export type PeersMessageType = Static<typeof PeersMessage>

export const GetObjectMessage = Record({
  type: Literal('getobject'),
  objectid: Hash
})
export type GetObjectMessageType = Static<typeof GetObjectMessage>

export const IHaveObjectMessage = Record({
  type: Literal('ihaveobject'),
  objectid: Hash
})
export type IHaveObjectMessageType = Static<typeof IHaveObjectMessage>

export const ObjectTxOrBlock = Union(TransactionObject, BlockObject)
export type ObjectType = Static<typeof ObjectTxOrBlock>

export const ObjectMessage = Record({
  type: Literal('object'),
  object: ObjectTxOrBlock
})
export type ObjectMessageType = Static<typeof ObjectMessage>

export const GetChainTipMessage = Record({
  type: Literal('getchaintip')
})
export type GetChainTipMessageType = Static<typeof GetChainTipMessage>

export const ChainTipMessage = Record({
  type: Literal('chaintip'),
  blockid: Hash
})
export type ChainTipMessageType = Static<typeof ChainTipMessage>

export const GetMempoolMessage = Record({
  type: Literal('getmempool')
})
export type GetMemPoolMessageType = Static<typeof GetMempoolMessage>

export const MempoolMessage = Record({
  type: Literal('mempool'),
  txids: Array(String)
})
export type MempoolMessageType = Static<typeof MempoolMessage>

export const Messages = [
  HelloMessage,
  GetPeersMessage, PeersMessage,
  IHaveObjectMessage, GetObjectMessage, ObjectMessage,
  GetChainTipMessage, ChainTipMessage,
  GetMempoolMessage, MempoolMessage,
  ErrorMessage
]
export const Message = Union(
  HelloMessage,
  GetPeersMessage, PeersMessage,
  IHaveObjectMessage, GetObjectMessage, ObjectMessage,
  GetChainTipMessage, ChainTipMessage,
  GetMempoolMessage, MempoolMessage,
  ErrorMessage
)
export type MessageType = Static<typeof Message>
