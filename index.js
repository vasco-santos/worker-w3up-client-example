/* eslint-env serviceworker */
import * as Signer from '@ucanto/principal/ed25519'
import { importDAG } from '@ucanto/core/delegation'
import { CarReader } from '@ipld/car'
import * as Client from '@web3-storage/w3up-client'
import { StoreMemory } from '@web3-storage/w3up-client/stores/memory'
import { fromString } from 'uint8arrays/from-string'

/**
 * @typedef {import('./bindings.js').Environment} Environment
 */

export default {
  /**
   * @param {Request} request
   * @param {Environment} env
   */
  async fetch (request, env) {
    const key = env.KEY || 'INSERT_YOUR_KEY'
    const proofString = env.PROOF || 'INSERT_YOUR_PROOF'

    const principal = Signer.parse(key)
    const store = new StoreMemory()
    const client = await Client.create({ principal, store })
    
    // now give Agent the delegation from the Space
    const proof = await parseProof(proofString)
    const space = await client.addSpace(proof)
    await client.setCurrentSpace(space.did())

    const res = await client.uploadFile(new Blob([new Uint8Array([1, 2, 3])]))
    return new Response(res.link().toString())
  }
}

/** @param {string} data Base64 encoded CAR file */
async function parseProof (data) {
  const blocks = []
  const reader = await CarReader.fromBytes(fromString(data, 'base64'))
  for await (const block of reader.blocks()) {
    blocks.push(block)
  }
  return importDAG(blocks)
}
