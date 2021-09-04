import { createContext } from "react"
import { useProviders } from "./provider_hook/useProviders"

export const ProviderContext = createContext(null)

const Web3ContextProvider = ({ children }) => {
  const [state, switchNetwork, wcConnect, connectToMetamask] = useProviders()

  return (
    <ProviderContext.Provider
      value={{ state, switchNetwork, wcConnect, connectToMetamask }}
    >
      {children}
    </ProviderContext.Provider>
  )
}

export default Web3ContextProvider
