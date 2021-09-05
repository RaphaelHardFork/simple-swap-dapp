import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useWeb3 } from "./useWeb3"

// This hook have to be set in a context in order to have a unique instance of the contract
// Otherwise event will be listened one time for each time we use this hook
export const useContract = (address, abi) => {
  const { state } = useWeb3()
  const [contract, setContract] = useState({ contract: null, mode: null })

  useEffect(() => {
    // Detect if the contract have to be created with a signer or a provider
    if (state.account !== ethers.constants.AddressZero) {
      const contractInstance = new ethers.Contract(address, abi, state.signer)
      setContract({ contract: contractInstance, mode: "signer" })
    } else {
      const contractReader = new ethers.Contract(
        address,
        abi,
        state.ethersProvider
      )
      setContract({ contract: contractReader, mode: "read-only" })
    }
  }, [address, abi, state.signer, state.ethersProvider, state.account])

  return [contract]
}
