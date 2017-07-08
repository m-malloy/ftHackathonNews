pragma solidity ^0.4.0;
contract News {

    struct Content {
        address owner;
        uint price;
        //uint256 fingerprint;
    }
    
    struct Order {
        address buyer;
        //uint256 fingerprint;
    }
    
    Content[] contents;
    Order[] orders;
    
    address contractMaker;
    
    function News() {
        contractMaker = msg.sender;
    }
    
    function add(uint256 fingerprint, uint price) {
        contents[fingerprint].owner = msg.sender;
        contents[fingerprint].price = price;
    }
    
    function buy(uint256 fingerprint) payable {
        if (msg.value < contents[fingerprint].price) {
          revert();
        } else {
            orders[fingerprint].buyer = msg.sender;
            //send money to owner ???
            contents[fingerprint].owner.transfer(msg.value);
        }   
    }
    
    function proveBuy(uint256 fingerprint) public constant returns (bool){
        if(orders[fingerprint].buyer == msg.sender){
            return true;
        }
    }
    
    function proveSell(uint256 fingerprint) public constant returns (bool){
        if(orders[fingerprint].buyer == msg.sender){
            return true;
        }
    }
}