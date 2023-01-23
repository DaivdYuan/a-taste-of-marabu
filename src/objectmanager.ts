
import { db } from './store'
import { logger } from './logger'

var blake2 = require('blake2')
var h = blake2.createHash('blake2b', {digestLength: 64})

export class ObjectManager{

    static hashObject(object: string): string {
        return h.update(object).digest('hex')
    }

    haveObjectID(objectid: string): boolean {
        return db.haveObject(objectid)
    }
    haveObjectString(object: string): boolean {
        return this.haveObjectID(ObjectManager.hashObject(object))
    }
    async getObject(objectid: string): Promise<string> {
        return db.getObject(objectid)
    }
    async storeObject(object: string, objectid?: string): Promise<void> {
        if (!objectid) {
            objectid = ObjectManager.hashObject(object)
        }
        return db.storeObject(objectid, object)
    }
}

export const objectManager = new ObjectManager()