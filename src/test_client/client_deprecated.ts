import { canonicalize } from 'json-canonicalize';
import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';
import * as Messages_solution from "../message"
import { logger } from '../logger';
import * as ed from '@noble/ed25519';
// import { objectManager } from '../object';
import { Literal,
    Record, Array, Union,
    String, Number,
    Static, Null, Unknown, Optional } from 'runtypes'

const SERVER_HOST = '149.28.200.131';
// const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

function test_POW() {
    const genesis =  {
        "T": "00000000abc00000000000000000000000000000000000000000000000000000",
        "created": 1671062400,
        "miner": "Marabu",
        "nonce": "000000000000000000000000000000000000000000000000000000021bea03ed",
        "note": "The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers",
        "previd": null,
        "txids": [],
        "type": "block"
      }
    
    const spend_genesis = {
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
    
    const tx = {
        "type": "transaction",
        "height": 1,
        "outputs": [{
            "pubkey": "daa520a25ccde0adad74134f2be50e6b55b526b1a4de42d8032abf7649d14bfc",
            "value": 50000000000000
        }]
    }
    
    const T = "00000000abc00000000000000000000000000000000000000000000000000000"
    // console.log(objectManager.id(genesis))
    // console.log(objectManager.id(spend_genesis))
    // console.log(objectManager.id(spend_genesis) < T)
}

// test_POW()

//test blockchain

function test_blockchain() {
    const genesis_object =  {
        "type": "object",
        "object": {
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

    const spend_genesis_object = {
        "type": "object",
        "object": {
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
    }

    const tx_object = {
        "type":"object",
        "object": {
            "type": "transaction",
            "height": 1,
            "outputs": [{
                "pubkey": "daa520a25ccde0adad74134f2be50e6b55b526b1a4de42d8032abf7649d14bfc",
                "value": 50000000000000
            }]
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
        client.write(canonicalize(genesis_object) + '\n');
        await delay(1000);
        client.write(canonicalize(spend_genesis_object) + '\n');
        await delay(1000);
        client.write(canonicalize(tx_object) + '\n');

    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
}

//test_blockchain()   //FAILED UTXO

const invalid_blocks = {
    "invalid_target": {"object":{"T":"0f00000000000000000000000000000000000000000000000000000000000000","created":1671355937,"miner":"grader","nonce":"1000000000000000000000000000000000000000000000000000000000000000","note":"Block with incorrect target","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"},
    "invalid_pow": {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671356958,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000000012baaaa","note":"Block with invalid PoW","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"},
    "invalid_coinbase": {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671470413,"miner":"grader","nonce":"100000000000000000000000000000000000000000000000000000000c6bccff","note":"This block violates the law of conservation","previd":"0000000087aa358369304cf750fddfccf6d66fe04344d090b27af51213c1b5c0","txids":["5511abce2e64f90da983b2a103623e49c49aa6f62706be0b59ab47306c965db4","e2095e1c75a0950c1d699287b15ba976ba39c8d0989c4c6c2457c38a9bb6330c"],"type":"block"},"type":"object"},
    "invalid_spent_coinbase": {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671499512,"miner":"grader","nonce":"400000000000000000000000000000000000000000000000000000003ba510f9","note":"This block has a transaction spending the coinbase","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","e2095e1c75a0950c1d699287b15ba976ba39c8d0989c4c6c2457c38a9bb6330c"],"type":"block"},"type":"object"},
    "unfindable_object": {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671550512,"miner":"grader","nonce":"600000000000000000000000000000000000000000000000000000000c1ac6bc","note":"This block contains an invalid transaction","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","fe5ee59b947633b0d36e098648d5fe660675a58eae6952db04ac79e06fb6737c"],"type":"block"},"type":"object"},
    "multiple_coinbases": {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671570824,"miner":"grader","nonce":"100000000000000000000000000000000000000000000000000000001d69ea34","note":"This block has 2 coinbase transactions","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff"],"type":"block"},"type":"object"}
}

function test_invalid_block(invalid_block: any, contexts: any[] = []){
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test invalid block")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        for (const context of contexts){
            client.write(canonicalize(context) + '\n');
            await delay(1000);
        }
        client.write(canonicalize(invalid_block) + '\n');
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed\n\n');
    })

}

async function test_invalid_cases() {
    await test_invalid_block(invalid_blocks.invalid_target)  //SUCCESS
    await test_invalid_block(invalid_blocks.invalid_pow)  //SUCCESS
    await test_invalid_block(invalid_blocks.invalid_coinbase)  //SUCCESS
    await test_invalid_block(invalid_blocks.invalid_spent_coinbase)  //SUCCESS
    await test_invalid_block(invalid_blocks.unfindable_object)  //SUCCESS ?? need to check
    await test_invalid_block(invalid_blocks.multiple_coinbases)  //SUCCESS
}

