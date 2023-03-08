import { canonicalize } from 'json-canonicalize';
import net from 'net';
import * as Messages from "./messages";
import delay from 'delay';

//const SERVER_HOST = '0.0.0.0';
const SERVER_HOST = '149.28.200.131';
const SERVER_PORT = 18018;

function testGetMempool(){
    const getMempoolMessage = canonicalize({
        type: "getmempool"
    });

    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test objects")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(1000);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(1000);
        client.write(getMempoolMessage + '\n');
        await delay(5000);
        client.destroy();

    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
}

//testGetMempool();

function testFrame(objects: string[], keyObjects: string[], t = 1000){
    const client = new net.Socket();
    console.log("--------------------------------");
    console.log("test objects")
    client.connect(SERVER_PORT, SERVER_HOST, async () => {
        console.log('Connected to server.');
        client.write(Messages.helloMessage.json + '\n');
        await delay(t);
        client.write(Messages.getPeersMessage.json + '\n');
        await delay(t);
        for (const object of objects){
            client.write(object + '\n');
            await delay(t);
        }
        console.log("\n----------Sending key objects----------\n");
        for (const object of keyObjects){
            client.write(object + '\n');
            await delay(5000);
            client.write(object + '\n');
            await delay(5000);
        }
        client.destroy();

    })
    client.on('data', (data) => {
        console.log(`Server sent: ${data}`);
    })
}


function test1(){
    const m1 = `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671127728,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c74524102d722","note":"Second block","previd":"00000000a4636e3620fe684395bb4af54c4f0d6c545731ad47a26bc38a9d3a33","txids":["4b4f9b3bcd3f03632104174facd43a64e2cb3573b4de8d445e5056207fe8ed6c"],"type":"block"},"type":"object"}`
    const m2 = `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671064883,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c74523db9d21d","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["02645e3b1f5b4cdd665cca185933c6dc60c30f72d457f2d61caa0f5401fa40cd"],"type":"block"},"type":"object"}`
    const m3 = `{"object":{"height":1,"outputs":[{"pubkey":"deb4d9e3e33b43abb8980d5696b88d7ec3e2cdf89a20100dc0a4ff7ca8c85f16","value":400}],"type":"transaction"},"type":"object"}`
    const m4 = `{"object":{"height":2,"outputs":[{"pubkey":"cb0b735b03b2832c91006c0e0cf98a0b4ae62a42f7b25c9b03464b5f691cbaf3","value":600}],"type":"transaction"},"type":"object"}`
    const m5 = `{"object":{"inputs":[{"outpoint":{"index":0,"txid":"02645e3b1f5b4cdd665cca185933c6dc60c30f72d457f2d61caa0f5401fa40cd"},"sig":"5a198fb2580a2d523271ffffb103600b46d8fb03bd266e2ca71caef5d7c91849288b45751ee072ea48cf2a39a7c16dd084045a38003c8cca0cb602500486f70e"},{"outpoint":{"index":0,"txid":"4b4f9b3bcd3f03632104174facd43a64e2cb3573b4de8d445e5056207fe8ed6c"},"sig":"64833f061f57e1407d984359cc481a8d1f46e95bec21901ae23e1af1e43b8c876884689cc3df80f8e8810ba531721f409fd6becb6a54aa43c63be93c7b4a2808"}],"outputs":[{"pubkey":"deb4d9e3e33b43abb8980d5696b88d7ec3e2cdf89a20100dc0a4ff7ca8c85f16","value":10}],"type":"transaction"},"type":"object"}`
    const m6 = `{"objectid":"6ca2a68e2c9e49e8699e6545d25f32250667836bf5a23fe0eedaa10dcbee8f0c","type":"getobject"}`

    testFrame([m1, m2, m3, m4, m5], [m6]);
}

