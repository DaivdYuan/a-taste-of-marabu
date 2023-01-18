import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';

// const SERVER_HOST = '149.28.200.131';
const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

const client = new net.Socket();
client.connect(SERVER_PORT, SERVER_HOST, async () => {
    console.log('Connected to server.');
    await delay(3000);
    // client.write('invalid message from client.\nAnd there');
    client.write(Messages.helloMessage.json + '\nAnd there')
    await delay(3000);
    client.write('is a second part\n');
});

client.on('data', (data) => {
    console.log(`Server sent: ${data}`);
})

client.on('close', () => {
    console.log('Server disconnected');
})