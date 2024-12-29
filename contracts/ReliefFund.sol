// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ReliefFund {
    address public admin;
    mapping(address => uint256) public donations;
    uint256 public totalFunds;

    event DonationReceived(address indexed donor, uint256 amount);
    event FundsDistributed(address indexed recipient, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can execute this");
        _;
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than zero");
        donations[msg.sender] += msg.value;
        totalFunds += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    function distributeFunds(address payable recipient, uint256 amount) public onlyAdmin {
        require(amount <= totalFunds, "Insufficient funds");
        totalFunds -= amount;
        recipient.transfer(amount);
        emit FundsDistributed(recipient, amount);
    }

    function getDonation(address donor) public view returns (uint256) {
        return donations[donor];
    }
}