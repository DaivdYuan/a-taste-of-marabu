import asyncio
from . import TEST_TARGET, PORT, GetClient, SendMsg, ExpectMsg

async def _async_test_msg1():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671062400,"miner":"Marabu","nonce":"000000000000000000000000000000000000000000000000000000021bea03ed","note":"The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers","previd":None,"txids":[],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await SendMsg(writer,
        {"objectid":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","type":"getobject"}
    )

    await ExpectMsg(reader, msg)

def test_msg1():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_msg1(), 10))


async def _async_test_msg2():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671148800,"miner":"grader","nonce":"1000000000000000000000000000000000000000000000000000000001aaf999","note":"This block has a coinbase transaction","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["6ebfb4c8e8e9b19dcf54c6ce3e1e143da1f473ea986e70c5cb8899a4671c933a"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await SendMsg(writer,
    {"objectid":"0000000093a2820d67495ac01ad38f74eabd8966517ab15c1cb3f2df1c71eea6","type":"getobject"}
    )

    await ExpectMsg(reader, msg)

def test_msg2():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_msg2(), 10))


async def _async_test_msg3():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671280061,"miner":"grader","nonce":"200000000000000000000000000000000000000000000000000000000b2c14c5","note":"This block has another coinbase and spends earlier coinbase","previd":"0000000093a2820d67495ac01ad38f74eabd8966517ab15c1cb3f2df1c71eea6","txids":["ddfc138d25e79eb59be0ad0d485f70d7f8180efb56e2afba4c401bb36bd749ec","8b3e362a7265c33dfbbd67e1eeeaaaf26ccdcc02aeb0c17ee417f8310641903e"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await SendMsg(writer,
    {"objectid":"0000000043e019834458a74a3334da6e2bd1c57e773e6440a6242a04ca04d94d","type":"getobject"}
    )

    await ExpectMsg(reader, msg)

def test_msg3():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_msg3(), 10))


async def _async_test_INVALID_FORMAT():
    reader, writer = await GetClient("G_1")

    msg =  {"object":{"T":"0f00000000000000000000000000000000000000000000000000000000000000","created":1671355937,"miner":"grader","nonce":"1000000000000000000000000000000000000000000000000000000000000000","note":"Block with incorrect target","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "INVALID_FORMAT",
        "description": lambda x: True
    })


def test_INVALID_FORMAT():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_INVALID_FORMAT(), 10))


async def _async_test_INVALID_BLOCK_POW():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671356958,"miner":"grader","nonce":"00000000000000000000000000000000000000000000000000000000012baaaa","note":"Block with invalid PoW","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "INVALID_BLOCK_POW",
        "description": lambda x: True
    })

def test_INVALID_BLOCK_POW():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_INVALID_BLOCK_POW(), 10))


async def _async_test_INVALID_BLOCK_COINBASE():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671470413,"miner":"grader","nonce":"100000000000000000000000000000000000000000000000000000000c6bccff","note":"This block violates the law of conservation","previd":"0000000087aa358369304cf750fddfccf6d66fe04344d090b27af51213c1b5c0","txids":["5511abce2e64f90da983b2a103623e49c49aa6f62706be0b59ab47306c965db4","e2095e1c75a0950c1d699287b15ba976ba39c8d0989c4c6c2457c38a9bb6330c"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "INVALID_BLOCK_COINBASE",
        "description": lambda x: True
    })

def test_INVALID_BLOCK_COINBASE():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_INVALID_BLOCK_COINBASE(), 10))


async def _async_test_INVALID_TX_OUTPOINT():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671499512,"miner":"grader","nonce":"400000000000000000000000000000000000000000000000000000003ba510f9","note":"This block has a transaction spending the coinbase","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","e2095e1c75a0950c1d699287b15ba976ba39c8d0989c4c6c2457c38a9bb6330c"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "INVALID_TX_OUTPOINT",
        "description": lambda x: True
    })

def test_INVALID_TX_OUTPOINT():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_INVALID_TX_OUTPOINT(), 10))


async def _async_test_UNFINDABLE_OBJECT():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671550512,"miner":"grader","nonce":"600000000000000000000000000000000000000000000000000000000c1ac6bc","note":"This block contains an invalid transaction","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","fe5ee59b947633b0d36e098648d5fe660675a58eae6952db04ac79e06fb6737c"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "UNFINDABLE_OBJECT",
        "description": lambda x: True
    })

def test_UNFINDABLE_OBJECT():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_UNFINDABLE_OBJECT(), 10))


async def _async_test_INVALID_BLOCK_COINBASE():
    reader, writer = await GetClient("G_1")

    msg = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671570824,"miner":"grader","nonce":"100000000000000000000000000000000000000000000000000000001d69ea34","note":"This block has 2 coinbase transactions","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff","85b72002ffacb4f5e309b772098ba02391df90803c1c814c45cff8053f4e16ff"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "INVALID_BLOCK_COINBASE",
        "description": lambda x: True
    })


def test_INVALID_BLOCK_COINBASE():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_INVALID_BLOCK_COINBASE(), 10))


async def _async_test_INVALID_TX_OUTPOINT2():
    reader, writer = await GetClient("G_1")

    msg1 = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671590312,"miner":"grader","nonce":"100000000000000000000000000000000000000000000000000000000c0491a3","note":"This block has a coinbase transaction","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["7d1ddab9e04e3ccb00ef390de7529a75635509ed20d64fc25080e4f7015d9e41"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg1)

    await SendMsg(writer, {"objectid":"00000000a869eab8426edd28efe3c3ab6128af715d094b317124e763759ccf29","type":"getobject"})

    await ExpectMsg(reader, msg1)

    msg2 = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671619268,"miner":"grader","nonce":"2000000000000000000000000000000000000000000000000000000046eb0310","note":"This block spends coinbase transaction twice","previd":"00000000a869eab8426edd28efe3c3ab6128af715d094b317124e763759ccf29","txids":["4f5f84ad663440bd8e57fef248be86289040503e9d1c6cb66332522b0edbf508","2c43a5adcd17fa394d1dfbef0078c6057c06a0f79ad70214f57b70cf64cf5da1"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg2)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "INVALID_TX_OUTPOINT",
        "description": lambda x: True
    })

def test_INVALID_TX_OUTPOINT2():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_INVALID_TX_OUTPOINT2(), 10))


async def _async_test_INVALID_TX_OUTPOINT3():
    reader, writer = await GetClient("G_1")

    msg1 =  {"object":{"height":1,"outputs":[{"pubkey":"260270b6d9fdfcc6d4aed967915ef64d67973e98f9f2216981c603c967608806","value":50000000000000}],"type":"transaction"},"type":"object"}

    await SendMsg(writer, msg1)

    await SendMsg(writer, {"objectid":"322cdf4e2efa5004a8ff2333bdd68d6be185a040d141737dbf4691184d8348d0","type":"getobject"})

    await ExpectMsg(reader, msg1)

    msg2 = {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671902581,"miner":"grader","nonce":"400000000000000000000000000000000000000000000000000000000ffc4942","note":"This block spends a coinbase transaction not in its prev blocks","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["ae75cdf0343674d8368222995ab33e687df8f6a1514fd4060864447de14abb77"],"type":"block"},"type":"object"}

    await SendMsg(writer, msg2)

    await ExpectMsg(reader, {
        "type": "error",
        "name": "INVALID_TX_OUTPOINT",
        "description": lambda x: True
    })

def test_INVALID_TX_OUTPOINT3():
    asyncio.get_event_loop().run_until_complete(asyncio.wait_for( _async_test_INVALID_TX_OUTPOINT3(), 10))

