// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ReliefFund {
    struct Campaign {
        string name;
        string description;
        address admin;
        uint256 goalAmount;
        uint256 totalFunds;
        bool isActive;
        bool isCompleted;
        string impactReportLink;
    }

    uint256 public campaignCounter;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public donations; // campaignId => (donor => amount)

    event CampaignCreated(uint256 indexed campaignId, string name, uint256 goalAmount);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, uint256 amount);
    event CampaignCompleted(uint256 indexed campaignId, string impactReportLink);
    event RefundIssued(uint256 indexed campaignId, address indexed donor, uint256 amount);

    modifier onlyAdmin(uint256 campaignId) {
        require(campaigns[campaignId].admin == msg.sender, "Only admin can execute this");
        _;
    }

    function createReliefFund(
        string memory name,
        string memory description,
        uint256 goalAmount
    ) public {
        require(goalAmount > 0, "Goal amount must be greater than zero");
        campaigns[campaignCounter] = Campaign(
            name,
            description,
            msg.sender,
            goalAmount,
            0,
            true,
            false,
            ""
        );
        emit CampaignCreated(campaignCounter, name, goalAmount);
        campaignCounter++;
    }

    function donate(uint256 campaignId) public payable {
        require(campaigns[campaignId].isActive, "Campaign is not active");
        require(msg.value > 0, "Donation must be greater than zero");

        donations[campaignId][msg.sender] += msg.value;
        campaigns[campaignId].totalFunds += msg.value;

        emit DonationReceived(campaignId, msg.sender, msg.value);
    }

    function withdrawFunds(uint256 campaignId) public onlyAdmin(campaignId) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.totalFunds >= campaign.goalAmount, "Goal amount not reached");
        require(campaign.isActive, "Campaign is not active");

        uint256 amount = campaign.totalFunds;
        campaign.isActive = false;
        campaign.isCompleted = true;
        campaign.totalFunds = 0;

        payable(msg.sender).transfer(amount);

        emit FundsWithdrawn(campaignId, amount);
    }

    function refund(uint256 campaignId) public {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.isActive, "Campaign is still active");
        require(campaign.totalFunds < campaign.goalAmount, "Goal amount reached, no refunds allowed");

        uint256 donatedAmount = donations[campaignId][msg.sender];
        require(donatedAmount > 0, "No donations to refund");

        donations[campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(donatedAmount);

        emit RefundIssued(campaignId, msg.sender, donatedAmount);
    }

    function reportImpact(uint256 campaignId, string memory impactReportLink)
        public
        onlyAdmin(campaignId)
    {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.isActive, "Campaign must be completed to report impact");

        campaign.impactReportLink = impactReportLink;

        emit CampaignCompleted(campaignId, impactReportLink);
    }

    function getDonation(uint256 campaignId, address donor) public view returns (uint256) {
        return donations[campaignId][donor];
    }
}
