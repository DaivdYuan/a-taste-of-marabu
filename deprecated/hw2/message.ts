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
  outputs: Array(Record({
    pubkey: String.withConstraint(x => x.length === 64),
    value: Number.withConstraint(x => x >= 0)
  }))
}).And(Record({
    inputs: Array(Record({
      outpoint: Record({
        txid: String.withConstraint(x => x.length === 64),
        index: Number.withConstraint(x => x >= 0 && x < 2**32)
    }),
    sig: Union(String.withConstraint(x => x.length > 0), Null)
    })),
  }).Or(Record({
      height: Number,
  }))
) // for And

export type TransactionType = Static<typeof Transaction>

export const Block = Record({
  type: Literal('block'), 
  txids: Array(String),
  nonce: String.withConstraint(x => x.length === 64),
  previd: Union(String.withConstraint(x => x.length === 64),Null),
  created: Number.withConstraint(x => x >= 0 && x < 2**32),
  T: String.withConstraint(x => x.length === 64),
}).And(Partial({
  //optional
  miner: String.withConstraint(x => x.length <= 128),
  studentids: Array(String).withConstraint(x => x.length <= 10), 
  note: String.withConstraint(x => x.length <= 128)
}))
export type BlockType = Static<typeof Block>


export const ChainObject = Union(Block, Transaction)
export const ObjectMessage = Record({
  type: Literal('object'),
  object: ChainObject
})
export type ChainObjectType = Static<typeof ChainObject>
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
