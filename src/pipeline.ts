import { canonicalize } from 'json-canonicalize';
const fs = require('fs');

export function getPeers():any {
    const peers = fs.readFileSync('peers.json', 'utf8');
    return JSON.parse(peers);
}

export function addPeers(peers: string[], newPeers: string[]):void {
    for (const peer of newPeers) {
        if (peers.indexOf(peer) === -1) {
            peers.push(peer);
        }
    }
    writePeers(peers);
}

export function writePeers(peers: string[]):void {
    fs.writeFileSync('peers.json', canonicalize(peers));
}