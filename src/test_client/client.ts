import { canonicalize } from 'json-canonicalize';
import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';
import * as Messages_solution from "../message"
import { logger } from '../logger';
import * as ed from '@noble/ed25519';
import { ObjectStorage } from '../store';
import { Literal,
    Record, Array, Union,
    String, Number,
    Static, Null, Unknown, Optional } from 'runtypes'

const SERVER_HOST = '149.28.200.131';
//const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

// test case for varies mal-formed messages 
function test_mal_messages(message: string): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case for varies mal-formed messages ");
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        client.write(message + '\n');
        await delay(1000);
        client.destroy();
    });

    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })

    client.on('close', () => {
        console.log('Server disconnected');
    })
}


// test case 0: a mal formatted messgae up front
function test_0(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 0: a mal formatted messgae up front");
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write('TEST_0: this is some random message.\n');
        await delay(1000);
        client.destroy();
    });

    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })

    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test case 0.5: a mal formatted hello message up front
function test_0_1(): void {
    const client = new net.Socket();
    const mal_hello_message = {
        "type": "hello",
        "version": "0.9",
        "agent": "Marabu-Core Client 0.9",
        "port": 18018
    }
    console.log("--------------------------------");
    console.log("test case 0.5: a mal formatted hello message up front");
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(canonicalize(mal_hello_message)+'\n');
        await delay(1000);
        client.destroy();
    });

    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })

    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test case 1: hello and incomplete message(timeout) 
function test_1(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 1: hello and incomplete message(timeout)");
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        client.write('TEST_1: this is some time out message');
        await delay(50000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test case 2: getPeers()
function test_2(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 2: getPeers()")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(3000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(3000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test case 2.t: getPeers() but invalid message   
function test_2_1(): void {
    const client = new net.Socket();
    const mal_getPeers_message = {
        "type": "getpeers",
        "version": "0.9",
        "agent": "Marabu-Core Client 0.9"
    }
    console.log("--------------------------------");
    console.log("test case 2: getPeers()")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(10);
        client.write(canonicalize(mal_getPeers_message) + '\n');
        await delay(1000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}


// test case 3: getPeers() but over two packages
function test_3(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 3: getPeers() but over two packages")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        client.write('{"type":"ge');
        await delay(100);
        client.write('tpeers"}\n');
        await delay(1000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test case 3.5: getPeers() but over three packages
function test_3_1(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 3: getPeers() but over two packages")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        client.write('{"type":"ge');
        await delay(100);
        client.write('tpe');
        await delay(100);
        client.write('ers"}\n');
        await delay(1000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test case 4: getPeers() but didn't send hello first
function test_4(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 4: getPeers() but didn't send hello first")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}

// test case 5: getpeers() after send peers 
async function test_5(): Promise<void> {

    const peers_msg = JSON.stringify({
        "type": "peers",
        "peers": [
          "dionyziz.com:18018" /* dns */,
          "138.197.191.170:18018" /* ipv4 */,
          "[fe80::f03c:91ff:fe2c:5a79]:18018" /* ipv6 */
        ]
    });
    
    var client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 5 PART1: getpeers() after send peers ")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(100);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(100);
        client.write(peers_msg + '\n');
        await delay(1000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })

    // wait between two consecutive connections
    await delay(5000);

    client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 5 PART2: getpeers() after send peers ")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(10);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.destroy();
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })

}

var tests = [
    // test_0,  // test case 0: a mal formatted message up front           SUCCESS
    // test_0_1, // test case 0.5: a mal formatted hello message up front    SUCCESS
    // test_1,  // test case 1: hello and incomplete message(timeout)         SUCCESS
    // test_2,  // test case 2: getPeers()                                 SUCCESS
    // test_2_1, // test case 2.5: getPeers() but mal-formed message        SUCCESS
    // test_3,  // test case 3: getPeers() but over two packages           SUCCESS 
    // test_3_1, // test case 3.5: getPeers() but over three packages      SUCCESS
    // test_4,  // test case 4: getPeers() but didn't send hello first     SUCCESS
    test_5,  // test case 5: getpeers() after send peers                SUCCESS
]

async function test(): Promise<void> {
    const total_tests = tests.length;
    for (let i = 0; i < total_tests; i++) {
        tests[i]();
        if (i != total_tests - 1) {await delay(5000);}
    }
};

// test();


// testing all sorts of mal-formed messages                     SUCCESS
const invalid_messages = [                          // THEY SHOULD ALL RETURN INVALID_FORMAT
    'Wbgygvf7rgtyv7tfbgy{{{',
    '{"type":"diufygeuybhv"}',
    '{"type":"hello"}',
    '{"type":"hello","version":"jd3.x"}',
    '{"type":"hello","version":"5.8.2"}'
]

async function mal_messages_test(): Promise<void> {
    for (const invalid_message of invalid_messages) {
        console.log(invalid_message);
        test_mal_messages(invalid_message);
        await delay(5000);
    }
}

// mal_messages_test();


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


function test_POW() {
    var genesis =  {
        "T": "00000000abc00000000000000000000000000000000000000000000000000000",
        "created": 1671062400,
        "miner": "Marabu",
        "nonce": "000000000000000000000000000000000000000000000000000000021bea03ed",
        "note": "The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers",
        "previd": null,
        "txids": [],
        "type": "block"
      }
    
    var spend_genesis = {
        "T": "00000000abc00000000000000000000000000000000000000000000000000000",
        "created": 1671148800,
        "miner": "Marabu Bounty Hunter",
        "nonce": "15551b5116783ace79cf19d95cca707a94f48e4cc69f3db32f41081dab3e6641",
        "note": "First block on genesis, 50 bu reward",
        "previd": "0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2",
        "txids": [
            "8265faf623dfbcb17528fcd2e67fdf78de791ed4c7c60480e8cd21c6cdc8bcd4"
        ],
        "type": "block"
    }
    
    var tx = {
        "type": "transaction",
        "height": 1,
        "outputs": [{
            "pubkey": "daa520a25ccde0adad74134f2be50e6b55b526b1a4de42d8032abf7649d14bfc",
            "value": 50000000000000
        }]
    }
    
    var T = "00000000abc00000000000000000000000000000000000000000000000000000"
    console.log(ObjectStorage.id(genesis))
    console.log(ObjectStorage.id(spend_genesis))
    console.log(ObjectStorage.id(spend_genesis) < T)
}

test_POW()