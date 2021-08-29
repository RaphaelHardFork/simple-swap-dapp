import { Box, Button, Heading } from "@chakra-ui/react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { useProvider } from "./web3hook/src/useProvider"
import { useProviders } from "./web3hook/src/useProviders"
import { ethers } from "ethers"

const Dapp = () => {
  // const [state, connectWallet] = useProvider()

  // will goes soon in a hook
  /*
  const switchNetwork = async () => {
    try {
      const result = await state.provider.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x4" }],
      })
      console.log(result)
    } catch (e) {
      console.log(e)
    }
  }
  */

  const [provider, state] = useProviders()

  async function debug() {
    console.log(provider)
    console.log(state)
    console.log(await state.provider.getBlock())
  }

  return (
    <>
      <Box
        bgGradient="radial(blue.100,white)"
        justifyContent="space-between"
        flexDirection="column"
        display="flex"
        minH="100vh"
      >
        <Header />

        <Heading textAlign="center">Welcome to Simple Swap</Heading>

        <Button onClick={debug}>Debug</Button>

        <Footer />
      </Box>
    </>
  )
}

export default Dapp
