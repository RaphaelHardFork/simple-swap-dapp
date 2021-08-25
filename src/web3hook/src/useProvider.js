import { ethers } from "ethers"
import { useEffect, useReducer, useRef, useState } from "react"

const chainIdtoName = (chainId) => {
  const id = parseInt(chainId, 10)
  switch (id) {
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
      return { ...state, provider: action.payload }
    case "SET_METAMASK":
      return { ...state, metamaskUnLocked: action.payload }
    case "SET_NETWORK":
      return {
        ...state,
        chainId: action.chainId,
        networkName: action.networkName,
      }
    case "SET_ACCOUNT":
      return { ...state, account: action.account, isLogged: action.isLogged }
    default:
      console.error(
        `Wrong action type in the useMetamask hook reducer, ${action.type}`
      )
  }
}

export const useProvider = () => {
  const [state, dispatch] = useReducer(reducer, {
    isLogged: false,
    metamaskUnLocked: false,
    account: ethers.constants.AddressZero,
    chainId: 0,
    networkName: "no provider",
    eth_balance: ethers.utils.parseEther("0"),
    signer: null,
    provider: null,
  })
  const isMounted = useRef(false)

  // create the provider from metamask
  useEffect(() => {
    ;(async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      dispatch({ type: "SET_PROVIDER", payload: provider })
    })()
  }, [])

  // get information from the provider
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      console.log("first render")
    } else {
      // need some time before save informations
      setTimeout(() => {
        const chainId = Number(state.provider.provider.chainId)
        const networkName = chainIdtoName(chainId)
        dispatch({ type: "SET_NETWORK", networkName, chainId })
        console.log(`Network set with ${networkName} (${chainId})`)
      }, 1000)
    }
  }, [state.provider])

  // check if user is logged to the dApp
  useEffect(() => {
    if (state.provider) {
      ;(async () => {
        try {
          const accounts = await state.provider.provider.request({
            method: "eth_accounts",
          })

          // change the signer otherwise the former account will sign
          const signer = await state.provider.getSigner()
          console.log(signer)

          if (accounts.length !== 0) {
            dispatch({
              type: "SET_ACCOUNT",
              isLogged: true,
              account: accounts[0],
            })
          } else {
            dispatch({
              type: "SET_ACCOUNT",
              isLogged: false,
              account: state.account,
            })
          }
        } catch (e) {
          throw e
        }
      })()
    }
  }, [state.provider, state.account])

  // check if Metamask is unlocked
  // not useful, user have to connect the wallet whatever
  // TODO: find another way to detect this
  useEffect(() => {
    if (state.provider) {
      ;(async () => {
        const bool = await state.provider.provider._metamask.isUnlocked()
        dispatch({ type: "SET_METAMASK", payload: bool })
      })()
    }
  }, [state.provider])

  // LISTEN EVENT ON THE NETWORK
  // network change
  useEffect(() => {
    if (state.provider) {
      const chainChanged = async (chainId) => {
        console.log(`Chain changed to ${chainId}`)
        const networkName = chainIdtoName(Number(chainId))
        //window.location.reload()
        dispatch({ type: "SET_NETWORK", networkName, chainId: Number(chainId) })
      }
      window.ethereum.on("chainChanged", chainChanged)
    }
  }, [state.provider])

  // account changed
  useEffect(() => {
    if (state.provider) {
      const accountChanged = async (account) => {
        console.log(`Account changed to ${account}`)
        dispatch({ type: "SET_ACCOUNT", account, isLogged: false })
      }
      window.ethereum.on("accountsChanged", accountChanged)
    }
  }, [state.provider])

  // metamask lock / unlock (DO NOT WORK)
  useEffect(() => {
    if (state.provider) {
      const unlockEvent = async (account) => {
        console.log(`Account changed to ${account}`)
        // dispatch({ type: "SET_ACCOUNT", account, isLogged: false })
      }
      window.ethereum.on("unlockEvent", unlockEvent)
    }
  }, [state.provider])

  return [state]
}
