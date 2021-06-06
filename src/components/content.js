import React, { Component } from "react";
import Token from "./token";
import ipfs from "./ipfs";
const Web3Utils = require("web3-utils");

class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalSupply: 0,
      tokens: [],
      owners: [],
      buffer: null,
      name: "",
      price: "",
    };
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.captureName = this.captureName.bind(this);
    this.capturePrice = this.capturePrice.bind(this);
  }

  async componentWillMount() {
    var total = 0;
    await this.props.contract.methods
      .totalSupply()
      .call()
      .then(function(res) {
        total = res;
        console.log(res);
      });
    total = parseInt(total._hex, 16);
    this.setState({ totalSupply: total });
    for (var i = 1; i <= total; i++) {
      var token = null;
      var owner = null;
      await this.props.contract.methods
        .cards(i - 1)
        .call()
        .then(function(res) {
          token = res;
        });
      this.setState({
        tokens: [...this.state.tokens, token],
      });
      await this.props.contract.methods
        .ownerOf(i - 1)
        .call()
        .then(function(res) {
          owner = res;
        });
      this.setState({
        owners: [...this.state.owners, owner],
      });
    }
  }
  floatToStr(num) {
    return num.toString().indexOf(".") === -1 ? num.toFixed(1) : num.toString();
  }

  mint = (card, price) => {
    var value = this.floatToStr(price);
    this.props.contract.methods
      .mint(card, Web3Utils.toWei(value, "ether"))
      .send({ from: this.props.account })
      .once("receipt", (receipt) => {
        this.setState({
          tokens: [...this.state.tokens, card],
        });
      });
    this.setState({ price: 0 });
  };

  async buy(key) {
    console.log(key + " " + this.state.tokens[key].price);
    await this.props.contract.methods
      .buy(key)
      .send({ from: this.props.account, value: this.state.tokens[key].price })
      .once("receipt", (receipt) => {
        console.log(receipt);
      });
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
        minter: this.props.account,
      });
      console.log(data);
      ipfs.files.add(Buffer.from(data), (err, result) => {
        if (err) {
          window.alert("Error occured while minting");
          return;
        }
        this.mint(result[0].hash, this.state.price);
      });
      document.getElementById("form").reset();
      this.setState({ name: "" });
      this.setState({ buffer: null });
    });
  }

  render() {
    return (
      <div>
        <div className="row">
          <main role="main" className="col-lg-12 d-flex ">
            <div className="content mr-auto ml-auto mt-5">
              <h2 className="ml-5">Issue New Tokens</h2>
              <form id="form" onSubmit={this.onSubmit}>
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span
                      class="input-group-text"
                      id="inputGroup-sizing-default"
                    >
                      Name
                    </span>
                  </div>
                  <input
                    type="text"
                    className="fom-control mb-2"
                    class="form-control"
                    aria-label="Name"
                    aria-describedby="inputGroup-sizing-default"
                    required
                    onChange={this.captureName}
                  />
                </div>
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span
                      class="input-group-text"
                      id="inputGroup-sizing-default"
                    >
                      Price
                    </span>
                  </div>
                  <input
                    type="text"
                    className="fom-control mb-2"
                    class="form-control"
                    aria-label="Price"
                    aria-describedby="inputGroup-sizing-default"
                    required
                    onChange={this.capturePrice}
                  />
                </div>
                <div class="input-group mb-3">
                  <div class="input-group-prepend">
                    <span class="input-group-text">Upload</span>
                  </div>
                  <div class="custom-file">
                    <input
                      type="file"
                      class="custom-file-input"
                      id="inputGroupFile01"
                      required
                      onChange={this.captureFile}
                    />
                    <label class="custom-file-label" for="inputGroupFile01">
                      Choose file
                    </label>
                  </div>
                </div>
                <input
                  type="submit"
                  className="btn btn-block btn-dark"
                  value="Mint"
                />
              </form>
            </div>
          </main>
        </div>
        <hr />
        <center>
          <h3>In The Market</h3>
        </center>
        <div className="row text-center">
          {this.state.tokens.map((token, key) => {
            return token.listed ? (
              <div>
                <Token token={token} keys={key} key={key} frm="0" />
                {this.state.owners[key] == this.props.account ? (
                  <button
                    type="button"
                    disabled
                    className="btn btn-dark mb-3 ml-3"
                    style={{ width: 150 }}
                    onClick={() => this.buy(key)}
                  >
                    Buy Now
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-dark mb-3 ml-3"
                    style={{ width: 150 }}
                    onClick={() => this.buy(key)}
                  >
                    Buy Now
                  </button>
                )}
              </div>
            ) : (
              <span></span>
            );
          })}
        </div>
        <hr />
      </div>
    );
  }
}

export default Content;
