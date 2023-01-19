import * as Messages from "./messages";
import { checkEquivalent } from "./utils";
import { actionList } from "./actions";
import { canonicalize, canonicalizeEx } from 'json-canonicalize';
import delay from 'delay';

var net = require("net");

const PORT = 18018;
//const PEERS = ["45.63.84.226", "45.63.89.228", "144.202.122.8"] // check `pipeline.ts`
var server = net.createServer();
server.on("connection", handleConnection);

const client = new net.Socket();

server.listen(PORT, function () {
  console.log("server listening to %j", server.address());
});

function handleConnection(conn: any): void {

  function closeConnection() {
    const err_msg = "Time out. Not receiving remaining package."
    console.log(err_msg);
    conn.write(err_msg + "\n");
    conn.destroy();
  }

  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  var buffer: string = "";
  var startedHandshake: boolean = false;
  var timer_id;

  console.log("------------------------------------");
  console.log("new client connection from %s", remoteAddress);
  conn.setEncoding("utf8");

  initializeConnection(conn);

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function initializeConnection(conn: any) {
    send(Messages.helloMessage);
    send(Messages.getPeersMessage);
  }

  function onConnData(d: any) {
    console.log("connection data from %s:", remoteAddress, d);
    timer_id = setTimeout(closeConnection, 30000);
    var data: {[key: string]: any} = {}, segment: string;
    buffer += d;
    const segments: string[] = buffer.split("\n");
    console.log(segments);
    for (let i = 0; i < segments.length - 1; i++) {
      clearTimeout(timer_id);
      segment = segments[i];
      data = {};
      try {
        data = JSON.parse(segment);
        console.log("Parsed:", data);

        if (!("type" in data) || !actionList.includes(data.type)){
          throwError("INVALID_FORMAT", segment);
        }
        if (!startedHandshake){
            if (!checkEquivalent<string>(canonicalize(data), Messages.helloMessage.json)){
              throwError("INVALID_HANDSHAKE");
            }
            startedHandshake = true;
            continue;
        }

      } catch (e) {
        throwError("INVALID_FORMAT", segment)
      }
      
      var curAction = data.type;
      try {
        dispatchAction(curAction);
        
      } catch (e) {
        
      }


    }
    if (segments.length > 1) buffer = segments[segments.length - 1];
    timer_id = setTimeout(closeConnection, 30000);
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

  function dispatchAction(action: string): number {
    console.log("Dispatching action: " + action);
    //TODO
    return 0;
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err: any) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}
