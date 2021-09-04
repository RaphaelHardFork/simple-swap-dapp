import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { ChakraProvider } from "@chakra-ui/react"

// This context allow to have a connection with the blockchain globally in the dApp
import Web3ContextProvider from "./web3hook/Web3ContextProvider"

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <Web3ContextProvider>
        <App />
      </Web3ContextProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
