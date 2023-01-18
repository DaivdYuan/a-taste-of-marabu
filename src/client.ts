import net from 'net';

// const SERVER_HOST = '149.28.200.131';
const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

const client = new net.Socket();
client.connect(SERVER_PORT, SERVER_HOST, () => {
    console.log('Connected to server.');
    client.write('invalid message from client.');
});
