import * as Messages from "./messages";
import { checkEquivalent } from "./utils";
import { actionList } from "./actions";
import { canonicalize, canonicalizeEx } from 'json-canonicalize';
import delay from 'delay';

var net = require("net");

const PORT = 18018;

var server = net.createServer();
server.on("connection", handleConnection);

server.listen(PORT, function () {
  console.log("server listening to %j", server.address());
});

function handleConnection(conn: any): void {

  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  var buffer: string = "";
  var startedHandshake: boolean = false;

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
    var data: {[key: string]:any} = {}, segment: string;
    buffer += d;
    const segments: string[] = buffer.split("\n");
    console.log(segments);
    for (let i = 0; i < segments.length - 1; i++) {
      segment = segments[i];
      try {
        data = JSON.parse(segment);
        console.log("Parsed:", data);

      if (!("type" in data) || !actionList.includes(data.type)){
        throwError("INVALID_FORMAT", segment);
      }
      if (!startedHandshake){
          if (!checkEquivalent<string>(JSON.stringify(data), Messages.helloMessage.json)){
          throwError("INVALID_HANDSHAKE")
          }
          startedHandshake = true;
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
