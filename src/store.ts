export type ObjectId = string

import level from 'level-ts'
import { canonicalize } from 'json-canonicalize'
import { AnnotatedError, TransactionObject, ObjectType } from './message'
import { Transaction } from './transaction'
import { logger } from './logger'
import { hash } from './crypto/hash'

export const db = new level('./db')

export class ObjectStorage {
  static id(obj: any) {
    const objStr = canonicalize(obj)
    const objId = hash(objStr)
    return objId
  }
  static async exists(objectid: ObjectId) {
    return await db.exists(`object:${objectid}`)
  }
  static async get(objectid: ObjectId) {
    try {
      return await db.get(`object:${objectid}`)
    } catch {
      throw new AnnotatedError('UNKNOWN_OBJECT', `Object ${objectid} not known locally`)
    }
  }
  static async del(objectid: ObjectId) {
    try {
      return await db.del(`object:${objectid}`)
    } catch {
      throw new AnnotatedError('UNKNOWN_OBJECT', `Object ${objectid} not known locally`)
    }
  }
  static async put(object: any) {
    logger.debug(`Storing object with id ${this.id(object)}: %o`, object)
    return await db.put(`object:${this.id(object)}`, object)
  }
  static async validate(object: ObjectType) {
    if (!TransactionObject.guard(object)) {
      throw new AnnotatedError('INVALID_FORMAT', 'Failed to parse object')
    }
    const tx = Transaction.fromNetworkObject(object)
    await tx.validate()
  }
}
