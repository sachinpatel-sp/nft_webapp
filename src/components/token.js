import React, { Component } from "react";
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ipfs.infura.io/ipfs/'
})

class Token extends Component {
  state = {
    minter: "",
    name: "",
    price: 0,
    img: "",
  }
  componentWillMount() {
    api.get(this.props.card).then(res => {
      this.setState({ name: res.data.name });
      this.setState({ price: res.data.price });
      this.setState({ img: res.data.image });
      this.setState({ minter: res.data.minter });
    });
  }

  render() {
    return (
      <div className="card mr-3 ml-3" key={this.props.keys}>
        <div className="card-header">
          <small className="text-muted">
            Minted By :{" "}
            {this.state.minter.substring(0, 4) +
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
            <small className="float-left mt-1 ">
              {this.state.name}
            </small>
            <small className="float-right mt-1 ">
              {this.state.price +" ETH"}
            </small>
          </li>
        </ul>
      </div>
    );
  }
}

export default Token;
