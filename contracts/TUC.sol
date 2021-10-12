pragma solidity ^0.4.23;

contract TUC {

  // Mapping from user address to boolean type
  mapping(address => bool) isAuthorized;

  // Define struct
  struct tr {
    string _currentTx;
    string _sender;
    string _receiver;
    uint _time;
  }

  mapping(uint => tr) trs;

  uint _numberOfTrs;

  address _batchAdmin;

  // As a prerequisite for some functions
  modifier onlyAdmin {
    require(msg.sender == _batchAdmin);
    _;
  }

  modifier onlyAuthorized(address addr) {
    require(isAuthorized[addr] == true);
    _;
  }

  // Constructor function
  constructor() public {
    _batchAdmin = msg.sender;
    _numberOfTrs = 1;
  }

  // Update transaction information
  function addTr(string currentTx, string re,string sender) public onlyAdmin {

    trs[_numberOfTrs]._currentTx = currentTx;
    trs[_numberOfTrs]._receiver = re;
    trs[_numberOfTrs]._sender = sender;
    trs[_numberOfTrs]._time = now;

    _numberOfTrs++;

  }

  // Get transaction information by id
  function getTrOfId(uint id) constant public returns(string currentTx, string se, string re, uint time) {
    currentTx = trs[id]._currentTx;
    re = trs[id]._receiver;
    se = trs[id]._sender;
    time = trs[id]._time;
  }

  // Get the number of transactions
  function getNumberOfTrs() constant public returns(uint numberOfTrs) {
    numberOfTrs = _numberOfTrs - 1;
  }

  // Add user to authorization list
  function addUser(address addr) public onlyAdmin {
    isAuthorized[addr] = true;
  }

  // Remove user
  function removeUser(address addr) public onlyAdmin {
    isAuthorized[addr] = false;
  }

  // Check if the user is authorized
  function checkUser(address addr) constant public returns(bool result) {
    result = isAuthorized[addr];
  }

  // Destroy the contract
  function deleteContract() public onlyAdmin {
    selfdestruct(_batchAdmin);
  }

}

