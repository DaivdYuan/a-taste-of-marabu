import {isIP} from 'net';
const isValidDomain = require('is-valid-domain');

export function checkEquivalent<T>(a:T, b:T){
    return a === b;
}

export function isValidPeer(peer: string[]){
    for (const p of peer){
        //separate ports
        try {
            const portions = p.split(":");

            const port: number = +portions[portions.length - 1];
            if (!port || (port < 0 || port > 65535)){
                console.log("Invalid port: " + port);
                return false;
            }

            var ip: string = portions.slice(0, portions.length - 1).join(":");
            //stripe brackets
            if (ip[0] === '[' && ip[ip.length - 1] === ']'){
                ip = ip.slice(1, ip.length - 1);
            }
            if (!ip || (!isIP(ip) && !isValidDomain(ip))){
                console.log("Invalid ip: " + ip);
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    return true;
}

export function matchesValidFields(validKeys: string[], fields: string[]){
    const keys = new Set(validKeys);
    const fieldsSet = new Set(fields);
    try {
        var res:boolean = keys.size === fieldsSet.size && [...keys].every((x) => fieldsSet.has(x));
    } catch (e) {
        console.log("Error:",e);
        return false;
    }
    return res;
}