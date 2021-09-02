import { Box, Button, Heading } from "@chakra-ui/react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import { useProviders } from "./web3hook/useProviders"

const Dapp = () => {
  const [state, switchNetwork, wcConnect] = useProviders()
  const { networkName, providerType } = state

  const debug = () => {
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
        <Header
          networkName={networkName}
          providerType={providerType}
          switchNetwork={switchNetwork}
        />
        <Heading textAlign="center">Welcome to Simple Swap</Heading>

        <Button onClick={debug} colorScheme="blue">
          Debug
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
