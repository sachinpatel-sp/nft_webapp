import React, { Component } from "react";
import Token from "./token";
const Web3Utils = require("web3-utils");

class Owned extends Component {
  constructor(props) {
    super(props);
    this.state = {
      total: 0,
      tokens: [],
      index: [],
      address: "",
    };
    this.gift = this.gift.bind(this);
    this.delist = this.delist.bind(this);
    this.captureAddress = this.captureAddress.bind(this);
  }

  captureAddress(event) {
    event.preventDefault();
    const address = event.target.value;
    this.setState({ address });
  }

     async gift(key) {
    if (this.state.tokens[key].listed) {
      window.alert("Delist before gifting.");
      return;
    }
    if (this.props.account !== this.state.address) {
      await this.props.contract.methods
        .transferFrom(
          this.props.account,
          this.state.address,
          this.state.index[key]
        )
        .send({ from: this.props.account })
        .once("receipt", (receipt) => {
          console.log(receipt);
        });
    } else {
      window.alert("You can't gift to yourself");
    }
  }

  async delist(key) {
    await this.props.contract.methods
      .delist(key)
      .send({ from: this.props.account })
      .once("receipt", (receipt) => {
        console.log(receipt);
      });
  }

  floatToStr(num) {
    return num.toString().indexOf(".") === -1 ? num.toFixed(1) : num.toString();
  }

  async list(key) {
    var value = this.floatToStr(this.state.address);
    await this.props.contract.methods
      .list(key, Web3Utils.toWei(value, "ether"))
      .send({ from: this.props.account })
      .once("receipt", (receipt) => {
        console.log(receipt);
      });
  }

  async componentWillMount() {
    var total = 0;
    await this.props.contract.methods
      .balanceOf(this.props.account)
      .call()
      .then(function(res) {
        total = res;
        console.log(res);
      });
    total = parseInt(total._hex, 16);
    this.setState({ total });
    for (var i = 1; i <= total; i++) {
      var token = null;
      var ind = null;
      await this.props.contract.methods
        .tokenOfOwnerByIndex(this.props.account, i - 1)
        .call()
        .then(function(res) {
          ind = res;
        });
      await this.props.contract.methods
        .cards(ind)
        .call()
        .then(function(res) {
          token = res;
        });
      this.setState({
        tokens: [...this.state.tokens, token],
        index: [...this.state.index, ind],
      });
    }
  }
  render() {
    return (
      <div>
        <div className="row">
          <main role="main" className="col-lg-12 d-flex ">
            <div className="content mr-auto ml-auto mt-5">
              <h6 className="ml-5">Owned By: {this.props.account}</h6>
            </div>
          </main>
        </div>
        <center>
          <h3>Balance : {this.state.total} Token(s)</h3>
        </center>
        <div className="row text-center">
          {this.state.tokens.map((token, key) => {
            return (
              <div>
                <Token token={token} keys={key} key={key} frm="owned" />
                <div class="form-group">
                  <input
                    type="email"
                    class=" ml-4"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    placeholder="Address or price"
                    style={{ width: 240 }}
                    onChange={this.captureAddress}
                    key={key}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-dark mb-3 ml-3"
                  style={{ width: 80 }}
                  onClick={() => this.gift(key)}
                >
                  Gift
                </button>
                {token.listed ? (
                  <button
                    type="button"
                    className="btn btn-dark mb-3 ml-3"
                    style={{ width: 80 }}
                    onClick={() => this.delist(this.state.index[key])}
                  >
                    Delist
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-dark mb-3 ml-3"
                    style={{ width: 80 }}
                    onClick={() => this.list(this.state.index[key])}
                  >
                    List
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Owned;
