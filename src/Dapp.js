import { Box, Button, Heading } from "@chakra-ui/react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { useProviders } from "./web3hook/src/useProviders"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { contractABI, contractAddress } from "./contracts/token"

import WalletConnectProvider from "@walletconnect/web3-provider"

const Dapp = () => {
  const [state, , wcConnect] = useProviders()

  const [contract, setContract] = useState(null)

  useEffect(() => {
    if (state.provider) {
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        state.provider
      )
      setContract(contract)
    }
  }, [state.provider])

  async function debug() {
    console.log(state)
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
        <Button onClick={wcConnect}>Connect</Button>

        <Footer />
      </Box>
    </>
  )
}

export default Dapp
