import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Badge,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { useProviders } from "../web3hook/src/useProviders"

const Header = () => {
  const [state, switchNetwork] = useProviders()
  return (
    <>
      {" "}
      <Box bg="orange.100" p="6">
        <Flex alignItems="center">
          <Heading color="telegram.800">Simple Swap</Heading>
          <Spacer />
          <Menu>
            <MenuButton me="4" as={Button} rightIcon={<ChevronDownIcon />}>
              Switch network
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => switchNetwork("0x1")}>Mainnet</MenuItem>
              <MenuItem onClick={() => switchNetwork("0x3")}>Ropsten</MenuItem>
              <MenuItem onClick={() => switchNetwork("0x4")}>Rinkeby</MenuItem>
              <MenuItem onClick={() => switchNetwork("0x5")}>Goërli</MenuItem>
              <MenuItem onClick={() => switchNetwork("0x2a")}>Kovan</MenuItem>
            </MenuList>
          </Menu>
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
