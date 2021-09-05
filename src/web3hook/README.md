# Web3 provider hook

## Usage

### 1. Wrap your app with the `Web3ContextProvider`

```js
// src/index.js
import Web3ContextProvider from "./web3hook/Web3ContextProvider"

ReactDOM.render(
  <React.StrictMode>
    <Web3ContextProvider>
      <App />
    </Web3ContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
)
```

### 2. Utilisation of `useWeb3()` hook

#### Access to blockchain informations

```js
// src/Dapp.js
const Dapp = () => {
  const { state } = useWeb3()
  const {
    providerType: String,
    ethersProvider: {Web3Provider | FallbackProvider},
    providerSrc: String,
    networkName: String,
    chainId: Number,
    signer: {JsonRpcSigner},
    account: String, // address zero as default
    balance: Number | BigNumber,
  } = state
}
```

#### Connect to Metamask

```js
// src/Dapp.js
const Dapp = () => {
  const { connectToMetamask } = useWeb3()

  {...}

  return <>
    <Button onClick={connectToMetamask}>
      Connect Metamask
    </Button>
  </>
}
```

Do nothing if the provider do not come from Metamask

#### Switch network

```js
// src/Dapp.js
const Dapp = () => {
  const { switchNetwork } = useWeb3()

  {...}

  return <>
    <Button onClick={() => switchNetwork("0x4", "rinkeby")}>Rinkeby</Button>
  </>
}
```

Do not work with **Wallet Connect** and with **Metamask (in read-only)**. With a Fallback provider the page is reload with the switched network in option.

#### Connect with Wallet Connect

The page is reload with an option to connect to Wallet Connect.

```js
// src/Dapp.js
const Dapp = () => {
  const { wcConnect } = useWeb3()

  {...}

  return <>
    <Button onClick={wcConnect}>
    Connect with Wallet Connect
    </Button>
  </>
}
```

Operations with wallet connect have to be tested.

### Use a contract

This hook have access to contract in read-only if there no signer connect to the provider.

```js
const Dapp = () => {
  const [{ contract, mode }] = useContract(contractAddress, contractABI)

  {...}

  async function read(){
    // try / catch if network is not controlled
    const totalSupply = await contract.totalSupply()
  }

  return <>
    <Button onClick={read}>
    Total Supply
    </Button>
  </>
}
```

`mode` return a `String` either `signer` or `read-only`

This hook **must be used in a context** in order to prevent the creation of multiple instance of a contract. Especially if we want to listen event on this contract.

### Do a call on a contract

The `useCall` hook provide a function to do call on a blockchain function:

```js
const contract = {} // is the EthersJS Contract object
const functionName = "" // String correspond to the function name
const params = [] // list of parameter in the order

const result = await contractCall(contract, functionName, params)
```

`result` is either the **transaction object** ([EthersJS](https://docs.ethers.io/v5/api/utils/transactions/#Transaction)) or the result of a read-only function (function view).

The hook provider also a `status` state, which indicate either the transaction is in:

- **"Waiting for comfirmation"**: user must accept transaction on the wallet interface
- **"Pending"**: transaction waiting to be mined
- **"Success"**: transaction success
- **"Failed"**: transaction failed

```js
const Dapp = () => {
  const [{ contract, mode }] = useContract(contractAddress, contractABI)

  const [status, contractCall] = useCall()

  {...}

  async function read(){
    const totalSupply = await contractCall(contract, "totalSupply")
  }

  async function approve(){
    const tx = await contractCall(contract, "approve", [
      "0x3eB876042A00685c75Cfe1fa2Ee496615e3aef8b",
      10000,
    ])
    // tx = transaction
    // tx.transactionHash
  }

  return <>
    <Button onClick={read}>
    Total Supply
    </Button>


    <Button
      isLoading={
        status.startsWith("Pending") ||
        status.startsWith("Waiting")
      }
      loadingText={status}
      disabled={
        status.startsWith("Pending") ||
        status.startsWith("Waiting")
      }
      onClick={approve}>
    Approve
    </Button>
  </>
}
```
