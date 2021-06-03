require('babel-register');
require('babel-polyfill');
require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC =
  "struggle display effort bus moon dog avoid divide naive feed awful blood";
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
           MNEMONIC,
          "https://ropsten.infura.io/v3/8ff5750c816649738c55d963982d8ca4"
        );
      },
      network_id: 3,
      gas: 4000000, //make sure this gas allocation isn't over 4M, which is the max
    },
  },
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      version: "0.8.4",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
