import { Box, Button, Heading } from "@chakra-ui/react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { useProvider } from "./web3hook/src/useProvider"

const Dapp = () => {
  const [state] = useProvider()

  const connectWallet = async () => {
    try {
      const result = await state.provider.provider.request({
        method: "eth_requestAccounts",
      })
      console.log(result)
    } catch (e) {
      if (e.code === 4001) {
        console.log("USER DIENED CONNECTION")
      } else {
        console.error(e)
      }
    }
  }

  /*
  const getAccount = async () => {
    try {
      const result = await state.provider.request({ method: "eth_accounts" })
      console.log(result)
    } catch (e) {
      console.error(e)
    }
  }
  */

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
        <Button>Get account</Button>
        <Button onClick={debug}>Debug</Button>

        <Footer />
      </Box>
    </>
  )
}

export default Dapp