function test2(){
    const m1 = `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671150217,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f37681a44","note":"Second block","previd":"0000000089500277975005629fea59d1a6c6068f5aff0573812f91ae9c5c31af","txids":["4fa7060d11f29877cd80800a2854bf6bb75e3eb6db774aa9ce785eb7100a8ea4"],"type":"block"},"type":"object"}`
    const m2 = `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671096089,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb274627545cf","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["4c633f42728aa7690ab2e14123479ee659549193ba1397715514ed4064d3bfea"],"type":"block"},"type":"object"}`
    const m3 = `{"object":{"height":1,"outputs":[{"pubkey":"68fd5e3f3847f489dd6c100360d6f7d8289681f4d4cdbf2f051d75bcb892e94b","value":400}],"type":"transaction"},"type":"object"}`
    const m4 = ` {"object":{"height":2,"outputs":[{"pubkey":"84f84b9d3db5434f6713099078eadc3fc81c05c43c8337bb14348914d77c5932","value":600}],"type":"transaction"},"type":"object"}`
    const m5 = `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671230855,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbc064bc41","note":"Third block","previd":"000000003ba75607d7fb59ed86a793de125de94aac40cd9769826ed6f2a09d26","txids":["47eb95f0eed759ff8747bbc3c62a548d4e4d2ed15a12e34ff96ebba00cdd776e"],"type":"block"},"type":"object"}`
    const m6 = `{"object":{"inputs":[{"outpoint":{"index":0,"txid":"4c633f42728aa7690ab2e14123479ee659549193ba1397715514ed4064d3bfea"},"sig":"47cff680b33d0dfe28a66544662353c70d186e1cc581f011f056ee3ef7724577451ffaf40fc81c1ea3b235123a92653408a9a8d2ddb875234cf3bad39eaea70f"},{"outpoint":{"index":0,"txid":"4fa7060d11f29877cd80800a2854bf6bb75e3eb6db774aa9ce785eb7100a8ea4"},"sig":"72ca413bd576f2f1993b7d91efd4c71e13b9d42ed9157e7ad6f876817b36f6905c2b5bd4c6db49ff5a2ce83686c210cf87117433e5bbd53ae12b5375db47fe0f"}],"outputs":[{"pubkey":"68fd5e3f3847f489dd6c100360d6f7d8289681f4d4cdbf2f051d75bcb892e94b","value":10}],"type":"transaction"},"type":"object"}`
    const m7 = `{"objectid":"0000000072dc1da005461ed8c058fece4544073538e3f4751ba61120281ae86d","type":"getobject"}`

    testFrame([m1, m2, m3, m4, m5, m6], [m7]);
}    

function test3(){
    const m1 = `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671104848,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cf67bf4d7","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["4a25589d0362cf788a4906b7c0c9522559d3f452e43b3affb437d048741a8aab"],"type":"block"},"type":"object"}`
    const m2 = `{"object":{"height":1,"outputs":[{"pubkey":"200148a9e8aea455589d98ce831b2ccfdfb28a223c7e46dbae6c14013467918c","value":400}],"type":"transaction"},"type":"object"}`
    const m3 = `{"object":{"inputs":[{"outpoint":{"index":0,"txid":"4a25589d0362cf788a4906b7c0c9522559d3f452e43b3affb437d048741a8aab"},"sig":"9a360d283b0b3624d77d0312d5008935dc024b6754c27703d90b5028e9d3fc8c760ecf16494113366d238f5c2e870b1287f35117ba88c2f45d57c5af37e8310b"},{"outpoint":{"index":0,"txid":"4a25589d0362cf788a4906b7c0c9522559d3f452e43b3affb437d048741a8aab"},"sig":"9a360d283b0b3624d77d0312d5008935dc024b6754c27703d90b5028e9d3fc8c760ecf16494113366d238f5c2e870b1287f35117ba88c2f45d57c5af37e8310b"}],"outputs":[{"pubkey":"200148a9e8aea455589d98ce831b2ccfdfb28a223c7e46dbae6c14013467918c","value":10}],"type":"transaction"},"type":"object"}`

    testFrame([m1, m2, m3],[]);
}

