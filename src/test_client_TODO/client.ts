import { canonicalize } from 'json-canonicalize';
import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';
import * as Messages_solution from "../message"
import { logger } from '../logger';

// const SERVER_HOST = '149.28.200.131';
const SERVER_HOST = '0.0.0.0';
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

var pubkey = "b303d841891f91af118a319f99f5984def51091166ac73c062c98f86ea7371ee" // TRUE KEY
var blake2 = require('blake2');
var h = blake2.createHash('blake2s', {digestLength: 32});
var MyObject = {"height":0,"outputs":[{"pubkey":"958f8add086cc348e229a3b6590c71b7d7754e42134a127a50648bf07969d9a0","value":50000000000}],"type":"transaction"};
h.update(Buffer.from(canonicalize(MyObject)));
var blake2s_key = h.digest("hex")
console.log(pubkey, blake2s_key);
console.log(pubkey.length);


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
        await delay(1000);
    });
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
    
    client.on('close', () => {
        console.log('Server disconnected');
    })
}test_transaction();