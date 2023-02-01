import { canonicalize } from 'json-canonicalize';
import net from 'net';
import * as Messages from "../messages";
import delay from 'delay';
import * as Messages_solution from "../../message"
import { logger } from '../../logger';
import * as ed from '@noble/ed25519';
import { ObjectStorage } from '../../store';

//const SERVER_HOST = '149.28.200.131';
const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

// testing hashing
function test_hash() {
    var pubkey = "b303d841891f91af118a319f99f5984def51091166ac73c062c98f86ea7371ee" // TRUE KEY
    var blake2 = require('blake2');
    var h = blake2.createHash('blake2s', {digestLength: 32});
    var MyObject = {"height":0,"outputs":[{"pubkey":"958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0","value":50000000000}],"type":"transaction"};
    h.update(Buffer.from(canonicalize(MyObject)));
    var blake2s_key = h.digest("hex")
    console.log(pubkey, blake2s_key);
    console.log(pubkey.length);

    function hashTestingObject(obj: any): string {
        var h = blake2.createHash('blake2s', {digestLength: 32});
        if ("inputs" in obj) {
            for (let i = 0; i < obj.inputs.length; i++) {
                if ("sig" in obj.inputs[i]) {
                    obj.inputs[i].sig = null;
                }
            }
        }
        h.update(Buffer.from(canonicalize(obj)));
        return h.digest("hex");
    }
    
    console.log(hashTestingObject(MyObject), blake2s_key);
}



// testing storing objects
function test_object(): void {

    var ihaveobjectMessage = {
        "type": "ihaveobject",
        "objectid": "b303d841891f91af118a319f99f5984def51091166ac73c062c98f86ea7371ee"
    }
    if (!Messages_solution.IHaveObjectMessage.guard(ihaveobjectMessage)) {
        logger.info("incorrect ihaveobject message");
        return;
    }

    var blockMessage = {
        "type": "object",
        "object" : {
            "T": "00000000abc00000000000000000000000000000000000000000000000000000",
            "created": 1671062400,
            "miner": "Marabu",
            "nonce": "000000000000000000000000000000000000000000000000000000021bea03ed",
            "note": "The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers",
            "previd": null,
            "txids": [],
            "type": "block"
        }
    }
    
    if (!Messages_solution.ObjectMessage.guard(blockMessage)) {
        logger.info("incorrect object block message");
        return
    }

    var objectMessage = {
        "type": "object",
        "object": {
            "type":"transaction",
            "outputs":[{
                "pubkey":"158f8add086cc348e22913b6590c71b7d7754e42134a127a50648bf07969d9a0",
                "value":50000000000
            }],
            "height":0,
        }
    }

    if (!Messages_solution.ObjectMessage.guard(objectMessage)) {
        logger.info("incorrect object message");
        return
    }

    var objectMessage2 = {
        "type": "object",
        "object" : {
            "inputs":[{
                "outpoint":{
                    "index":0,
                    "txid":"b303d841891f91af118a319f99f5984def51091166ac73c062c98f86ea7371ee"
                },
                "sig":"060bf7cbe141fecfebf6dafbd6ebbcff25f82e729a7770f4f3b1f81a7ec8a0ce4b287597e609b822111bbe1a83d682ef14f018f8a9143cef25ecc9a8b0c1c405"
            }],
            "outputs":[{
                "pubkey":"958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0",
                "value":10
            }],
            "type":"transaction"
        }
    }

    if (!Messages_solution.ObjectMessage.guard(objectMessage2)) {
        logger.info("incorrect object message2");
        return
    }
    

    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test objects")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(canonicalize(ihaveobjectMessage) + '\n');
        await delay(1000);
        client.write(canonicalize(objectMessage) + '\n');
        await delay(1000);
        client.write(canonicalize(ihaveobjectMessage) + '\n');
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}
// test_object();


