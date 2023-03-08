import * as ed from '@noble/ed25519'

export type PublicKey = string
export type Signature = string
export const OUR_PRIVATE_KEY = "c4d33f4de9f14407628ae7baed1d3ece52efeb67d4ce02e4019416103e930aad";
export const OUR_PUBLIC_KEY = "e605ef0998748400662cd3ccf216e4f678d02d26ecc6fa248f49fa2aba3cdfb8";

function hex2uint8(hex: string) {
  return Uint8Array.from(Buffer.from(hex, 'hex'))
}

function text2uint8(text: string) {
  return Uint8Array.from(Buffer.from(text, 'utf-8'))
}

export async function ver(sig: Signature, message: string, pubkey: PublicKey = OUR_PUBLIC_KEY) {
  const sigBuffer = hex2uint8(sig)
  const pubkeyBuffer = hex2uint8(pubkey)
  const messageBuffer = text2uint8(message)
  return await ed.verify(sigBuffer, messageBuffer, pubkeyBuffer)
}

export async function sign(message: string, privkey: string = OUR_PRIVATE_KEY) {
  const privkeyBuffer = hex2uint8(privkey)
  const messageBuffer = text2uint8(message)
  return await ed.utils.bytesToHex(await ed.sign(messageBuffer, privkeyBuffer))
}
