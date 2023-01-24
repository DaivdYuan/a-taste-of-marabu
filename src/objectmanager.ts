
import { db } from './store'
import { logger } from './logger'
import { canonicalize } from 'json-canonicalize'

var blake2 = require('blake2');

export class ObjectManager{

    static hashObject(object: any): string {
        let buff = Buffer.from(canonicalize(object))
        var h = blake2.createHash('blake2s', {digestLength: 32})
        return h.update(buff).digest('hex')
    }

    async haveObjectID(objectid: string): Promise<boolean> {
        return db.exists(objectid)
    }

    async haveObject(object: string): Promise<boolean> {
        return this.haveObjectID(ObjectManager.hashObject(object))
    }

    async getObject(objectid: string): Promise<any> {
        return db.get(objectid)
    }

    async storeObject(object: any, objectid?: string): Promise<void> {
        if (!objectid) {
            objectid = ObjectManager.hashObject(object)
        }
        return db.put(objectid, object)
    }
}

export const objectManager = new ObjectManager()