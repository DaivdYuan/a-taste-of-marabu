import { canonicalize, canonicalizeEx } from 'json-canonicalize';

export type messageType = HelloMessage | GetPeersMessage | PeersMessage | ErrorMessage;

export const ValidKeys = {
    "HelloMessage":["type","version","agent"],
    "GetPeersMessage":["type"],
    "PeersMessage":["type","peers"],
    "ErrorMessage":["type","name","message"]
}

export interface MessageTemplate{
    readonly type: string;
    get json(): string; 
}

export class HelloMessage implements MessageTemplate{
    readonly type = "hello";
    readonly version: string = "0.9.0";
    readonly agent: string = "Marabu-Core Client 0.9";
    get json(): string{
        return canonicalize(this);
    }

    static isValidHello(msg: HelloMessage): boolean{
        const keys = Object.keys(msg);
        if (keys.length !== 3) return false;
        if (!(keys.includes("type") && keys.includes("version") && keys.includes("agent"))) return false;
        if (msg.type !== "hello") return false;
        if (msg.version !== "0.9.0") return false;
        return true;
    }
}
export const helloMessage = new HelloMessage();

export class GetPeersMessage implements MessageTemplate{
    readonly type = "getpeers";
    static readonly validKeys: string[] = ["type"];
    get json(): string{
        return canonicalize(this);
    }
}
export const getPeersMessage = new GetPeersMessage();

export class PeersMessage implements MessageTemplate{
    readonly type = "peers";
    readonly peers: string[] = [];
    constructor (peers:string[]){
        this.peers = peers;
    }

    get json(): string{
        return canonicalize(this);
    }

}

class ErrorMessage implements MessageTemplate{
    readonly type = "error";
    readonly name: string;
    readonly message: string;
    constructor (name: string, message:string){
        this.name = name;
        this.message = message;
    }

    get json(): string{
        return canonicalize(this);
    }
}

export const Errors: [string,string][] = [
    ["INVALID_FORMAT", "The format of the received message is invalid."],
    ["INTERNAL_ERROR", "Something unexpected happened."],
    ["UNKNOWN_OBJECT", "The object requested is unknown to that specific node."],
    ["UNFINDABLE_OBJECT", "The object requested could not be found in the node's network."],
    ["INVALID_HANDSHAKE", "The peer sent other validly formatted messages before sending a valid hello message."],
    ["INVALID_TX_OUTPOINT", "The transaction outpoint is invalid."],
    ["INVALID_TX_SIGNATURE", "The transaction signature is invalid."],
    ["INVALID_TX_CONSERVATION", "The transaction does not satisfy the weak law of conservation."],
    ["INVALID_BLOCK_COINBASE", "The block coinbase transaction is invalid."],
    ["INVALID_BLOCK_TIMESTAMP", "The block timestamp is invalid."],
    ["INVALID_BLOCK_POW", "The block proof-of-work is invalid."],
    ["INVALID_GENESIS", "The block has a previd of null but it isn't genesis."]
]

export const ErrorMessageList: {[key: string]: ErrorMessage} = {};
Errors.forEach(
    (e: [string, string], index) => 
    {ErrorMessageList[e[0]] = new ErrorMessage(e[0],e[1])}
)

