import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Badge,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { ethers } from "ethers"
import { useWeb3 } from "../web3hook/useWeb3"

const Header = () => {
  const { state, switchNetwork, connectToMetamask } = useWeb3()
  const { networkName, providerType, account } = state
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
              <MenuItem onClick={() => switchNetwork("0x1", "mainnet")}>
                Mainnet
              </MenuItem>
              <MenuItem onClick={() => switchNetwork("0x3", "ropsten")}>
                Ropsten
              </MenuItem>
              <MenuItem onClick={() => switchNetwork("0x4", "rinkeby")}>
                Rinkeby
              </MenuItem>
              <MenuItem onClick={() => switchNetwork("0x5", "goerli")}>
                Goërli
              </MenuItem>
              <MenuItem onClick={() => switchNetwork("0x2a", "kovan")}>
                Kovan
              </MenuItem>
            </MenuList>
          </Menu>
          <Badge
            me="4"
            shadow="lg"
            borderRadius="10"
            p="4"
            colorScheme={
              account === ethers.constants.AddressZero ? "red" : "blue"
            }
          >
            {account}
          </Badge>
          <Badge
            me="4"
            shadow="lg"
            borderRadius="10"
            p="4"
            colorScheme={networkName === null ? "red" : "blue"}
          >
            {networkName ? networkName : "Fetch network"}
          </Badge>
          <Badge
            me="4"
            shadow="lg"
            borderRadius="10"
            p="4"
            colorScheme={providerType ? "green" : "red"}
          >
            {providerType ? providerType : "No provider"}
          </Badge>
          <Button colorScheme="blackAlpha" onClick={connectToMetamask}>
            Connect Metamask
          </Button>
        </Flex>
      </Box>
    </>
  )
}

export default Header
