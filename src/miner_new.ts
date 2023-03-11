import { hash } from './crypto/hash'
import { canonicalize } from 'json-canonicalize';
import { logger } from "./logger";
import { OUR_PUBLIC_KEY, sign } from './crypto/signature';
import { TransactionInputObjectType,
    TransactionObjectType,
    TransactionObject,
    CoinbaseTransactionObject,
    BlockObject,
    TransactionOutputObjectType,
    OutpointObjectType,
    SpendingTransactionObject, 
    ErrorMessageType,
    AnnotatedError} from './message'
import { loadJsonFile, writeOutputFile } from './json';
import net from 'net';
import delay from 'delay';

const NONCE_LEN = 32

//const SERVER_HOST = '149.28.200.131';
const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

const client = new net.Socket();

var flag = false
client.connect(SERVER_PORT, SERVER_HOST, async () => {
    console.log('Connected to server');
    client.write(`{"agent":"Malibu (pset5)","type":"hello","version":"0.10.0"}\n`)
    await delay(10);
    client.write(`{"type":"getpeers"}\n`)
    await delay(10);
    client.write(`{"type":"getchaintip"}\n{"type":"getmempool"}\n`)
    flag = true;
});

// Handle data received from the server
client.on('data', (data: Buffer) => {
    console.log(`Received data from server: ${data.toString()}`);
});

function sendToServer(data: object, file_name: string) {
    client.write(canonicalize(data)+"\n");
    writeOutputFile(data, file_name+".txt");
}

function randomPrefix(len: number = NONCE_LEN) {
    let result = '';
    const characters = '0123456789abcde';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// miner for the main server
class Miner {
    coinBaseTx: object | null = null;
    height: number = 0;
    txs: string[] = []
    nonce: string = "";
    target: string = "00000000abc00000000000000000000000000000000000000000000000000000";
    previd: string | null = null;
    studentids: string[] = ['davidy02', 'endeshen', 'bettyyw'];
    miner: string = "Student Miner";
    chaintip: string | null = null;
    json: any;
    txid: string | null = null;

    
    async createCoinBaseTx(): Promise<object> {
        let txobj = {
            type: "transaction",
            height: this.height,
            outputs: [
                {
                    pubkey: OUR_PUBLIC_KEY,
                    value: 50000000000000
                }
            ]
        }
        if (!CoinbaseTransactionObject.guard(txobj)) {
            throw new Error('Error creating coinbase Tx')
        }
        return txobj
    } 

    // mine a block
    async mine() {
        
        let prefix = randomPrefix()
        this.json = loadJsonFile()
        this.chaintip = this.json.chainTip
        if (this.chaintip == null) {
            console.log("no chaintip... skip mining")
            return
        }
        this.height = this.json.chainHeight + 1
        this.coinBaseTx = await this.createCoinBaseTx() // need to store coinbase tx TODO
        if (this.coinBaseTx == null) {
            console.log("no coinbase tx... skip mining")
            return
        }
        this.txid = hash(canonicalize(this.coinBaseTx))
        this.txs = [this.txid, ...this.json.txids]
        this.previd = this.chaintip
        
        while (!flag) { 
            console.log("waiting for connection...")
            await delay(1000) 
        }

        console.log("Mining...")
        let nonce = 0;
        let mined_block = {
            type: 'block',
            previd: this.previd,
            txids: this.txs,
            nonce: prefix + String(nonce).padStart(NONCE_LEN, '0'),
            T: this.target,
            created: Math.floor(new Date().getTime() / 1000),
            miner: this.miner,
            studentids: this.studentids
        }
        
        while (nonce < 1000000) {
            mined_block.nonce = prefix + String(nonce).padStart(NONCE_LEN, '0')
            let blockid = hash(canonicalize(mined_block))

            //console.log("nonce: ", mined_block.nonce, " blockid: " + blockid, "\n") 

            if (blockid < this.target) {
                console.log("MINING SUCCESS.")
                
                if (!BlockObject.guard(mined_block)) {
                    throw new Error('Error creating block')
                }
                if (!CoinbaseTransactionObject.guard(this.coinBaseTx)) {
                    throw new Error('Error creating coinbase Tx')
                }
                console.log("broadcasting block")
                
                sendToServer({
                    type: 'object',
                    object: mined_block
                }, "mined_block")
                sendToServer({
                    type: 'object',
                    object: this.coinBaseTx
                }, "mined_transaction")
                return
            }
            nonce++;
            if (nonce % 500000 == 499999) {
                console.log("Tried: ", nonce, " times.\n")
            }
        }
    }

}

const miner = new Miner()

async function main() {
    while (true) {
        try {
            for (let i = 0; i < 100; i++) {
                await miner.mine()
            }          
        } catch (e) {
            console.log(e)
        }
    }
}

main()

function sendTransaction() {
    let txobj = {
        type: "transaction",
        inputs: [
            {
                outpoint: {
                    txid: "769d669ad2fc14098189115ed782ce7155a64556d6aadae1da712473191daa0e",
                    index: 0
                },
                sig: null
            }
        ],
        outputs: [
            {
                pubkey: "3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f",
                value: 50000000000000
            }
        ]
    }


    sendToServer({
        type: 'object',
        object: txobj
    }, "transaction")
}