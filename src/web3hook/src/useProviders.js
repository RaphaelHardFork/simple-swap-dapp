import detectEthereumProvider from "@metamask/detect-provider"
import { ethers } from "ethers"
import { useEffect, useReducer, useRef, useState } from "react"

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        providerType: action.providerType,
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

  // 2. Use the provider with Ethers.js
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      try {
        const web3Provider = new ethers.providers.Web3Provider(
          provider,
          "rinkeby"
        )
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

  // LISTENER
  // listen blocks
  // change eth balance
  useEffect(() => {
    if (state.provider) {
      const updateBalance = async (block) => {
        console.log(`Block n°${block} mined`)
        // const balance = await state.provider.getBalance(state.account)
        // dispatch({ type: "UPDATE_BALANCE", payload: balance })
      }
      state.provider.on("block", updateBalance)
    }
  }, [state.provider])

  return [provider, state]
}
