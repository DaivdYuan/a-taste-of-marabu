import { Literal, Number, Record, String, Array, Union, Static, Tuple, Partial, BigInt, Null } from 'runtypes'

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

export const GetObjectMessage = Record({
  type: Literal('getobject'),
  objectid: String
})
export type GetObjectMessageType = Static<typeof GetObjectMessage>

export const IHaveObjectMessage = Record({
  type: Literal('ihaveobject'),
  objectid: String
})
export type IHaveObjectMessageType = Static<typeof IHaveObjectMessage>

export const Transaction = Record({
  type: Literal('transaction'),
  inputs: Array(Record({
    outpoint: Record({
      txid: String.withConstraint(x => x.length === 64),
      index: Number
    }),
    sig: Union(String, Null)
  })),
  outputs: Array(Record({
    pubkey: String.withConstraint(x => x.length === 64),
    value: BigInt
  }))
})
export type TransactionType = Static<typeof Transaction>

export const Block = Record({
  object: Literal('block'), 
  txids: Array(String),
  nonce: String.withConstraint(x => x.length === 64),
  previd: String.withConstraint(x => x.length === 64),
  created: Number,
  T: String.withConstraint(x => x.length === 64),
}).And(Partial({
  //optional
  miner: String.withConstraint(x => x.length <= 128),
  studentids: Array(String).withConstraint(x => x.length <= 10), 
  note: String.withConstraint(x => x.length <= 128)
}))
export type BlockType = Static<typeof Block>

export const GenesisBlock = Record({
  object: Literal('block'),
  txids: Array(String),
  nonce: Literal('000000000000000000000000000000000000000000000000000000021bea03ed'),
  previd: Null,
  created: Literal(1671062400),
  T: Literal('00000000abc00000000000000000000000000000000000000000000000000000'),
  miner: Literal('Marabu'),
  note: Literal('The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers')
})
export type GenesisBlockType = Static<typeof GenesisBlock>

export const ObjectMessage = Record({
  type: Literal('object'),
  object: Union(Block, Transaction, GenesisBlock)
})
export type ObjectMessageType = Static<typeof ObjectMessage>

////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////

export const Message = Union(HelloMessage, GetPeersMessage, PeersMessage, ErrorMessage, GetObjectMessage, IHaveObjectMessage, ObjectMessage)
export type MessageType = Static<typeof Message>

export const Messages = [HelloMessage, GetPeersMessage, PeersMessage, ErrorMessage, GetObjectMessage, IHaveObjectMessage, ObjectMessage]
