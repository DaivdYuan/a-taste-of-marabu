import * as Messages from "./messages";
import { checkEquivalent, isValidPeer, matchesValidFields } from "./utils";
import { actionList } from "./actions";
import { canonicalize } from 'json-canonicalize';
import { getLocalPeers, addPeers } from "./pipeline"
import delay from 'delay';
import * as net from 'net';

const TIME_OUT = 10000;
const PORT = 18018;

var server = net.createServer();
server.on("connection", handleConnection);

const client = new net.Socket();

server.listen(PORT, function () {
  console.log("server listening to %j", server.address());
});

function handleConnection(conn: net.Socket): void {

  function closeConnection() {
    if (buffer === "") return;
    const err_msg = "Time out. Not receiving remaining package."
    console.log(err_msg);
    conn.write(err_msg + "\n");
    conn.destroy();
  }

  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  var buffer: string = "";
  var startedHandshake: boolean = false;
  var timer_id: any;

  console.log("------------------------------------");
  console.log("new client connection from %s\n", remoteAddress);
  conn.setEncoding("utf8");

  initializeConnection(conn);

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function initializeConnection(conn: any) {
    send(Messages.helloMessage);
    send(Messages.getPeersMessage);
  }

  function onConnData(d: string) {
    console.log("connection data from %s:", remoteAddress);
    timer_id = setTimeout(closeConnection, TIME_OUT);
    var data: Messages.messageType, segment: string;
    buffer += d;
    const segments: string[] = buffer.split("\n");
    console.log(segments);
    for (let i = 0; i < segments.length - 1; i++) {
      clearTimeout(timer_id);
      segment = segments[i];
      try {
        data = <Messages.messageType>JSON.parse(segment);
        console.log("\n> Parsed:", data);

        if (!("type" in data) || !actionList.includes(data.type)){
          throwError("INVALID_FORMAT", segment);
          return;
        }
        if (!startedHandshake){
            if (!checkEquivalent<string>(canonicalize(data), Messages.helloMessage.json)){
              throwError("INVALID_HANDSHAKE");
              return;
            }
            startedHandshake = true;
            continue;
        }

      } catch (e) {
        throwError("INVALID_FORMAT", segment)
        return;
      }
      
      var curAction = data.type;
      try {
        dispatchAction(curAction, data);  
      } catch (e) {
        throwError("INVALID_FORMAT", segment);
        return;
      }


    }
    if (segments.length > 1) buffer = segments[segments.length - 1];
    timer_id = setTimeout(closeConnection, TIME_OUT);
  }

  function send(message: Messages.messageType): void {
    conn.write(message.json + "\n");
  }

  function throwError(error: string, message: string = ''): void {
    console.log("Error: " + error);
    console.log("Message: " + message);
    send(Messages.ErrorMessageList[error]);
    conn.destroy();
  }

  function dispatchAction(action: string, msg: Messages.messageType): number {
    console.log("Dispatching action: " + action);
    switch (action) {
      
      case "getpeers":

        if (!(matchesValidFields(Messages.GetPeersMessage.validKeys, Object.keys(msg)))){
          throwError("INVALID_FORMAT", msg.json);
          return -1;
        }

        send(new Messages.PeersMessage(getLocalPeers()));
        break;

      case "peers":

        if (!(matchesValidFields(Messages.PeersMessage.validKeys, Object.keys(msg)))){
          throwError("INVALID_FORMAT", msg.json);
          return -1;
        }

        msg = <Messages.PeersMessage> msg;
        if (!("peers" in msg) || !isValidPeer(msg.peers)) {
          throwError("INVALID_FORMAT", msg.json);
          return -1;
        }
        addPeers(msg.peers);
        break;

      case "hello":
        throwError("INVALID_HANDSHAKE", msg.json);
        return -1;

      case "error":
        closeConnection();
        return -1;
    }
    return 0;
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
    clearTimeout(timer_id);
  }

  function onConnError(err: any) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}
