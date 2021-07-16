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
      auction: [],
      end: [],
      history: [],
      buffer: null,
      name: "",
      description: "",
      loading: true,
      bid: 0,
    };
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.captureName = this.captureName.bind(this);
    this.captureDes = this.captureDes.bind(this);
    this.captureBid = this.captureBid.bind(this);
    this.bidHistory = this.bidHistory.bind(this);
  }

  captureBid(event) {
    event.preventDefault();
    const bid = event.target.value;
    this.setState({ bid });
  }

  async componentWillMount() {
    var total = 0;
    await this.props.contract.methods
      .totalSupply()
      .call()
      .then(function(res) {
        total = res;
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
      if (token.onAuction) {
        await this.props.contract.methods
          .auction(token.id)
          .call()
          .then(function(res) {
            token = res;
          });
        this.setState({
          auction: [...this.state.auction, token],
        });
        this.setState({
          end: [...this.state.end, token.auctionEndTime],
        });
      } else {
        this.setState({
          end: [...this.state.end, 0],
        });
      }
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
    this.setState({ loading: false });
  }

  floatToStr(num) {
    return num.toString().indexOf(".") === -1 ? num.toFixed(1) : num.toString();
  }

  mint = (card) => {
    this.props.contract.methods
      .mint(card)
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

  async bidHistory(key) {
    var eve = await this.props.contract.getPastEvents("HighestBidIncreased", {
      fromBlock: 0,
      toBlock: "latest",
    });
    this.setState({ history: [] });
    for (var i = 1; i <= eve.length; i++) {
      var unixTimestamp = parseInt(eve[i - 1].returnValues.endTime);
      const data = JSON.stringify({
        bidder: eve[i - 1].returnValues.bidder,
        amount: Web3Utils.fromWei(
          parseInt(eve[i - 1].returnValues.amount._hex, 16).toString(),
          "ether"
        ),
        id: parseInt(eve[i - 1].returnValues.id._hex, 16),
        endTime: unixTimestamp,
      });

      data = JSON.parse(data);
      if (data.id == key && this.state.end[key] == data.endTime) {
        this.setState({ history: [...this.state.history, data] });
      }
      console.log(
        data.id + " " + key + " " + this.state.end[key] + " " + data.endTime
      );
    }

    this.setState({ history: this.state.history.reverse() });
  }

  async placeBid(key) {
    console.log(key + " " + this.state.tokens[key]);
    await this.props.contract.methods
      .bid(key)
      .send({
        from: this.props.account,
        value: Web3Utils.toWei(this.state.bid, "ether"),
      })
      .once("receipt", (receipt) => {
        console.log(receipt);
      });
  }

  async withdraw(key) {
    await this.props.contract.methods
      .auctionEnd(key)
      .send({
        from: this.props.account,
      })
      .once("receipt", (receipt) => {
        console.log(receipt);
      });
  }

  captureName(event) {
    event.preventDefault();
    const name = event.target.value;
    this.setState({ name });
  }

  captureDes(event) {
    event.preventDefault();
    const description = event.target.value;
    this.setState({ description });
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
        description: this.state.description,
        image: imageLink,
        minter: this.props.account,
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
      this.setState({ buffer: null });
    });
  }

  render() {
    return (
      <div>
        <div className="row">
          <main role="main" className="col-lg-12 d-flex ">
            <div className="content mr-auto ml-auto mt-5">
              <h2 className="ml-5">Issue New Token</h2>
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
                      Description
                    </span>
                  </div>
                  <input
                    type="text"
                    className="fom-control mb-2"
                    class="form-control"
                    aria-label="Description"
                    aria-describedby="inputGroup-sizing-default"
                    required
                    onChange={this.captureDes}
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
        {this.state.loading ? (
          <div id="loader" className="text-center">
            <p className="text-center">Loading...</p>
          </div>
        ) : (
          <div className="row text-center">
            {this.state.tokens.map((token, key) => {
              return token.listed ? (
                <div key={key}>
                  <Token
                    token={token}
                    keys={key}
                    key={key}
                    frm="0"
                    auction={null}
                  />
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
                <span key={key}></span>
              );
            })}
          </div>
        )}
        <hr />

        <center>
          <h3>On Auction</h3>
        </center>
        {this.state.loading ? (
          <div id="loader" className="text-center">
            <p className="text-center">Loading...</p>
          </div>
        ) : (
          <div className="row text-center">
            {this.state.tokens.map((token, key) => {
              return token.onAuction ? (
                <div key={key}>
                  <Token
                    token={token}
                    keys={key}
                    key={key}
                    frm="0"
                    auction={this.state.auction[key]}
                  />

                  <div class="form-group">
                    <input
                      type="text"
                      class=" ml-4"
                      aria-describedby="emailHelp"
                      placeholder="Price"
                      style={{ width: 240 }}
                      onChange={this.captureBid}
                    />
                  </div>

                  {parseInt(this.state.auction[key].auctionEndTime._hex, 16) <=
                  Math.floor(Date.now() / 1000) ? (
                    <div>
                      {this.state.auction[key].beneficiary ==
                        this.props.account ||
                      this.state.auction[key].highestBidder ==
                        this.props.account ? (
                        <button
                          type="button"
                          className="btn btn-dark mb-3 ml-3"
                          style={{ width: 150 }}
                          onClick={() => this.withdraw(key)}
                        >
                          Withdraw
                        </button>
                      ) : (
                        <span></span>
                      )}
                    </div>
                  ) : (
                    <div>
                      {this.state.auction[key].beneficiary !=
                      this.props.account ? (
                        <button
                          type="button"
                          className="btn btn-dark mb-3 ml-3"
                          style={{ width: 150 }}
                          onClick={() => this.placeBid(key)}
                        >
                          Place Bid
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="btn btn-dark mb-3 ml-3"
                          style={{ width: 150 }}
                        >
                          Place Bid
                        </button>
                      )}
                    </div>
                  )}
                  <div key={key}>
                    <button
                      type="button"
                      className="btn btn-dark mb-3 ml-3"
                      key={key}
                      style={{ width: 200 }}
                      onClick={() => this.bidHistory(key)}
                    >
                      Bidding History
                    </button>
                  </div>
                </div>
              ) : (
                <span key={key}></span>
              );
            })}
            {this.state.history.length > 0 ? (
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">Bidder</th>
                    <th scope="col">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.history.map((history, key) => (
                    <tr>
                      <td>{history.bidder}</td>
                      <td>{history.amount}</td>
                    </tr>
                  ))}
                  ;
                </tbody>
              </table>
            ) : (
              <span></span>
            )}
          </div>
        )}
        <hr />
      </div>
    );
  }
}

export default Content;