// test_invalid_cases()

const invalid_UTXO_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671902581,"miner":"grader","nonce":"400000000000000000000000000000000000000000000000000000000ffc4942","note":"This block spends a coinbase transaction not in its prev blocks","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["ae75cdf0343674d8368222995ab33e687df8f6a1514fd4060864447de14abb77"],"type":"block"},"type":"object"}
const UTXO_contexts = [
    {"object":{"height":1,"outputs":[{"pubkey":"260270b6d9fdfcc6d4aed967915ef64d67973e98f9f2216981c603c967608806","value":50000000000000}],"type":"transaction"},"type":"object"},

]

//test_invalid_block(invalid_UTXO_block, UTXO_contexts) //SUCCESS



function test_recursive_validation(){
    // /// TEST 1
    // const third_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671167448,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f48c13b24","note":"Third block","previd":"00000000352f19a602a15bcc6ae4e6aea59bb1a234962b3eb824d6819332c20c","txids":[],"type":"block"},"type":"object"}
    // const second_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671115550,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f606ac350","note":"Second block","previd":"0000000074c9b18be5ed6527ab7a6b398d5842e32e2f7619f0ac5b9436e53a72","txids":[],"type":"block"},"type":"object"}
    // const first_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671106902,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cff302e97","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}
    // const get_block =  {"objectid":"0000000023c53e573cd45fcd6294e75a9d7a5b26ac6f433aa2fd6944cfb7e5fe","type":"getobject"}

    /// TEST 2
    const third_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671189685,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb913784f1","note":"Third block","previd":"000000001e5f347b48a75eb0b1e0a1602110b6cc8562953122784395efa9183f","txids":[],"type":"block"},"type":"object"}
    const second_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671126331,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ceac8fae6","note":"Second block","previd":"000000008fc8222b6ed6be31071aa2221672617ba10a34837ff33e313bde93b7","txids":[],"type":"block"},"type":"object"}
    const first_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671110062,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cbfde60ca","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}
    const get_block = {"objectid":"000000005671363d555e1975ec2efdb8e76dd0ea6c7f02f886bec194394399f4","type":"getobject"}
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test recursive validation block")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(canonicalize(third_block) + '\n');
        await delay(1000);
        client.write(canonicalize(second_block) + '\n');
        await delay(1000);
        client.write(canonicalize(first_block) + '\n');
        await delay(1000);
        client.write(canonicalize(get_block) + '\n');
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed\n\n');
    })

}

// test_recursive_validation();



// ============= Testcase: Non-increasing timestamps =============

