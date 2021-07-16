pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../../node_modules/@openzeppelin/contracts//token/ERC721/extensions/ERC721Enumerable.sol";

contract Card is ERC721Enumerable {
    struct Token {
        uint256 id;
        uint256 price;
        string card;
        bool listed;
        bool onAuction;
    }

    struct Auction {
        address payable beneficiary;
        uint256 auctionEndTime;
        address payable highestBidder;
        uint256 highestBid;
        bool ended;
    }

    mapping(uint256 => Token) public cards;
    mapping(string => bool) _cardExists;
    mapping(uint256 => Auction) public auction;

    constructor() ERC721("Card", "CARD") {}

    event transfers(
        uint256 id,
        address from,
        address to,
        uint256 time,
        uint256 eve
    );

    event HighestBidIncreased(
        address bidder,
        uint256 amount,
        uint256 id,
        uint256 endTime
    );
    event AuctionEnded(address winner, uint256 amount);

    error AuctionAlreadyEnded();
    error BidNotHighEnough(uint256 highestBid);
    error AuctionNotYetEnded();
    error AuctionEndAlreadyCalled();

    function mint(string memory _card) public {
        require(!_cardExists[_card]);
        uint256 _id = totalSupply();
        cards[_id] = Token(_id, 0, _card, false, false);
        _mint(msg.sender, _id);
        emit transfers(_id, address(0), msg.sender, block.timestamp, 0);
        _cardExists[_card] = true;
    }

    function buy(uint256 _id) public payable {
        Token memory _token = cards[_id];
        require(_token.listed && !_token.onAuction);
        require(msg.value == _token.price);
        address payable _owner = payable(ownerOf(_id));
        _owner.transfer(msg.value);
        cards[_id].listed = false;
        _transfer(_owner, msg.sender, _id);
        emit transfers(_id, _owner, msg.sender, block.timestamp, 1);
    }

    function gift(
        address _from,
        address _to,
        uint256 _id
    ) public {
        Token memory _token = cards[_id];
        require(!_token.listed && !_token.onAuction);
        _transfer(_from, _to, _id);
        emit transfers(_id, _from, _to, block.timestamp, 2);
    }

    function putOnAuction(uint256 _id, uint256 timestamp) public {
        require(ownerOf(_id) == msg.sender);
        require(!cards[_id].listed);
        cards[_id].onAuction = true;
        auction[_id] = Auction(
            payable(msg.sender),
            timestamp,
            payable(msg.sender),
            0,
            false
        );
    }

    function list(uint256 _id, uint256 price) public {
        Token memory _token = cards[_id];
        address _owner = ownerOf(_id);
        require(_owner == msg.sender);
        require(!_token.listed && !_token.onAuction);
        cards[_id].listed = true;
        cards[_id].price = price;
    }

    function delist(uint256 _id) public {
        Token memory _token = cards[_id];
        require(_token.listed && !_token.onAuction);
        address _owner = ownerOf(_id);
        require(_owner == msg.sender);
        cards[_id].listed = false;
    }

    function bid(uint256 _id) public payable {
        if (block.timestamp > auction[_id].auctionEndTime)
            revert AuctionAlreadyEnded();

        if (msg.value <= auction[_id].highestBid)
            revert BidNotHighEnough(auction[_id].highestBid);

        if (auction[_id].highestBid != 0) {
            auction[_id].highestBidder.transfer(auction[_id].highestBid);
        }
        auction[_id].highestBidder = payable(msg.sender);
        auction[_id].highestBid = msg.value;
        emit HighestBidIncreased(
            msg.sender,
            msg.value,
            _id,
            auction[_id].auctionEndTime
        );
    }

    function auctionEnd(uint256 _id) public {
        if (block.timestamp < auction[_id].auctionEndTime)
            revert AuctionNotYetEnded();
        if (auction[_id].ended) revert AuctionEndAlreadyCalled();
        require(
            msg.sender == auction[_id].beneficiary ||
                msg.sender == auction[_id].highestBidder
        );

        auction[_id].ended = true;
        emit AuctionEnded(auction[_id].highestBidder, auction[_id].highestBid);

        auction[_id].beneficiary.transfer(auction[_id].highestBid);
        _transfer(auction[_id].beneficiary, auction[_id].highestBidder, _id);
        emit transfers(
            _id,
            auction[_id].beneficiary,
            auction[_id].highestBidder,
            block.timestamp,
            1
        );
        cards[_id].onAuction = false;
        delete auction[_id];
    }
}

// 0x8a8e45214f59d987e7d80bb4257f39208238631b
