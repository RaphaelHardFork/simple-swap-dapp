import detectEthereumProvider from "@metamask/detect-provider"
import { ethers } from "ethers"
import { useEffect, useReducer, useRef, useState } from "react"

/*
This is a hook to connect to blockchain through several provider.

For security and pratical reasons the page is reloaded each time the provider change. More accurately each time
the network change, otherwise the former provider is still active, so it listen several network at the same time. 

Metamask provider the easiest way to connect a blockchain, indeed Metamask inject a provider in the browser. 
So the execpt the connection is initiated with Wallet Connect, the hook will try to find the provider from Metamask
*/

// Reducer for maintain the hook state
const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ETHERS_PROVIDER":
      return {
        ...state,
        providerType: action.providerType,
        ethersProvider: action.wrappedProvider,
      }
    default:
      throw new Error(
        `useProviders: something went wrong in the reducer with the type: ${action.type}`
      )
  }
}
export const useProviders = () => {
  // This state is internal, it store the provider which will be used.
  const [provider, setProvider] = useState()

  const isMounted = useRef(false)

  // State of the hook which will be exported
  const [state, dispatch] = useReducer(reducer, {
    providerType: undefined,
    ethersProvider: null,
    providerSrc: undefined,
  })
  // Extraction of keys of the hook state
  const { providerType, ethersProvider, providerSrc } = state

  // 1. Get a provider
  // Some options are stored in the local storage to guide which provider the useEffect have to fetch
  useEffect(() => {
    console.log("1. Get a provider")
    // Read options in the local storage
    const walletConnect = window.localStorage.getItem("wallet-connect")
    const network = window.localStorage.getItem("network")(async () => {
      // Connexion to wallet connect initiated
      if (walletConnect) {
        // connexion to WC
        console.log("connexion to WC")
      } else {
        // Detect if Metamask is installed
        let metamaskProvider = false
        try {
          metamaskProvider = await detectEthereumProvider()
          setProvider(metamaskProvider)
        } catch (e) {
          console.log("Metamask not installed")
          // manage the error
          console.log(e)
        }

        // Metamask is not installed
        // A default provider will be used in this case
        if (!metamaskProvider) {
          // A network is specified in the local storage
          // If {network} is null, the mainnet (homestead) is choosed
          const defaultProvider = ethers.getDefaultProvider(network)

          // The quorum of providers selected by {getDefaultProvider} is extracted
          // and will be used to create a FallbackProvider
          const providersQuorum = defaultProvider.providerConfigs
          console.log(providersQuorum)

          setProvider(providersQuorum)
        }
      }
    })()
  }, [])

  // 2. Wrap the provider(s) into a Ethers.JS provider configuration
  // And store it in the state of the hook
  useEffect(() => {
    // Do not run on the first render
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      console.log("2. Wrap the provider(s)")

      // Try to wrap the providers into a Web3Provider (Metamask & Wallet Connect)
      try {
        const web3Provider = new ethers.providers.Web3Provider(provider)
        console.log(web3Provider)
        const src = ""
        dispatch({
          type: "SET_ETHERS_PROVIDER",
          providerType: "Web3Provider",
          wrappedProvider: web3Provider,
          // src
        })
      } catch {
        // Create a fallback provider with the quorum of providers
        const fallbackProvider = ethers.getDefaultProvider(provider)
        console.log(fallbackProvider)
        const src = ""
        dispatch({
          type: "SET_ETHERS_PROVIDER",
          providerType: "FallbackProvider",
          wrappedProvider: fallbackProvider,
          // src
        })
      }
    }
  }, [provider])
}
