pragma solidity ^0.4.4;
contract News {

    struct Content {
        address owner;
        uint price;
    }
    
    struct Order {
        address buyer;
    }
    
    mapping(uint => Content) contents;
    mapping(uint => Order) orders;
    //Order[] orders;
    
    address contractMaker;
    
    function News() {
        contractMaker = msg.sender;
    }
    
    function add(uint256 fingerprint, uint price) {
        Content content = contents[fingerprint];
        content.owner = msg.sender;
        content.price = price;
    }
        
    function getPrice(uint256 fingerprint) returns(uint _price){
        Content content = contents[fingerprint];
        return (content.price);
    }
    
    function buy(uint256 fingerprint) payable {
        Content content = contents[fingerprint];
        Order order = orders[fingerprint];
        if (msg.value < content.price) {
          revert();
        } else {
            order.buyer = msg.sender;
            content.owner.transfer(msg.value);
        }   
    }
    
    function proveBuy(uint256 fingerprint) public constant returns (bool){
        Order order = orders[fingerprint];
        if(order.buyer == msg.sender){
            return true;
        }
    }
    
    function proveOwnership(uint256 fingerprint) public constant returns (bool){
        Content content = contents[fingerprint];
        if(content.owner == msg.sender){
            return true;
        }
    }
}