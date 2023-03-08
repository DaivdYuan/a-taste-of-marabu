import { Transaction, Output } from './transaction';
import { Block } from './block'
import { hash } from './crypto/hash'
import { canonicalize } from 'json-canonicalize';
import { OUR_PUBLIC_KEY } from './crypto/signature';

// miner for the main server
export class Miner {
    coinBaseTx: Transaction;
    height: number = 0;
    txs: string[] = []
    nonce: string = "";
    target: string = "00000000abc00000000000000000000000000000000000000000000000000000";
    previd: string | null = null;
    studentids: string[] = ['davidy02', 'endeshen', 'bettyyw'];
    miner: string = "Student Miner"
    currentBlock: Block;

    constructor(txs: string[], previd: string, height: number) {
        this.height = height;
        this.coinBaseTx = this.createCoinBaseTx();
        this.txs = [this.coinBaseTx.txid, ...txs];
        this.previd = previd;
        this.currentBlock = new Block(
            this.previd, this.txs, "",            // nonce is empty
            this.target, Math.floor(new Date().getTime() / 1000), 
            this.miner, undefined, this.studentids
        ); 
    }

    createCoinBaseTx(): Transaction {
        let tx = new Transaction("", [], [
            new Output(OUR_PUBLIC_KEY, 50000000000)
        ], this.height);
        tx.txid = hash(canonicalize(this.coinBaseTx.toNetworkObject()));
        return tx;
    }

    // mine a block
    async mine() {
        if (this.currentBlock == null) {
            return;
        }
        let nonce = 0;
        while (true) {
            this.currentBlock.nonce = nonce.toString();
            let blockid = hash(canonicalize(this.currentBlock));
            if (blockid < this.target) {
                return this.currentBlock; // TODO on success
            }
            nonce++;
        }
    }
    
    // TODO
    // async submitBlock(block: Block) {

}