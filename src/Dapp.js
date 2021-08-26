import { Box, Button, Heading } from "@chakra-ui/react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { useProvider } from "./web3hook/src/useProvider"

const Dapp = () => {
  const [state, connectWallet] = useProvider()

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

  function debug() {
    console.log(state)
    console.log(window.ethereum)
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
        <Button onClick={connectWallet}>Connect</Button>
        <Button onClick={switchNetwork}>Switch to Rinkeby</Button>
        <Button onClick={debug}>Debug</Button>

        <Footer />
      </Box>
    </>
  )
}

export default Dapp
