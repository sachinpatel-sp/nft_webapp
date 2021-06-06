import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Card from "../abis/Card.json";
import Navbar from "./navbar";
import Content from './content'
import Owned from './owned'

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("No-Ethereum browser detected.");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const networkData = Card.networks[networkId];
    
    if (networkData) {
      const abi = Card.abi;
      const address = networkData.address;
      const cardContract = new web3.eth.Contract(abi, address);
      this.setState({ contract: cardContract });
    } else {
      window.alert("Smart Contract not deployed to this network.");
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: null,
      contract: null,
    };
  }

  render() {
    return (
      <div>
        {this.state.account? <Navbar account={this.state.account} />:<span></span>}
        {this.state.contract ? <Content account={this.state.account} contract={this.state.contract} /> : <span>Loading....</span>}
        {this.state.contract ? <Owned account={this.state.account} contract={this.state.contract} /> : <span>Loading....</span>}
        
      </div>
    );
  }
}

export default App;
