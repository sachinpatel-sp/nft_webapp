pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Card is ERC721{
     string[] public cards;
     uint public totalSupply = 0;
     mapping(string => bool) _cardExists;

     constructor() ERC721("Card","CARD") {
          
     }

     function mint(string memory _card) public{
          require(!_cardExists[_card]);
          cards.push(_card);
          uint _id = cards.length - 1;
          _mint(msg.sender,_id);
          totalSupply++;
          _cardExists[_card] = true;
     }
}



