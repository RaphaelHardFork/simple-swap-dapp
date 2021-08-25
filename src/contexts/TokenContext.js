import { createContext } from "react"
import { useContract } from "web3-hooks"
import { contractAddress, contractABI } from "../contracts/contract"

export const TokenContext = createContext(null)

const TokenContextProvider = ({ children }) => {
  const contract = useContract(contractAddress, contractABI)

  // provider !

  return (
    <TokenContext.Provider value={[contract]}>{children}</TokenContext.Provider>
  )
}

export default TokenContextProvider
