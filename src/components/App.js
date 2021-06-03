import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import Card from "../abis/Card.json";
import ipfs from "./ipfs";
import Navbar from "./navbar";
import Token from "./token";
class App extends Component {
  async componentWillMount() {
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
      var total=0;
      await cardContract.methods
        .totalSupply()
        .call()
        .then(function(res) {
          total= res;
        });
      total = parseInt(total._hex, 16);
      this.setState({ totalSupply: total });
      for (var i = 1; i <= total; i++) {
        var card = null;
        await cardContract.methods
          .cards(i - 1)
          .call()
          .then(function(res) {
            card = res;
          });
        this.setState({
          cards: [...this.state.cards, card],
        });
      }
    } else {
      window.alert("Smart Contract not deployed to this network.");
    }
  }

  mint = (card) => {
    console.log(card);
    this.state.contract.methods
      .mint(card)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        this.setState({
          cards: [...this.state.cards, card],
        });
      });
  };
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      contract: null,
      totalSupply: 0,
      cards: [],
      buffer: null,
      name: "",
      price: 0,
    };
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.captureName = this.captureName.bind(this);
    this.capturePrice = this.capturePrice.bind(this);
  }

  captureName(event) {
    event.preventDefault();
    const name = event.target.value;
    this.setState({ name });
  }

  capturePrice(event) {
    event.preventDefault();
    const price = event.target.value;
    this.setState({ price });
  }

  captureFile(event) {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log(this.state.buffer);
    };
  }

  onSubmit(event) {
    event.preventDefault();
    if (
      this.state.name !== "" &&
      this.state.price !== 0 &&
      this.state.buffer !== null
    ) {
      ipfs.files.add(this.state.buffer, (error, result) => {
        console.log("entered");
        if (error) {
          window.alert("Error occured while minting");
          return;
        }
        const imageLink = "https://ipfs.infura.io/ipfs/" + result[0].hash;
        const data = JSON.stringify({
          name: this.state.name,
          price: this.state.price,
          image: imageLink,
          minter: this.state.account,
        });
        console.log(data);
        ipfs.files.add(Buffer.from(data), (err, result) => {
          if (err) {
            window.alert("Error occured while minting");
            return;
          }
          this.mint(result[0].hash);
        });
        document.getElementById("form").reset();
        this.setState({ name: "" });
        this.setState({ price: 0 });
        this.setState({ buffer: null });
      });
    } else {
      window.alert("Please Enter All The Fields."+this.state.cards);
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />

        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex ">
              <div className="content mr-auto ml-auto">
                <h2>Issue New Tokens</h2>
                <form id="form" onSubmit={this.onSubmit}>
                  <input
                    type="text"
                    className="fom-control mb-2"
                    placeholder="Name"
                    onChange={this.captureName}
                  />
                  <br />
                  <input
                    type="text"
                    className="fom-control mb-2"
                    placeholder="Price"
                    onChange={this.capturePrice}
                  />
                  <br />
                  <input
                    type="file"
                    className="fom-control-file mb-3 text-center"
                    onChange={this.captureFile}
                  />
                  <input
                    type="submit"
                    className="btn btn-block btn-primary"
                    value="Mint"
                  />
                </form>
              </div>
            </main>
          </div>
          <hr />
          <center>
            <h3>Newly Minted</h3>
          </center>
          <div className="row text-center">
            {this.state.cards.map((card, key) => {
              return <Token card={card} keys={key} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