function test4(){
    const m1 = `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671068192,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b44261c44f96","note":"This block contains a note which has more than 128 characters. It is an invalid block. You should ensure that the note and miner fields in a block are ASCII-printable strings up to 128 characters long each.","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}`

    testFrame([m1],[]);
}

function test5(){
    let objects:string[] = [];
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1672097032,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c7451cc9db602","note":"Fifth block","previd":"000000004005ec7c733c25dfc39810a465e75276efc616a4c72631a2c932702d","txids":["1802ac8ce48e5923d64510bec7d4fa4f385e1f489b370c977a43999d1cd1eeeb","b3f8f422d04b90863dfa42a35d743e555e8c5ebbf75e3f5d09a34f0518fe9d07"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1672037983,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b441ed81845d","note":"Fourth block","previd":"0000000057562aea36ace523c9d21b8babfb9c5eeb39c81ae3ef4ee4896ac50d","txids":["82061fe1bc0aa40cd47d974d1370682dad66a3ea271c00980264ca24544a08a1","62dd9bc84aa3b6c3aa752adee061993f00a464599843402d3857e31a076706fa"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1672013469,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbcfb45e45","note":"Third block","previd":"000000006d9664d0be194502d4eb1ff548fdc6d2476c52f538a93fe81a46f054","txids":["0ec3d29d6cc241d9c21cc4540c6ffc1c7a39b7ea7a168b07bb2410f84624741f","35cf663af677600c08acd562c7a0cdc9f817f1de89cf6e293cdbfd16e9fb9c3e"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671948306,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ccbb3d68e","note":"Second block","previd":"00000000a0e4cf2b1cb6a1d3e1c87fa486ec28589dfe84c26d1b684d03d4178f","txids":["7d0f471727af839843fa2aa54e6d9a7165b57dc4e5ca4926526fd5480c591c46"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671917454,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cde154e4f","note":"First block","previd":"00000000a7d343579d796fe01600844f52dfe64f0dbca7ec2b3119edf5c7295a","txids":["49e0562967c0b316391421e95f829aa2e3d2b954b6ff6c5ae05c22e1990df964"],"type":"block"},"type":"object"}`)
    
    //testFrame(objects,[]);
    //return
    
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671857093,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cf1ff26b4","note":"Block 20","previd":"0000000088b7059824c566671b6c0a183d75acb455089466876f07ed82df1c32","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671855846,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbb524e0a4","note":"Block 19","previd":"0000000061dfe71b4d7010e0bbad78a549aef3069b43b4ba0659f80c2652fc03","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671799992,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbf73200da","note":"Block 18","previd":"000000007e31f2cec831bb993024a656ba6c54c423b58a2c3ebca3b4965d5827","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671796401,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cc04b981dc","note":"Block 17","previd":"00000000a0f3b02cfd6ffa4b6b1e329a509fec9126d18a55cd308705d4e379af","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671741537,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cc5085502","note":"Block 16","previd":"000000006180f5548a51ae8dd292d2f698788d28c280983ba67439a8c1a07cb9","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671713001,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b1903eb88e5c","note":"Block 15","previd":"00000000237cb5fe1439cc522cb7d4f64172b96307828803f6a6a3c06453b8a9","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671711442,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b4423a1ca5ce","note":"Block 14","previd":"000000004aad030d7704407f400e0f4600aef2cbafdcb8a17e36158657b48879","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671655198,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c7451cff21217","note":"Block 13","previd":"00000000a5cdf725bbb89b2bd191130ce1c1c4a46b28b50014f0c78bb4bba39f","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671628291,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb99d5057f","note":"Block 12","previd":"00000000764bcc1409fbdbcc05572ca4f99650c68ae3432c2a8e51475a0f82b9","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671601758,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbe3947a16","note":"Block 11","previd":"0000000023831fb365bedb3ffba2dec3bed7d73d4e1455ab7adb09ea13c14cf9","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671572577,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbd86e1853","note":"Block 10","previd":"00000000418d77c3e1f2850c68aaf2d12286fd81032646461b1012ca9b341cab","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671511105,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b44227104cbe","note":"Block 9","previd":"000000000d5fd678303da8945a6261e6497cff192269265fc840e34e8e1b358d","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671443856,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb274b0bfba35","note":"Block 8","previd":"0000000037ba909fc92c5bec0de9fb8f7d89ba33d74eb24305a198d8d542caf5","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671397799,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204ef6c6f6ae","note":"Block 7","previd":"000000003e61a437dabc6745b8ba14c799b7921d80b36af5b0f77a7abb805156","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671335896,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb2748a202a8d","note":"Block 6","previd":"00000000ab7428c6750fc46f0132059defb131bca4ccb7a237d7c02c616f1ea8","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671256724,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f10b3cd48","note":"Block 5","previd":"00000000aa6f92fe1c1b1559664330b9a3d56866a0accaf32a0f4f20332bc14c","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671206256,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cc8793347","note":"Block 4","previd":"0000000085eb5ec06924779300eaba415a4f0c76e881bca71830b69c249729f4","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671186514,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f220b5fbb","note":"Block 3","previd":"00000000887665fa2b4de8bb4372f86a1ace79a60e9953da7bc1a2db6223cb59","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671141856,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb274ec5491b6","note":"Block 2","previd":"000000003908c6e3dc4a81094166bfb15103f08337e270d5dd265bac5e8493ef","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671122789,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b442084d67bb","note":"Block 1","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}`)


    objects.push(`{"object":{"inputs":[{"outpoint":{"index":0,"txid":"82061fe1bc0aa40cd47d974d1370682dad66a3ea271c00980264ca24544a08a1"},"sig":"ef0a70501909ca07375f28fd8b35f891731c54fb8982f13d3ab4dc30650fa007044416c2a08909482eda0884843c7969720017ff66ff6ae46f1cc0f1a4ec9e07"}],"outputs":[{"pubkey":"6ab2afb0d8d91c6dbfa8612904230ecfc7754febcadb710460db4f34f14daabb","value":10}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"inputs":[{"outpoint":{"index":0,"txid":"1802ac8ce48e5923d64510bec7d4fa4f385e1f489b370c977a43999d1cd1eeeb"},"sig":"5df6f28bd6b302830df053d23e4199de3e80b70d37e65fb6aadc273a923bcd15012875eee214ddceef406cd31e90654cb2578063e23cfbc63e1da265454e8807"}],"outputs":[{"pubkey":"065f45bf690bc4995791369da834aaa1248080fffd3125a3875d76f4d80dad68","value":10}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"inputs":[{"outpoint":{"index":0,"txid":"49e0562967c0b316391421e95f829aa2e3d2b954b6ff6c5ae05c22e1990df964"},"sig":"6c95e0bba7f7b342cf0d29695ca8fe9ee3d8084b88a2bab50e279354219671d4dcb4cfa95a91967e4be0953b5f67f60052a474b4964e679dade8333e1a462a09"}],"outputs":[{"pubkey":"9c36a788f48db23289bdb44312db43abf1971543bef3546583e99e7c8d7aab8b","value":20}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"height":21,"outputs":[{"pubkey":"1010aa0bb3d8cc112f7e6c172038a0029c78866b70959222f6e7739cdcd934c8","value":400}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"inputs":[{"outpoint":{"index":0,"txid":"7d0f471727af839843fa2aa54e6d9a7165b57dc4e5ca4926526fd5480c591c46"},"sig":"5ca6cd3949f4f2a024630e4ff27e42c02adffde324ffad82c98ad9c09d2af434d138881c69cf4d49da3dac400f201cf0766438dc39148c2cb9d61bd07609720b"}],"outputs":[{"pubkey":"f5b51ecf9ad70301553d3e5f9299e2c8766f8bbbbb3c2a5432a56f69b3ca6308","value":20}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"height":26,"outputs":[{"pubkey":"cf5a800a51de4d786d234421024f5c03c2f5c05d63f564c170b3031211780916","value":400}],"type":"transaction"},"type":"object"}`)

    let keyObjects:string[] = []
    keyObjects.push(`{"type":"getmempool"}`)

    testFrame(objects, keyObjects, 50)
}

function test6() {
    let objects:string[] = []
    
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1672137626,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b441fc68bc86","note":"New sixth block","previd":"000000000474866bce17e23d78a1657e8ede848af734b83454fb8bed463f18ec","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1672106718,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cd1b230ab","note":"New fifth block","previd":"000000003c335476ebaf28d224a7182c9e6caca35473c4b714ca9b0dc726ca95","txids":[],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1672036939,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875d26a35e2d","note":"New fourth block","previd":"0000000057562aea36ace523c9d21b8babfb9c5eeb39c81ae3ef4ee4896ac50d","txids":["60c3e2f40d8a039d145fda39ce82d64257bdf8494f974ae98edb415baaea0141"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1672013469,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbcfb45e45","note":"Third block","previd":"000000006d9664d0be194502d4eb1ff548fdc6d2476c52f538a93fe81a46f054","txids":["0ec3d29d6cc241d9c21cc4540c6ffc1c7a39b7ea7a168b07bb2410f84624741f","35cf663af677600c08acd562c7a0cdc9f817f1de89cf6e293cdbfd16e9fb9c3e"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671948306,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ccbb3d68e","note":"Second block","previd":"00000000a0e4cf2b1cb6a1d3e1c87fa486ec28589dfe84c26d1b684d03d4178f","txids":["7d0f471727af839843fa2aa54e6d9a7165b57dc4e5ca4926526fd5480c591c46"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671917454,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cde154e4f","note":"First block","previd":"00000000a7d343579d796fe01600844f52dfe64f0dbca7ec2b3119edf5c7295a","txids":["49e0562967c0b316391421e95f829aa2e3d2b954b6ff6c5ae05c22e1990df964"],"type":"block"},"type":"object"}`)
    objects.push(`{"object":{"height":23,"outputs":[{"pubkey":"b1444716930feb7bdafda2a44b0e04598f3036acb8d65e06585f17c354ea6431","value":400}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"height":22,"outputs":[{"pubkey":"f5b51ecf9ad70301553d3e5f9299e2c8766f8bbbbb3c2a5432a56f69b3ca6308","value":400}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"inputs":[{"outpoint":{"index":0,"txid":"49e0562967c0b316391421e95f829aa2e3d2b954b6ff6c5ae05c22e1990df964"},"sig":"ef9ebf4f279f5de09f67b7e437f73e7eca5fc151cbca7bb0a7af6ff975f76763a221d14ebebe7b5e850684756e69cfc9a18cce8fced688806322805282a7b109"}],"outputs":[{"pubkey":"9c36a788f48db23289bdb44312db43abf1971543bef3546583e99e7c8d7aab8b","value":10}],"type":"transaction"},"type":"object"}`)
    objects.push(`{"object":{"inputs":[{"outpoint":{"index":0,"txid":"0ec3d29d6cc241d9c21cc4540c6ffc1c7a39b7ea7a168b07bb2410f84624741f"},"sig":"d5e2f5fb28154855ec95fd5188a47716a5d4b817560cc673c05a2ee91cc50134dd7704cc9226022f26423d9fe45293a0c2ea775e4d5b367d23157615e576f903"}],"outputs":[{"pubkey":"b1444716930feb7bdafda2a44b0e04598f3036acb8d65e06585f17c354ea6431","value":20}],"type":"transaction"},"type":"object"}`)
    
    const m = `{"type":"getmempool"}`

    testFrame(objects, [m])
}

//test1() // PASS
//test2() // PASS
//test3() // PASS
//test4() // PASS
//test5()
test6()