# worker-w3up-client-example

Cloudflare Workers introduce some challenges on how to load wasm code compared to other environments.

In [CF workers, wasm bytecode must be imported](https://developers.cloudflare.com/workers/runtime-apis/webassembly/javascript/), as all other paths are disallowed by embedder.

Other environments do not behave like this, and sometimes even forbid what is the default within Cloudflare.

## What is needed?

We essentially need to perform a custom `esbuild` instead of relying on default `wrangler` build. With this, we can use [`esbuild-plugin-w3up-client-wasm-import`](https://github.com/vasco-santos/esbuild-plugin-w3up-client-wasm-import) to transform the build to use wasm imports, instead of default behaviour. See `build.js` for the custom build details.

## Setup environment to run this example

1. Open `src/index.js` and modify `INSERT_YOUR_KEY` to your `secret_key` (you can see below how to generate one)
2. Open `src/index.js` and modify `INSERT_YOUR_PROOF` to your `proof` (you can see below how to generate one)
3. Run `npm run deploy` and login with your Cloudflare Account.
4. Make `KEY` and `PROOF` Cloudflare bindings so that they are not hardcoded
  1. ⚠️ unfortunately CF Workers secrets do not support large secrets like needed for `PROOF`

## Generating a `secret_key` and `proof`

On your dev machine, use [w3cli] to generate a `secret_key` and `proof` to allow this action to upload to a space.

Install it from npm and login as described here https://web3.storage/docs/quickstart/ then create a key like this:

```shell
# Use the `did` in the input to the next command. 
# Use `key` as your `secret_key` for add_to_web3.
$ w3 key create --json
{
  "did": "did:key:z6Mk...",
  "key": "MgCaT7Se2QX9..."
}
```

Keep the `key` safe. Save it as a secret on your repo.

Copy the `did` for use in the next command. The output is a base64 encoded ucan `proof` that delegates capabilities to `store/add` and `upload/add` on your current space to the key generated above.

```shell
# Delegate capabilities to the `did` we created above.
$ w3 delegation create did:key:z6Mk... -c 'store/add' -c 'upload/add' --base64
mAYIEAP8OEaJlcm9vdHOAZ3ZlcnNpb24BwwUBcRIg+oHTbzShh1WzBo9ISkonCW+KAcy/+zW8Zb...
```

The capabilies `store/add` and `upload/add` are the minimum required to upload files to web3.storage.
