import { hash } from './crypto/hash'
import { canonicalize } from 'json-canonicalize';
import { logger } from "./logger";
import { OUR_PUBLIC_KEY } from './crypto/signature';
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
import { loadJsonFile } from './json';
import net from 'net';
import delay from 'delay';

const NONCE_LEN = 32

const SERVER_HOST = '0.0.0.0';
const SERVER_PORT = 18018;

const client = new net.Socket();

var flag = false;;
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

function sendToServer(data: object) {
    client.write(canonicalize(data)+"\n");
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
                    value: 50000000000
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
            logger.warn("no chaintip... skip mining")
            return
        }
        this.height = this.json.chainHeight + 1
        this.coinBaseTx = await this.createCoinBaseTx() // need to store coinbase tx TODO
        if (this.coinBaseTx == null) {
            logger.warn("no coinbase tx... skip mining")
            return
        }
        this.txid = hash(canonicalize(this.coinBaseTx))
        this.txs = [this.txid, ...this.json.txids]
        this.previd = this.chaintip
        logger.info(`mining with chaintip ${this.chaintip}, new height: ${this.height}, txs: ${this.txs}`)
        
        while (!flag) { await delay(1000) }

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
                })
                sendToServer({
                    type: 'object',
                    object: this.coinBaseTx
                })
                return
            }
            nonce++;
            if (nonce % 50000 == 49999) {
                console.log("Tried: ", nonce, " times.\n")
            }
        }
    }

}

const miner = new Miner()

async function main() {
    while (true) {
        for (let i = 0; i < 100; i++) {
            miner.mine()
        }            
        await miner.mine()
    }
}

main()