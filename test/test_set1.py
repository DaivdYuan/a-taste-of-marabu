import asyncio
from . import TEST_TARGET, PORT, SendMsg, ExpectMsg

async def _async_test_hello_message():
    reader, writer = await asyncio.open_connection(
        TEST_TARGET, PORT)
    
    msg = {
        "type": "hello",
        "version": "0.9.0",
        "agent": "Marabu-Core Client 0.9"
    }

    await SendMsg(writer, msg)
    await ExpectMsg(reader, {"type":"hello", "agent": lambda x:True, "version": lambda x: x.startswith("0.9.")})
    await ExpectMsg(reader, {"type":"getpeers"})

    await SendMsg(writer, {"type": "getpeers"})
    await ExpectMsg(reader, {"type":"peers", "peers": lambda x: len(x) > 0})


def test_hello_message():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_hello_message(), 10))