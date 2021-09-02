import detectEthereumProvider from "@metamask/detect-provider"
import WalletConnectProvider from "@walletconnect/web3-provider"
import { ethers } from "ethers"
import { useCallback, useEffect, useReducer, useRef, useState } from "react"

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

// --------------------------------------------------------------- HOOK
export const useProviders = () => {
  const [provider, setProvider] = useState(null)
  const isMounted = useRef(false)
  const wcMounted = useRef(false)

  const [state, dispatch] = useReducer(reducer, {
    providerType: undefined,
    provider: null,
    signer: null,
    account: ethers.constants.AddressZero,
    networkName: undefined,
    networkId: 0,
  })

  // Connection with WalletConnect
  /*
  const wcConnexion = useCallback(async () => {
    if (!wcMounted.current) {
      const provider = new WalletConnectProvider({
        infuraId: "3c717cd3192b470baedb127d89581a23",
      })
      console.log("open the modal")
      console.log(provider)
      try {
        await provider.enable()
        setProvider(provider)
        window.localStorage.clear()
      } catch (e) {
        console.log(e)
        window.localStorage.clear()
      }
    }
  }, [])
  */

  // 1. Find a provider
  useEffect(() => {
    console.log("1. Get the provider")
    ;(async () => {
      // try to catch a wallet connect connection
      // GOOD WAY BUT DOUBLE LOADING AT FIRST RENDER
      const walletConnect = window.localStorage.getItem("wallet-connect")
      if (walletConnect) {
        console.log("before wcConnexion()")
        window.localStorage.clear()
        if (!wcMounted.current) {
          const provider = new WalletConnectProvider({
            infuraId: "3c717cd3192b470baedb127d89581a23",
          })
          console.log("open the modal")
          console.log(provider)
          try {
            await provider.enable()
            setProvider(provider)
            window.localStorage.clear()
          } catch (e) {
            console.log(e)
            window.localStorage.clear()
          }
        }
        wcMounted.current = true
      } else {
        //
        let catchedProvider = null
        try {
          // correspond to window.ethereum = the provider of Metamask
          catchedProvider = await detectEthereumProvider() // don't throw e
          setProvider(catchedProvider)
        } catch (e) {
          console.log(e)
        }
        if (catchedProvider === null) {
          // if there is no metamask extension installed
          const switchedNetwork =
            window.localStorage.getItem("switched-network")
          console.log(switchedNetwork)

          catchedProvider = ethers.getDefaultProvider(switchedNetwork) // try to store the network in the localstorage
          setProvider(catchedProvider)
        }
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

  // connect to wallet connect
  const wcConnect = () => {
    window.localStorage.setItem("wallet-connect", true)
    window.location.reload()
  }

  // METHOD
  // switch the network, need to change the provider if no Web3Provider
  // problem with the switch of the network on default provider ...
  const switchNetwork = async (chainId) => {
    console.log(state.providerType)
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
      // with the DefaultProvider it needs to reload the page with the right network
      const network = chainIdtoName(parseInt(chainId, 16))
      window.localStorage.setItem("switched-network", network.toLowerCase())
      window.location.reload() // reload with the network stored in localStorage
    }
  }

  // LISTENER
  // listen blocks
  useEffect(() => {
    if (state.provider) {
      const updateBalance = async (block) => {
        console.log(`Block n°${block} mined on ${state.networkName}`)
        // const balance = await state.provider.getBalance(state.account)
        // dispatch({ type: "UPDATE_BALANCE", payload: balance })
      }
      state.provider.on("block", updateBalance)
      return () => state.provider.off("block", updateBalance)
    }
  }, [state.provider, state.networkName])

  // network change
  useEffect(() => {
    if (state.provider) {
      const chainChanged = async (chainId) => {
        console.log(`Chain changed to ${chainId}`)
        const network = { chainId: parseInt(chainId) }
        dispatch({ type: "SET_NETWORK", payload: network })
      }
      window.ethereum.on("chainChanged", chainChanged)
    }
  }, [state.provider])

  // account changed
  useEffect(() => {
    if (state.provider) {
      const accountChanged = async (account) => {
        console.log(`Account: ${account}`)
        /*
          if (!account) {
            console.log(`Account ${state.account} disconnected`)
            dispatch({
              type: "SET_ACCOUNT",
              account: initialState.account,
              isLogged: false,
            })
          } else {
            console.log(`Account changed to ${account}`)
            dispatch({ type: "SET_ACCOUNT", account, isLogged: false })
          }
          */
      }
      state.provider.on("accountsChanged", accountChanged)
    }
  }, [state.provider, state.account])

  // connect
  useEffect(() => {
    if (state.provider) {
      const connected = async (args) => {
        console.log(`Args: ${args}`)
        /*
            if (!account) {
              console.log(`Account ${state.account} disconnected`)
              dispatch({
                type: "SET_ACCOUNT",
                account: initialState.account,
                isLogged: false,
              })
            } else {
              console.log(`Account changed to ${account}`)
              dispatch({ type: "SET_ACCOUNT", account, isLogged: false })
            }
            */
      }
      state.provider.on("connect", connected)
    }
  }, [state.provider, state.account])

  // connect
  useEffect(() => {
    if (state.provider) {
      const disconnected = async (args) => {
        console.log(`Args: ${args}`)
        /*
              if (!account) {
                console.log(`Account ${state.account} disconnected`)
                dispatch({
                  type: "SET_ACCOUNT",
                  account: initialState.account,
                  isLogged: false,
                })
              } else {
                console.log(`Account changed to ${account}`)
                dispatch({ type: "SET_ACCOUNT", account, isLogged: false })
              }
              */
      }
      state.provider.on("disconnect", disconnected)
    }
  }, [state.provider, state.account])

  return [state, switchNetwork, wcConnect]
}
