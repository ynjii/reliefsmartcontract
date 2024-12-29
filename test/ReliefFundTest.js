const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReliefFund", function () {
  let reliefFund;
  let admin, donor, recipient;

  beforeEach(async function () {
    const ReliefFund = await ethers.getContractFactory("ReliefFund");
    reliefFund = await ReliefFund.deploy();
    await reliefFund.deployed();

    [admin, donor, recipient] = await ethers.getSigners();
  });

  it("Should create a new campaign", async function () {
    await reliefFund.createReliefFund("Flood Relief", "Help flood victims", ethers.utils.parseEther("10"));
    const campaign = await reliefFund.campaigns(0);
    expect(campaign.name).to.equal("Flood Relief");
    expect(campaign.goalAmount.toString()).to.equal(ethers.utils.parseEther("10").toString());
  });

  it("Should allow donations to a campaign", async function () {
    await reliefFund.createReliefFund("Flood Relief", "Help flood victims", ethers.utils.parseEther("10"));
    await reliefFund.connect(donor).donate(0, { value: ethers.utils.parseEther("1") });

    const totalFunds = (await reliefFund.campaigns(0)).totalFunds;
    expect(totalFunds.toString()).to.equal(ethers.utils.parseEther("1").toString());
  });

  it("Should allow admin to withdraw funds after goal is reached", async function () {
    await reliefFund.createReliefFund("Flood Relief", "Help flood victims", ethers.utils.parseEther("1"));
    await reliefFund.connect(donor).donate(0, { value: ethers.utils.parseEther("1") });

    await reliefFund.withdrawFunds(0);

    const campaign = await reliefFund.campaigns(0);
    expect(campaign.isActive).to.be.false;
    expect(campaign.isCompleted).to.be.true;
  });

  it("Should allow donors to get refunds if goal is not reached", async function () {
    await reliefFund.createReliefFund("Flood Relief", "Help flood victims", ethers.utils.parseEther("10"));
    await reliefFund.connect(donor).donate(0, { value: ethers.utils.parseEther("1") });

    await reliefFund.connect(donor).refund(0);

    const refundedDonation = await reliefFund.getDonation(0, donor.address);
    expect(refundedDonation.toString()).to.equal("0");
  });

  it("Should allow admin to report impact after campaign is completed", async function () {
    await reliefFund.createReliefFund("Flood Relief", "Help flood victims", ethers.utils.parseEther("1"));
    await reliefFund.connect(donor).donate(0, { value: ethers.utils.parseEther("1") });

    await reliefFund.withdrawFunds(0);
    await reliefFund.reportImpact(0, "https://impactreport.example.com");

    const campaign = await reliefFund.campaigns(0);
    expect(campaign.impactReportLink).to.equal("https://impactreport.example.com");
  });
});
