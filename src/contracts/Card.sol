pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Card is ERC721Enumerable{
     //string[] public cards;
     struct Token{
          uint id;
          uint price;
          string card;
          bool listed;
     }
     mapping(uint => Token) public cards;
     mapping(string => bool) _cardExists;

     constructor() ERC721("Card","CARD") {
          
     }

     function mint(string memory _card,uint _price) public{
          require(!_cardExists[_card]);
          //cards.push(_card);
          //uint _id = cards.length - 1;
          uint _id = totalSupply();
          cards[_id] = Token(_id,_price,_card,true);
          _mint(msg.sender,_id);
          _cardExists[_card] = true;
     }

     function buy(uint _id) public payable{
          Token memory _token = cards[_id];
          require(msg.value == _token.price);
          address payable _owner = payable(ownerOf(_id));
          _owner.transfer(msg.value);
          cards[_id].listed = false;
          _transfer(_owner, msg.sender, _id);
     }

     function list(uint _id,uint price) public{
          address _owner = ownerOf(_id);
          require(_owner == msg.sender);
          cards[_id].listed = true;
          cards[_id].price = price;
     }

     function delist(uint _id) public{
          address _owner = ownerOf(_id);
          require(_owner == msg.sender);
          cards[_id].listed = false;
     }
}



