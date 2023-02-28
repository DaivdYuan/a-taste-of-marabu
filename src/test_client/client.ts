import { canonicalize } from 'json-canonicalize';
import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';

const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

function testGetMempool(){
    const getMempoolMessage = canonicalize({
        type: "getmempool"
    });

    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test objects")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(getMempoolMessage + '\n');
        await delay(5000);

    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
}

testGetMempool();