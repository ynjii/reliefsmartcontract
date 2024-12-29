import { expect } from "chai";

describe("ReliefFund", function () {
  let reliefFund;
  let admin, donor, recipient;

  beforeEach(async function () {
    const ReliefFund = await ethers.getContractFactory("ReliefFund");
    reliefFund = await ReliefFund.deploy();
    await reliefFund.deployed();

    [admin, donor, recipient] = await ethers.getSigners();
  });

  it("Should allow donations and update total funds", async function () {
    await reliefFund.connect(donor).donate({ value: ethers.utils.parseEther("1") });
    const totalFunds = await reliefFund.totalFunds();
    expect(totalFunds).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should allow admin to distribute funds", async function () {
    await reliefFund.connect(donor).donate({ value: ethers.utils.parseEther("1") });
    await reliefFund.connect(admin).distributeFunds(recipient.address, ethers.utils.parseEther("0.5"));

    const totalFunds = await reliefFund.totalFunds();
    expect(totalFunds).to.equal(ethers.utils.parseEther("0.5"));
  });

  it("Should prevent non-admins from distributing funds", async function () {
    await reliefFund.connect(donor).donate({ value: ethers.utils.parseEther("1") });
    await expect(
      reliefFund.connect(donor).distributeFunds(recipient.address, ethers.utils.parseEther("0.5"))
    ).to.be.revertedWith("Only admin can execute this");
  });
});
