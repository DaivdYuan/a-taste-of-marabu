import { canonicalize } from 'json-canonicalize';
const fs = require('fs');

export function getLocalPeers():string[] {
    const peers = fs.readFileSync('peers.json', 'utf8');
    return <string[]>JSON.parse(peers);
}

export function addPeers(newPeers: string[], peers: string[] = getLocalPeers()):void {
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