function test_nonincreasing_timestamps(){
    const first_block = {"object":{"T":"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","created":1671110062,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cbfde60ca","note":"First block","previd":"086118919d79387cbccfc2820f4f27e01b4509b3b9738b82b1b7d452ca72d992","txids":[],"type":"block"},"type":"object"}
    // console.log(objectManager.id(first_block.object))
    const second_block = {"object":{"T":"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","created":1671110062,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ceac8fae6","note":"Second block","previd":"aef13d1f8f73240665266d2ba1666ede7618bf58cbdf09a9a7bab85c17bbc692","txids":[],"type":"block"},"type":"object"}
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test timestamp")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(canonicalize(second_block) + '\n');
        await delay(1000);
        client.write(canonicalize(first_block) + '\n');
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent to client 1: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed to client 1\n\n');
    })
    const client_2 = new net.Socket();
    client_2.connect({port: SERVER_PORT, host: SERVER_HOST}, async () => {
        console.log('Connected to server.');
        client_2.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client_2.write(Messages.getPeersMessage.json + '\n');
        await delay(15000);
        //close connection
        client_2.destroy();
    })
    client_2.on('data', (data) => {
        console.log(`Server sent to client 2: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client_2.destroy()
            }
        }
    })
    client_2.on('close', () => {
        console.log('Connection closed to client 2\n\n');
    })

}

// test_nonincreasing_timestamps()


// =================== Testcase: Invalid genesis ===================

function test_invalid_genesis(){
    const genesis_block = {"object":{"T":"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","created":1671091830,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbc61fe57f","note":"Incorrect genesis","previd":null,"txids":[],"type":"block"},"type":"object"}
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test recursive validation block")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(canonicalize(genesis_block) + '\n');
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed\n\n');
    })

}


// test_invalid_genesis()


function get_tx_from_peers() {
    const client = new net.Socket();
    client.connect(18018, "45.63.84.226", async () => {
        console.log('Connected to server.');
        let tx_messages = [
            {"objectid":"8790187596c417cc41fe632bb1eaa779e0529dc256a37df9c531d012198a0b18","type":"getobject"},
            {"objectid":"36e2f567d8a144ae8cd55fffae636d747c7d1ed77f965c2ba7d5036f63c017dd","type":"getobject"},
            {"objectid":"058d7388dc7410baacf71112bc3b1c2820c9c329edf6397093647c601ff84777","type":"getobject"},
        ]
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        for (const tx_message of tx_messages) {
            client.write(canonicalize(tx_message) + '\n');
            await delay(1000);
        }
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed\n\n');
    })
}

// get_tx_from_peers()


// ============= Testcase: Incorrect height coinbase =============


function test_incorrect_height(){

    /// TEST 1
    const third_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671152671,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204efd6066e9","note":"Third block","previd":"000000003c333f6bfac73bf937bfe6966861dd93c2bc790b7e360427ee656aba","txids":["8790187596c417cc41fe632bb1eaa779e0529dc256a37df9c531d012198a0b18"],"type":"block"},"type":"object"}
    const second_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671115165,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b1903f3964d0","note":"Second block","previd":"000000000bf5ed1ee86cb47cc81489f4eaadbb59802e7b65ad87e89dce825417","txids":["36e2f567d8a144ae8cd55fffae636d747c7d1ed77f965c2ba7d5036f63c017dd"],"type":"block"},"type":"object"}
    const first_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671107316,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b190447b3bae","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["058d7388dc7410baacf71112bc3b1c2820c9c329edf6397093647c601ff84777"],"type":"block"},"type":"object"}
    const tx_objects = [
        {"object":{"height":4,"outputs":[{"pubkey":"bfd714d581342739b3f31542e87cebc48b645b3a96c9251bc1a9d1a0dda59b29","value":50000000000000}],"type":"transaction"},"type":"object"},
        {"object":{"height":2,"outputs":[{"pubkey":"bfd714d581342739b3f31542e87cebc48b645b3a96c9251bc1a9d1a0dda59b29","value":50000000000000}],"type":"transaction"},"type":"object"},
        {"object":{"height":1,"outputs":[{"pubkey":"bfd714d581342739b3f31542e87cebc48b645b3a96c9251bc1a9d1a0dda59b29","value":50000000000000}],"type":"transaction"},"type":"object"}
    ]
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test recursive validation block")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        for (const tx_object of tx_objects) {
            client.write(canonicalize(tx_object) + '\n');
            logger.debug(`sending ${canonicalize(tx_object)}`)
            await delay(1000);
        }
        client.write(canonicalize(third_block) + '\n');
        logger.debug(`sending ${canonicalize(third_block)}`)
        await delay(1000);
        client.write(canonicalize(second_block) + '\n');
        logger.debug(`sending ${canonicalize(second_block)}`)
        await delay(1000);
        client.write(canonicalize(first_block) + '\n');
        logger.debug(`sending ${canonicalize(first_block)}`)
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed\n\n');
    })
    const client_2 = new net.Socket();
    client_2.connect({port: SERVER_PORT, host: SERVER_HOST}, async () => {
        console.log('Connected to server.');
        client_2.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client_2.write(Messages.getPeersMessage.json + '\n');
        await delay(15000);
        //close connection
        client_2.destroy();
    })
    client_2.on('data', (data) => {
        console.log(`Server sent to client 2: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client_2.destroy()
            }
        }
    })
    client_2.on('close', () => {
        console.log('Connection closed to client 2\n\n');
    })
}


// test_incorrect_height()


/// ================ Testcase: longest chain ================

function test_longest_chain(){

    const third_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671189685,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb913784f1","note":"Third block","previd":"000000001e5f347b48a75eb0b1e0a1602110b6cc8562953122784395efa9183f","txids":[],"type":"block"},"type":"object"}
    const second_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671126331,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ceac8fae6","note":"Second block","previd":"000000008fc8222b6ed6be31071aa2221672617ba10a34837ff33e313bde93b7","txids":[],"type":"block"},"type":"object"}
    const first_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671110062,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cbfde60ca","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}
    const get_block = {"objectid":"000000005671363d555e1975ec2efdb8e76dd0ea6c7f02f886bec194394399f4","type":"getobject"}

    const chain_tip = {"blockid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"chaintip"}
    // blocks 7 to 1
    const blocks = [
        {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671426714,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c7451ebaa7883","note":"Block 7","previd":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","txids":[],"type":"block"},"type":"object"},
        {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671355893,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b44251c0ce18","note":"Block 6","previd":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","txids":[],"type":"block"},"type":"object"},
        {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671319174,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875d05eae29f","note":"Block 5","previd":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","txids":[],"type":"block"},"type":"object"},
        {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671294586,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cc0d5fc2f4","note":"Block 4","previd":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","txids":[],"type":"block"},"type":"object"},
        {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671212387,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f5d92de8e","note":"Block 3","previd":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","txids":[],"type":"block"},"type":"object"}
    ]
    const previous_2_blocks = [
        {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671168572,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b190a053d95c","note":"Block 2","previd":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","txids":[],"type":"block"},"type":"object"},
        {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671093685,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ce1504ce5","note":"Block 1","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}
    ]
    const get_chain_tip = {"type":"getchaintip"}
    // get blocks 7 to 0 (genesis block)
    const get_blocks = [
        {"objectid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"getobject"},
        {"objectid":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","type":"getobject"},
        {"objectid":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","type":"getobject"},
        {"objectid":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","type":"getobject"},
        {"objectid":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","type":"getobject"},
        {"objectid":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","type":"getobject"},
        {"objectid":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","type":"getobject"},
        {"objectid":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","type":"getobject"}
    ]

    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test longest chain")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);

        client.write(`${canonicalize(get_chain_tip)}\n`)
        logger.debug(`client 1: sending ${canonicalize(get_chain_tip)}\n`)
        await delay(1000);
        // should return genesis block

        for (const block of previous_2_blocks) {
            client.write(canonicalize(block) + '\n');
            logger.debug(`client 1: sending ${canonicalize(block)}`)
            await delay(1000);
        }
        client.write(`${canonicalize(get_chain_tip)}\n`)
        logger.debug(`client 1: sending ${canonicalize(get_chain_tip)}\n`)
        await delay(1000);
        // should return hash of block 2

        client.write(`${canonicalize(third_block)}\n`)
        logger.debug(`client 1: sending ${canonicalize(third_block)}\n`)
        await delay(1000);
        client.write(`${canonicalize(second_block)}\n`)
        logger.debug(`client 1: sending ${canonicalize(second_block)}\n`)
        await delay(1000);
        client.write(`${canonicalize(first_block)}\n`)
        logger.debug(`client 1: sending ${canonicalize(first_block)}\n`)
        await delay(1000);
        client.write(`${canonicalize(get_block)}\n`)
        logger.debug(`client 1: sending ${canonicalize(get_block)}\n`)
        await delay(1000);

        client.write(`${canonicalize(get_chain_tip)}\n`)
        logger.debug(`client 1: sending ${canonicalize(get_chain_tip)}\n`)
        await delay(1000);
        // should return hash of third object

        client.write(`${canonicalize(chain_tip)}\n`)
        logger.debug(`client 1: sending ${canonicalize(chain_tip)}\n`)
        await delay(1000);
        // should return getobject with that object id

        for (const block of blocks) {
            client.write(canonicalize(block) + '\n');
            logger.debug(`client 1: sending ${canonicalize(block)}`)
            await delay(1000);
        }

        client.write(`${canonicalize(get_chain_tip)}\n`)
        logger.debug(`client 1: sending ${canonicalize(get_chain_tip)}\n`)
        await delay(1000);
        // should return hash of block 7

        for (const get_block of get_blocks) {
            client.write(canonicalize(get_block) + '\n');
            logger.debug(`client 1: sending ${canonicalize(get_block)}`)
            await delay(1000);
        }
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent to client 1: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed\n\n');
    })


    // client 2 is used for monitoring broadcasting
    const client_2 = new net.Socket();
    client_2.connect({port: SERVER_PORT, host: SERVER_HOST}, async () => {
        console.log('Connected to server.');
        client_2.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client_2.write(Messages.getPeersMessage.json + '\n');
        await delay(15000);
        //close connection
        client_2.destroy();
    })
    client_2.on('data', (data) => {
        console.log(`Server sent to client 2: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client_2.destroy()
            }
        }
    })
    client_2.on('close', () => {
        console.log('Connection closed to client 2\n\n');
    })
}

//test_longest_chain()




function get_chain_tip() {
    const client = new net.Socket();
    client.connect(18018, "45.63.84.226", async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(canonicalize({type: "getchaintip"}) + '\n')
        await delay(1000);
        client.write(canonicalize({type: "getobject", objectid: '000000004eefecb34a1619f54069315f8b2cf782c8438b9ac0f5fa95d5f960bc'}) + '\n')
        await delay(1000);
        client.write(canonicalize({type: "getobject", objectid: '000000001030d0b983b32af089beb89e1cc4500e972011176b79b4db90997ca4'}) + '\n')
        await delay(15000);
        //close connection
        client.destroy();
    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
        const segments = data.toString().split('\n')
        for (const segment of segments){
            if (segment.length == 0){
                continue
            }
            const parsed = JSON.parse(segment)
            if (parsed.type == "error") {
                client.destroy()
            }
        }
    })
    client.on('close', () => {
        console.log('Connection closed\n\n');
    })
}

get_chain_tip()