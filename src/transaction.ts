import { ObjectId, ObjectStorage } from './store'
import { AnnotatedError,
         TransactionInputObjectType,
         TransactionObjectType,
         TransactionOutputObjectType,
         OutpointObjectType,
         SpendingTransactionObject } from './message'
import { PublicKey, Signature, ver } from './crypto/signature'
import { canonicalize } from 'json-canonicalize'

export class Output {
  pubkey: PublicKey
  value: number

  static fromNetworkObject(outputMsg: TransactionOutputObjectType): Output {
    return new Output(outputMsg.pubkey, outputMsg.value)
  }
  constructor(pubkey: PublicKey, value: number) {
    this.pubkey = pubkey
    this.value = value
  }
  toNetworkObject(): TransactionOutputObjectType {
    return {
      pubkey: this.pubkey,
      value: this.value
    }
  }
}

export class Outpoint {
  txid: ObjectId
  index: number

  static fromNetworkObject(outpoint: OutpointObjectType): Outpoint {
    return new Outpoint(outpoint.txid, outpoint.index)
  }
  constructor(txid: ObjectId, index: number) {
    this.txid = txid
    this.index = index
  }
  async resolve(): Promise<Output> {
    const refTxMsg = await ObjectStorage.get(this.txid)
    const refTx = Transaction.fromNetworkObject(refTxMsg)

    if (this.index >= refTx.outputs.length) {
      throw new AnnotatedError('INVALID_TX_OUTPOINT', `Invalid index reference ${this.index} for transaction ${this.txid}. The transaction only has ${refTx.outputs.length} outputs.`)
    }
    return refTx.outputs[this.index]
  }
  toNetworkObject(): OutpointObjectType {
    return {
      txid: this.txid,
      index: this.index
    }
  }
}

export class Input {
  outpoint: Outpoint
  sig: Signature | null

  static fromNetworkObject(inputMsg: TransactionInputObjectType): Input {
    return new Input(
      Outpoint.fromNetworkObject(inputMsg.outpoint),
      inputMsg.sig
    )
  }
  constructor(outpoint: Outpoint, sig: Signature | null = null) {
    this.outpoint = outpoint
    this.sig = sig
  }
  toNetworkObject(): TransactionInputObjectType {
    return {
      outpoint: this.outpoint.toNetworkObject(),
      sig: this.sig
    }
  }
  toUnsigned(): Input {
    return new Input(this.outpoint)
  }
}

export class Transaction {
  txid: ObjectId
  inputs: Input[] = []
  outputs: Output[] = []
  height: number | null = null

  static inputsFromNetworkObject(inputMsgs: TransactionInputObjectType[]) {
    return inputMsgs.map(Input.fromNetworkObject)
  }
  static outputsFromNetworkObject(outputMsgs: TransactionOutputObjectType[]) {
    return outputMsgs.map(Output.fromNetworkObject)
  }
  static fromNetworkObject(txObj: TransactionObjectType): Transaction {
    let inputs: Input[] = []
    let height: number | null = null

    if (SpendingTransactionObject.guard(txObj)) {
      inputs = Transaction.inputsFromNetworkObject(txObj.inputs)
    }
    else {
      height = txObj.height
    }
    const outputs = Transaction.outputsFromNetworkObject(txObj.outputs)

    return new Transaction(ObjectStorage.id(txObj), inputs, outputs, height)
  }
  static async byId(txid: ObjectId): Promise<Transaction> {
    return this.fromNetworkObject(await ObjectStorage.get(txid))
  }
  constructor(txid: ObjectId, inputs: Input[], outputs: Output[], height: number | null = null) {
    this.txid = txid
    this.inputs = inputs
    this.outputs = outputs
    this.height = height
  }
  async validate() {
    const unsignedTxStr = canonicalize(this.toNetworkObject(false))

    if (this.inputs.length == 0) {
      // assume all coinbases are valid for now
      return
    }

    const inputValues = await Promise.all(
      this.inputs.map(async (input, i) => {
        const prevOutput = await input.outpoint.resolve()

        if (input.sig === null) {
          throw new AnnotatedError('INVALID_TX_SIGNATURE', `No signature available for input ${i} of transaction ${this.txid}`)
        }
        if (!await ver(input.sig, unsignedTxStr, prevOutput.pubkey)) {
          throw new AnnotatedError('INVALID_TX_SIGNATURE', `Signature validation failed for input ${i} of transaction ${this.txid}`)
        }

        return prevOutput.value
      })
    )
    let sumInputs = 0
    let sumOutputs = 0

    for (const inputValue of inputValues) {
      sumInputs += inputValue
    }
    for (const output of this.outputs) {
      sumOutputs += output.value
    }
    if (sumInputs < sumOutputs) {
      throw new AnnotatedError('INVALID_TX_CONSERVATION', `Transaction ${this.txid} does not respect the Law of Conservation. Inputs summed to ${sumInputs}, while outputs summed to ${sumOutputs}.`)
    }
  }
  inputsUnsigned() {
    return this.inputs.map(
      input => input.toUnsigned().toNetworkObject()
    )
  }
  toNetworkObject(signed: boolean = true): TransactionObjectType {
    let outputObjs = this.outputs.map(output => output.toNetworkObject())

    if (this.height !== null) {
      return {
        type: 'transaction',
        outputs: outputObjs,
        height: this.height
      }
    }
    if (signed) {
      return {
        type: 'transaction',
        inputs: this.inputs.map(input => input.toNetworkObject()),
        outputs: outputObjs
      }
    }
    return {
      type: 'transaction',
      inputs: this.inputsUnsigned(),
      outputs: outputObjs
    }
  }
}
