// Summary: Anchor deploy script placeholder to initialize a lending market on testnet.
import * as anchor from '@coral-xyz/anchor'

export default async function (provider: anchor.AnchorProvider) {
  anchor.setProvider(provider)
  // TODO: load IDL and program, call initialize_market with desired params
  console.log('Deploy lending: initialization placeholder')
}


