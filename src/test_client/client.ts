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

//const SERVER_HOST = '149.28.200.131';
const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

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

//test_POW()

//test blockchain

function test_blockchain() {
    var genesis_object =  {
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

    var spend_genesis_object = {
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

    var tx_object = {
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

test_blockchain()   //FAILED UTXO

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
        for (let context of contexts){
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
        let segments = data.toString().split('\n')
        for (let segment of segments){
            if (segment.length == 0){
                continue
            }
            let parsed = JSON.parse(segment)
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

//test_invalid_cases()

const invalid_UTXO_block = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671902581,"miner":"grader","nonce":"400000000000000000000000000000000000000000000000000000000ffc4942","note":"This block spends a coinbase transaction not in its prev blocks","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["ae75cdf0343674d8368222995ab33e687df8f6a1514fd4060864447de14abb77"],"type":"block"},"type":"object"}
const UTXO_contexts = [
    {"object":{"height":1,"outputs":[{"pubkey":"260270b6d9fdfcc6d4aed967915ef64d67973e98f9f2216981c603c967608806","value":50000000000000}],"type":"transaction"},"type":"object"},

]

//test_invalid_block(invalid_UTXO_block, UTXO_contexts) //SUCCESS