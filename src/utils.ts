import {isIP} from 'net';
const isValidDomain = require('is-valid-domain');

export function checkEquivalent<T>(a:T, b:T){
    return a === b;
}

export function isValidPeer(peer: string[]){
    for (const p of peer){
        //separate ports
        try {
            const port: number = +p.split(":")[1];
            if (!port || (port < 0 || port > 65535)){
                return false;
            }
            //separate ip and domain
            const ip: string = p.split(":")[0];
            if (!ip || (!isIP(ip) || !isValidDomain(ip))){
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    return true;
}

export function matchesValidFields(validKeys: string[], fields: string[]){
    for (const field of fields){
        if (!(field in validKeys)){
            return false;
        }
    }
    for (const key of validKeys){
        if (!(key in fields)){
            return false;
        }
    }
    return true;
}