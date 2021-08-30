import detectEthereumProvider from "@metamask/detect-provider"
import { ethers } from "ethers"
import { useEffect, useReducer, useRef, useState } from "react"

const chainIdtoName = (chainId) => {
  switch (chainId) {
    case 1:
      return "Mainnet"
    case 3:
      return "Ropsten"
    case 4:
      return "Rinkeby"
    case 42:
      return "Kovan"
    case 5:
      return "Goerli"
    default:
      return "unknown network"
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        providerType: action.providerType,
      }
    case "SET_NETWORK":
      return {
        ...state,
        networkId: action.payload.chainId,
        networkName: chainIdtoName(action.payload.chainId),
      }
    case "SET_ACCOUNT":
      return { ...state, signer: action.signer, account: action.account }

    default:
      console.error(
        `Wrong action type in the useMetamask hook reducer, ${action.type}`
      )
  }
}

export const useProviders = () => {
  const [provider, setProvider] = useState(null)
  const isMounted = useRef(false)

  const [state, dispatch] = useReducer(reducer, {
    providerType: undefined,
    provider: null,
    signer: null,
    account: ethers.constants.AddressZero,
    networkName: undefined,
    networkId: 0,
  })

  // 1. Find a provider
  useEffect(() => {
    console.log("1. Get the provider")
    ;(async () => {
      let catchedProvider = null
      try {
        // correspond to window.ethereum = the provider of Metamask
        catchedProvider = await detectEthereumProvider() // dot throw e
        setProvider(catchedProvider)
      } catch (e) {
        console.log(e)
      }
      if (catchedProvider === null) {
        // if there is no metamask extension installed
        catchedProvider = ethers.getDefaultProvider("kovan")
        setProvider(catchedProvider)
      }
    })()
  }, [])

  // 2. Wrap the provider with Ethers.js
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      console.log("2. Wrap the provider")
      try {
        const web3Provider = new ethers.providers.Web3Provider(provider)
        dispatch({
          type: "SET_PROVIDER",
          provider: web3Provider,
          providerType: "Web3Provider",
        })
      } catch {
        console.log(provider)
        dispatch({
          type: "SET_PROVIDER",
          provider,
          providerType: "Default provider",
        })
      }
    }
  }, [provider])

  // 3. Get information with Ethers.js provider methods
  useEffect(() => {
    if (state.provider) {
      console.log("3. Get infos from provider")
      ;(async () => {
        const network = await state.provider.getNetwork()
        console.log(network)
        console.log(provider)
        console.log(state.provider)
        dispatch({ type: "SET_NETWORK", payload: network })

        // signer can be get only through a Web3Provider
        if (state.providerType === "Web3Provider") {
          const signer = await state.provider.getSigner()
          let account
          try {
            account = await signer.getAddress()
          } catch {
            account = ethers.constants.AddressZero
          }
          dispatch({ type: "SET_ACCOUNT", signer, account })
        }
      })()
    }
  }, [state.provider, state.providerType])

  // METHOD
  // switch the network, need to change the provider if no Web3Provider
  // problem with the switch of the network on default provider ...
  const switchNetwork = async (chainId) => {
    if (state.providerType === "Web3Provider") {
      try {
        await state.provider.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        })
      } catch (e) {
        console.log(e)
      }
    } else {
      const network = chainIdtoName(parseInt(chainId, 16))
      const newProvider = ethers.getDefaultProvider(network.toLowerCase())
      setProvider(newProvider)
    }
  }

  // LISTENER
  // listen blocks
  useEffect(() => {
    if (state.provider) {
      const updateBalance = async (block) => {
        console.log(`Block n°${block} mined`)
        // const balance = await state.provider.getBalance(state.account)
        // dispatch({ type: "UPDATE_BALANCE", payload: balance })
      }
      state.provider.on("block", updateBalance)
      return () => state.provider.off("block", updateBalance)
    }
  }, [state.provider])

  return [state, switchNetwork]
}
