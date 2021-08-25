import { Box, Flex, Heading, Spacer, Button } from "@chakra-ui/react"

const Header = () => {
  return (
    <>
      {" "}
      <Box bg="orange.100" p="6">
        <Flex>
          <Heading color="telegram.800">Simple Swap</Heading>
          <Spacer />
          <Button me="4" colorScheme="orange">
            Home
          </Button>
          <Button me="4" colorScheme="orange">
            Network
          </Button>
          <Button colorScheme="orange">Pool</Button>
        </Flex>
      </Box>
    </>
  )
}

export default Header
