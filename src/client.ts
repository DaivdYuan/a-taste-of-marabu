import { canonicalize } from 'json-canonicalize';
import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';

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
        "agent": "Marabu-Core Client 0.9"
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
        await delay(10);
        client.write(peers_msg + '\n');
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
    test_0,  // test case 0: a mal formatted message up front           SUCCESS
    test_0_1, // test case 0.5: a mal formatted hello message up front    SUCCESS
    test_1,  // test case 1: hello and incomplete message(timeout)         SUCCESS
    test_2,  // test case 2: getPeers()                                 FAILED (not implemented)
    test_3,  // test case 3: getPeers() but over two packages           SUCCESS (putting together), FAILED (not implemented)
    test_4,  // test case 4: getPeers() but didn't send hello first     SUCCESS
    test_5,  // test case 5: getpeers() after send peers                FAILED (not implemented)
]

async function test(): Promise<void> {
    const total_tests = tests.length;
    for (let i = 0; i < total_tests; i++) {
        tests[i]();
        if (i != total_tests - 1) {await delay(5000);}
    }
};

test();


// testing all sorts of mal-formed messages                             FAIL
const invalid_messages = [
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