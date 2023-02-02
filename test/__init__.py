from asyncio import StreamWriter, StreamReader
from typing import List
from json import dumps as encode_json
from json import loads as decode_json
import os
import asyncio

PORT = 18018
TEST_TARGET = os.environ.get("TEST_TARGET","127.0.0.1")

ClientList = {}

async def GetClient(name: str):
    if name in ClientList:
        return ClientList[name]
    
    reader, writer = await asyncio.open_connection(
        TEST_TARGET, PORT)
    await SendMsg(writer,
        {"agent":name,"type":"hello","version":"0.9.0"},
    )
    await ExpectMsg(reader, {"type":"hello", "agent": lambda x:True, "version": lambda x: x.startswith("0.9.")})
    await ExpectMsg(reader, {"type":"getpeers"})
    ClientList[name] = (reader, writer)
    return (reader, writer)

async def SendMsg(writer: StreamWriter, *msglist:List[dict]):
    for msg in msglist:
        print("send", msg)
        writer.write( (encode_json(msg) + "\n").encode())
    await writer.drain()


def msg_match(recv_msg:dict, temp_msg:dict):
    assert sorted(list(recv_msg.keys())) == sorted(list(temp_msg.keys()))
    for k, v in temp_msg.items():
        assert k in recv_msg
        if callable(v):
            assert v(recv_msg[k])
        elif isinstance(v, dict):
            assert msg_match(recv_msg[k], v)
        elif isinstance(v, list):
            assert len(v) == len(recv_msg[k])
            for i in range(len(v)):
                if isinstance(v[i], dict):
                    assert msg_match(recv_msg[k][i], v[i])
                else:
                    assert recv_msg[k][i] == v[i]
        elif isinstance(v,str) or isinstance(v,int) or v is None:
            assert v == recv_msg[k]
        else:
            assert False
    return True


async def ExpectMsg(reader: StreamReader, msg:dict, skipList = [
    "ihaveobject","getobject", "getchaintip", "getmempool"]):
    while True:
        recv_msg = decode_json(await reader.readline())
        print("recv", recv_msg)
        if recv_msg["type"] not in skipList:
            break
        else:
            print("skip read another!")
    assert msg_match(recv_msg, msg)