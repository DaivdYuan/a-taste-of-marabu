import * as Messages from "./messages";
import { checkEquivalent } from "./utils";
import { actionList } from "./actions";

var net = require("net");

var server = net.createServer();
server.on("connection", handleConnection);

server.listen(8080, function () {
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
    var segments: string[] = d.split("\n");
    console.log(segments);
    for (let i = 0; i < segments.length - 1; i++) {
      segment = segments[i];
      try {
        data = JSON.parse(segment);
        console.log("Parsed:", data);

        if (!("type" in data) || !(data.type in actionList)){
          throwError("INVALID_FORMAT", segment);
        }
        if (!startedHandshake){
           if (!checkEquivalent<string>(JSON.stringify(data), Messages.helloMessage.json)){
            throwError("INVALID_HANDSHAKE")
           }
           startedHandshake = true;
        }

      } catch (e) {
        throwError("INVAlID_FORMAT", segment)
      }
      
      var curAction = data.type;
      try {
        dispatchAction(curAction);
        
      } catch (e) {
        
      }


    }
  }

  function send(message: Messages.messageType): void {
    conn.write(message.json + "\n");
  }

  function throwError(error: string, message: string = ''): void {
    console.log(error, message);
    send(Messages.ErrorMessageList["INVALID_FORMAT"]);
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
