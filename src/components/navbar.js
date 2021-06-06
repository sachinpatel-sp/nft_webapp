import React, { Component } from "react";
import Identicon from "identicon.js";

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.loadAccount = this.loadAccount.bind(this);
  }
  loadAccount() {
    console.log("open account");
  }
  render() {
    return (
      <nav
        className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow"
        style={{ minHeight: 50 + "px" }}
      >
        <h5
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          rel="noopener noreferrer"
        >
          NFT Marketplace
        </h5>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white mr-3">
              <span id="account" onClick={this.loadAccount}>
                {this.props.account}
              </span>
            </small>
            <img
              className="ml-2"
              width="30"
              height="30"
              src={`data:image/png;base64,${new Identicon(
                this.props.account,
                30
              ).toString()}`}
            />
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
