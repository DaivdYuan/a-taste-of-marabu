import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';

const SERVER_HOST = '149.28.200.131';
// const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

// test case 0: a mal formatted messgae
function test_0(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 0: a mal formated message to node.");
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

// test case 1: hello and then mal formatted message
function test_1(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 1: hello and then mal formatted message");
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        client.write('TEST_1: this is some random message.\n');
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

// test case 2: getPeers()
function test_2(): void {
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test case 2: getPeers()")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
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
    test_0,
    test_1,
    test_2,
]

async function test(): Promise<void> {
    const total_tests = 3;
    for (let i = 0; i < total_tests; i++) {
        tests[i]();
        if (i != total_tests-1) {await delay(5000);}
    }
};

test();