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
    account: ethers.utils.AddressZero,
    networkName: undefined,
    networkId: 0,
  })

  // 1. Find a provider
  useEffect(() => {
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
        catchedProvider = ethers.getDefaultProvider("rinkeby")
        setProvider(catchedProvider)
      }
    })()
  }, [])

  // 2. Wrap the provider with Ethers.js
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      try {
        const web3Provider = new ethers.providers.Web3Provider(provider)
        dispatch({
          type: "SET_PROVIDER",
          provider: web3Provider,
          providerType: "Web3Provider",
        })
      } catch {
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
      ;(async () => {
        const network = await state.provider.getNetwork()
        console.log(network)
        dispatch({ type: "SET_NETWORK", payload: network })

        // create manage
        const account = await state.provider.getSigner()
        console.log(account)
        // network
        // const account = state.provider.get
        // account
      })()
    }
  }, [state.provider])

  // METHOD
  const switchNetwork = async () => {
    try {
      const result = await state.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x4" }],
      })
      console.log(result)
    } catch (e) {
      console.log(e)
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

  return [state]
}
