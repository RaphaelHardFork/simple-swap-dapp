import { ethers } from "ethers"
import { useCallback, useEffect, useReducer, useRef, useState } from "react"

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
    case "ACCOUNT_CONNECTED":
      return { ...state, account: action.payload }
    case "SET_ACCOUNT":
      return {
        ...state,
        account: action.account,
        isLogged: action.isLogged,
        signer: action.signer,
        eth_balance: action.balance,
      }
    case "UPDATE_BALANCE":
      return { ...state, eth_balance: action.payload }
    default:
      console.error(
        `Wrong action type in the useMetamask hook reducer, ${action.type}`
      )
  }
}

const initialState = {
  isLogged: false,
  metamaskUnLocked: false,
  account: ethers.constants.AddressZero,
  chainId: 0,
  networkName: "no provider",
  eth_balance: ethers.utils.parseEther("0"),
  signer: null,
  provider: null,
}

export const useProvider = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const networkMounted = useRef(false)
  const userMounted = useRef(false)

  const connectWallet = async () => {
    try {
      const result = await state.provider.provider.request({
        method: "eth_requestAccounts",
      })
      dispatch({ type: "ACCOUNT_CONNECTED", payload: result[0] })
      console.log(result)
    } catch (e) {
      if (e.code === 4001) {
        console.log("USER DIENED CONNECTION")
      } else {
        console.error(e)
      }
    }
  }

  // not very useful (render 3 time...): try with useMemo()
  const getAccount = useCallback(async () => {
    console.log(state.networkName)
    const accounts = await state.provider.provider.request({
      method: "eth_accounts",
    })
    // change the signer otherwise the former account will sign
    const signer = await state.provider.getSigner()
    let balance = initialState.eth_balance
    if (accounts.length !== 0) {
      balance = await state.provider.getBalance(accounts[0])
    }
    return [accounts, signer, balance]
  }, [state.provider])

  // 1. create the provider from metamask
  useEffect(() => {
    if (state.provider === null) {
      console.log("1. Get the provider")
      ;(async () => {
        const provider = await new ethers.providers.Web3Provider(
          window.ethereum
        )
        dispatch({ type: "SET_PROVIDER", payload: provider })
      })()
    }
  }, [state.provider])

  // 2. get information from the provider
  useEffect(() => {
    if (!networkMounted.current) {
      networkMounted.current = true
      console.log("2. Get info from the provider (first render)")
    } else {
      console.log("2. Get info from the provider (take 1s)")
      // need some time before save informations
      setTimeout(() => {
        const chainId = Number(state.provider.provider.chainId)
        const networkName = chainIdtoName(chainId)
        dispatch({ type: "SET_NETWORK", networkName, chainId })
        console.log(`2. Network set with ${networkName} (${chainId})`)
      }, 1000)
    }
  }, [state.provider])

  // 3. check if user is logged to the dApp
  useEffect(() => {
    if (!userMounted.current) {
      userMounted.current = true
      console.log("3. Get user infos (first render)")
    } else {
      console.log("3. Get user infos")
      ;(async () => {
        try {
          //const [accounts, signer, balance] = await getAccount()

          const accounts = await state.provider.provider.request({
            method: "eth_accounts",
          })

          // change the signer otherwise the former account will sign
          const signer = await state.provider.getSigner()
          let balance = initialState.eth_balance
          if (accounts.length !== 0) {
            balance = await state.provider.getBalance(accounts[0])
          }

          if (accounts.length !== 0) {
            dispatch({
              type: "SET_ACCOUNT",
              isLogged: true,
              account: accounts[0],
              signer,
              balance,
            })
          } else {
            dispatch({
              type: "SET_ACCOUNT",
              isLogged: false,
              account: initialState.account,
              signer: null,
              balance,
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
  // TODO: find a way to detect a lock metamask event
  useEffect(() => {
    if (state.provider) {
      ;(async () => {
        const bool = await state.provider.provider._metamask.isUnlocked()
        dispatch({ type: "SET_METAMASK", payload: bool })
      })()
    }
  }, [state.provider, state.account])

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
      }
      state.provider.on("accountsChanged", accountChanged)
    }
  }, [state.provider, state.account])

  // change eth balance
  useEffect(() => {
    if (state.provider && state.account !== initialState.account) {
      const updateBalance = async (block) => {
        console.log(`Block n°${block} mined`)
        const balance = await state.provider.getBalance(state.account)
        dispatch({ type: "UPDATE_BALANCE", payload: balance })
      }
      state.provider.on("block", updateBalance)
    }
  }, [state.provider, state.isLogged, state.account])

  // disconnect
  useEffect(() => {
    if (state.provider) {
      const seeDisconnect = async (code, reason) => {
        console.log("Disconnected")
        console.log(reason)
        console.log(code)
      }
      state.provider.on("disconnect", seeDisconnect)
    }
  }, [state.provider])

  useEffect(() => {
    if (state.provider) {
      const seeDisconnect = async (code, reason) => {
        console.log("Disconnected")
        console.log(reason)
        console.log(code)
      }
      state.provider.on("connect", seeDisconnect)
    }
  }, [state.provider])

  // metamask lock / unlock (DO NOT WORK)
  useEffect(() => {
    if (state.provider) {
      const unlockEvent = async (account) => {
        console.log(`Account changed to ${account}`)
        // dispatch({ type: "SET_ACCOUNT", account, isLogged: false })
      }
      state.provider.on("unlockevent", unlockEvent)
    }
  }, [state.provider])

  return [state, connectWallet]
}