function test_sig () {

    // testing signature verification
    var pubkey_tx1 = "958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0"
    var tx1 = {
        "type":"transaction",
        "outputs":[{
            "pubkey":pubkey_tx1,
            "value":50000000000
        }],
        "height":0,
    };

    var signature_tx2 = "060bf7cbe141fecfebf6dafbd6ebbcff25f82e729a7770f4f3b1f81a7ec8a0ce4b287597e609b822111bbe1a83d682ef14f018f8a9143cef25ecc9a8b0c1c405"
    var tx2 = {
        "inputs":[{
            "outpoint":{
                "index":0,
                "txid": "b303d841891f91af118a319f99f5984def51091166ac73c062c98f86ea7371ee"
            },
            "sig":null
        }],
        "outputs":[{
            "pubkey":"958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0",
            "value":10
        }],
        "type":"transaction"
    };
    console.log(Buffer.from(signature_tx2, 'hex').length);
    console.log(Buffer.from(pubkey_tx1, 'hex').length);
    (async () => {
        const isValid = await ed.verify(Uint8Array.from(Buffer.from(signature_tx2, 'hex')),       // SIG
                                        Uint8Array.from(Buffer.from(canonicalize(tx2))), // MSG
                                        Uint8Array.from(Buffer.from(pubkey_tx1, 'hex')));         // PBK
        logger.debug(isValid);
    })();
}




// testing storing objects
function test_transaction(): void {

    var objectMessage = {
        "type": "object",
        "object": {
            "type":"transaction",
            "outputs":[{
                "pubkey":"958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0",
                "value":50000000000
            }],
            "height":0,
        }
    }

    if (!Messages_solution.ObjectMessage.guard(objectMessage)) {
        logger.info("incorrect object message");
        return
    }

    var valid_txid = "b303d841891f91af118a319f99f5984def51091166ac73c062c98f86ea7371ee"
    var invalid_txid = "c303d841891f91af118a319f99f5984def51091166ac73c062c98f86ea7371ee"

    var objectMessage_invalid = {
        "type": "object",
        "object" : {
            "inputs":[{
                "outpoint":{
                    "index":0,
                    "txid": invalid_txid
                },
                "sig":"060bf7cbe141fecfebf6dafbd6ebbcff25f82e729a7770f4f3b1f81a7ec8a0ce4b287597e609b822111bbe1a83d682ef14f018f8a9143cef25ecc9a8b0c1c405"
            }],
            "outputs":[{
                "pubkey":"958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0",
                "value":10
            }],
            "type":"transaction"
        }
    }

    var objectMessage_valid = {
        "type": "object",
        "object" : {
            "inputs":[{
                "outpoint":{
                    "index":0,
                    "txid": valid_txid
                },
                "sig":"060bf7cbe141fecfebf6dafbd6ebbcff25f82e729a7770f4f3b1f81a7ec8a0ce4b287597e609b822111bbe1a83d682ef14f018f8a9143cef25ecc9a8b0c1c405"
            }],
            "outputs":[{
                "pubkey":"958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0",
                "value":10
            }],
            "type":"transaction"
        }
    }
    
    var objectMessage2 = {"object":{"height":0,"outputs":[{"pubkey":"2264b81a4035d9843fa9b3b4526fcbf67617f6428fb9d5d4d16e3c1280222da5","value":50000000000}],"type":"transaction"},"type":"object"}
    var objectMessage3 = {"object":{"inputs":[{"outpoint":{"index":0,"txid":"ad2760c0ad671f19a3a130a74ff208b8e6330e2f8d6688c24c7924c55c97717f"},"sig":"a0d96df529d0e7b4a476b5c3b3b6ab90045a4ec50f963733085031b213c0ddb005ddfdf8748d09cd06072bddbe23929bd81248cb1d7aa1c6a2b334cf03cb1d0e"}],"outputs":[{"pubkey":"2264b81a4035d9843fa9b3b4526fcbf67617f6428fb9d5d4d16e3c1280222da5","value":10}],"type":"transaction"},"type":"object"}


    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test objects")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(canonicalize(objectMessage) + '\n'); // SHOULD BE BROADCASTED
        await delay(1000);
        client.write(canonicalize(objectMessage_valid) + '\n'); // SHOULD(N'T) BE BROADCASTED
        //await delay(1000);
        //client.write(canonicalize(objectMessage_invalid) + '\n'); // SHOULD(N'T) BE BROADCASTED
        await delay(1000);
        client.write(canonicalize(objectMessage2) + '\n');
        await delay(1000);
        client.write(canonicalize(objectMessage3) + '\n');
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test_transaction();

