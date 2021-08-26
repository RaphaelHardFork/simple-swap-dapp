# Simple swap dApp

## Set up a custom provider

See in the `useProvider.js` hook

## TODO

- add the function to switch network
- try to understand the several render for each block
- see the behavior with no account connected
- use a contract without signer (metamask lock or no connected account)
- try to create a modular function to manage the two case (signer & provider)
- add the wallet connect feature

## Figment

- get provider with detectProvider
  - if provider => ethers web3provider(the right provider: metamask or wallet connect)
  - what is ethers.providers ? can get network without being set ?
  - get address through the signer!
