// Reducer for maintain the hook state
export const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ETHERS_PROVIDER":
      return {
        ...state,
        providerType: action.providerType,
        ethersProvider: action.wrappedProvider,
        providerSrc: action.providerSrc,
      }

    case "SET_NETWORK":
      return {
        ...state,
        networkName: action.networkName,
        chainId: action.chainId,
      }

    case "SET_ACCOUNT":
      return { ...state, signer: action.signer, account: action.account }

    case "SET_BALANCE":
      return { ...state, balance: action.balance }

    default:
      throw new Error(
        `useProviders: something went wrong in the reducer with the type: ${action.type}`
      )
  }
}
