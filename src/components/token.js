import React, { Component } from "react";
import axios from "axios";
const Web3Utils = require("web3-utils");

const api = axios.create({
  baseURL: "https://ipfs.infura.io/ipfs/",
});

class Token extends Component {
  state = {
    minter: "",
    name: "",
    price: 0,
    img: "",
  };
  componentWillMount() {
    api.get(this.props.token.card).then((res) => {
      this.setState({ name: res.data.name });
      this.setState({
        price: Web3Utils.fromWei(this.props.token.price.toString(), "ether"),
      });
      this.setState({ img: res.data.image });
      this.setState({ minter: res.data.minter });
    });
    console.log(this.props.token.card);
  }

  render() {
    return (
      <div className="card mr-1 ml-4 mb-3" key={this.props.keys}>
        <div className="card-header">
          <small className="text-muted">
            Minted By :{" "}
            {this.state.minter.substring(0, 6) +
              "...." +
              this.state.minter.substring(
                this.state.minter.length - 4,
                this.state.minter.length
              )}
          </small>
        </div>
        <ul id="image" className="list-group list-group-flush">
          <li className="list-group-item">
            <img width="200" height="250" src={this.state.img} alt="Card" />
          </li>
          <li key={this.props.keys} className="list-group-item py-2">
            {this.props.frm == 0 ? (
              <small className="float-left mt-1 ">{this.state.name}</small>
            ) : (
              <small className=" mt-1 ">{this.state.name}</small>
            )}
            {this.props.frm == 0 ? (
              <small className="float-right mt-1 font-weight-bold">
                {this.state.price + " ETH"}
              </small>
            ) : (
              <span></span>
            )}
          </li>
        </ul>
      </div>
    );
  }
}

export default Token;
