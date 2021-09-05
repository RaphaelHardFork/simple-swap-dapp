import { Box, Button, Heading } from "@chakra-ui/react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { useContract } from "./web3hook/useContract"
import { contractAddress, contractABI } from "./contracts/token"
import { useWeb3 } from "./web3hook/useWeb3"
import { useCall } from "./web3hook/useCall"

const Dapp = () => {
  const { wcConnect, state } = useWeb3()
  const [status, contractCall] = useCall()
  const [{ contract, mode }] = useContract(contractAddress, contractABI)

  const check = async () => {
    const tot = await contractCall(contract, "totalSupply")
    console.log(tot)
  }

  const approve = async () => {
    const tx = await contractCall(contract, "approve", [
      "0x3eB876042A00685c75Cfe1fa2Ee496615e3aef8b",
      10000,
    ])
    console.log(tx)
  }

  const debug = () => {
    console.log(contract)
    console.log(mode)
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

        <Button onClick={debug} colorScheme="blue">
          Debug
        </Button>
        <Button onClick={check} colorScheme="orange">
          Check total supply
        </Button>
        <Button
          isLoading={
            status.startsWith("Pending") || status.startsWith("Waiting")
          }
          loadingText={status}
          disabled={
            status.startsWith("Pending") || status.startsWith("Waiting")
          }
          onClick={approve}
          colorScheme="orange"
        >
          Do a transaction (approve)
        </Button>
        <Button onClick={wcConnect} colorScheme="blue">
          Connect with Wallet Connect
        </Button>

        <Footer />
      </Box>
    </>
  )
}

export default Dapp
