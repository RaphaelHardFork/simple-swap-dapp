import { Box, Flex, Heading, Spacer, Button, Badge } from "@chakra-ui/react"
import { useProviders } from "../web3hook/src/useProviders"

const Header = () => {
  const [state] = useProviders()
  return (
    <>
      {" "}
      <Box bg="orange.100" p="6">
        <Flex>
          <Heading color="telegram.800">Simple Swap</Heading>
          <Spacer />
          <Badge
            me="4"
            shadow="lg"
            borderRadius="10"
            p="4"
            colorScheme={state.provider === null ? "red" : "blue"}
          >
            {state.provider === null ? "Fetch network" : state.networkName}
          </Badge>
          <Badge
            shadow="lg"
            borderRadius="10"
            p="4"
            colorScheme={state.provider === null ? "red" : "green"}
          >
            {state.provider === null ? "No provider" : state.providerType}
          </Badge>
        </Flex>
      </Box>
    </>
  )
}

export default Header
