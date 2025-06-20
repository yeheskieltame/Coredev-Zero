import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Market, Testnet_sUSDT } from "../../typechain-types";
import { getTestUsers, TestConstants, expectRevert, increaseTime, deployTestUSDT } from "../utils/testHelpersSimple";

describe("Market", function () {
  async function deployMarketFixture() {
    const users = await getTestUsers();
    
    const testUSDT = await deployTestUSDT(users.owner.address);
    await testUSDT.waitForDeployment();

    const Market = await ethers.getContractFactory("Market");
    const market = await Market.deploy(
      await testUSDT.getAddress(), // asset
      users.borrower.address, // borrower
      TestConstants.LOAN_AMOUNT, // loan amount
      TestConstants.INTEREST_RATE, // interest rate
      TestConstants.TENOR_SECONDS, // tenor
      "QmTestProjectDataCID" // project data CID
    );
    await market.waitForDeployment();

    // Mint test tokens
    await testUSDT.connect(users.owner).mint(users.lender.address, ethers.parseEther("10000"));
    await testUSDT.connect(users.owner).mint(users.user1.address, ethers.parseEther("5000"));

    return { market, testUSDT, users };
  }

  describe("Deployment", function () {
    it("Should set the correct parameters", async function () {
      const { market, users } = await loadFixture(deployMarketFixture);

      expect(await market.borrower()).to.equal(users.borrower.address);
      expect(await market.loanAmount()).to.equal(TestConstants.LOAN_AMOUNT);
      expect(await market.interestRateBps()).to.equal(TestConstants.INTEREST_RATE);
      expect(await market.tenorSeconds()).to.equal(TestConstants.TENOR_SECONDS);
    });

    it("Should initialize in Funding state", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      expect(await market.currentState()).to.equal(0); // State.Funding
    });

    it("Should have zero deposits initially", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      expect(await market.totalDeposited()).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should allow deposits in funding state", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);
      const depositAmount = ethers.parseEther("500");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), depositAmount);
      await market.connect(users.lender).deposit(depositAmount);

      expect(await market.totalDeposited()).to.equal(depositAmount);
      expect(await market.depositsOf(users.lender.address)).to.equal(depositAmount);
    });

    it("Should allow multiple deposits", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);
      const depositAmount1 = ethers.parseEther("300");
      const depositAmount2 = ethers.parseEther("200");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), depositAmount1);
      await testUSDT.connect(users.user1).approve(await market.getAddress(), depositAmount2);

      await market.connect(users.lender).deposit(depositAmount1);
      await market.connect(users.user1).deposit(depositAmount2);

      expect(await market.totalDeposited()).to.equal(depositAmount1 + depositAmount2);
    });

    it("Should prevent excessive deposits", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);
      const excessiveAmount = TestConstants.LOAN_AMOUNT + ethers.parseEther("100");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), excessiveAmount);

      // First deposit should succeed up to loan amount
      await market.connect(users.lender).deposit(excessiveAmount);
      
      // Should only deposit up to loan amount
      expect(await market.totalDeposited()).to.equal(TestConstants.LOAN_AMOUNT);
    });
  });

  describe("Loan Start", function () {
    async function fullyFundedMarketFixture() {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund the market
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);

      return { market, testUSDT, users };
    }

    it("Should allow borrower to start loan when fully funded", async function () {
      const { market, users } = await loadFixture(fullyFundedMarketFixture);

      await market.connect(users.borrower).startAndBorrow();

      expect(await market.currentState()).to.equal(1); // State.Active
      expect(await market.loanStartTime()).to.be.greaterThan(0);
    });

    it("Should prevent non-borrower from starting loan", async function () {
      const { market, users } = await loadFixture(fullyFundedMarketFixture);

      await expectRevert(
        market.connect(users.lender).startAndBorrow()
      );
    });

    it("Should prevent starting loan when not fully funded", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);
      const partialAmount = ethers.parseEther("500");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), partialAmount);
      await market.connect(users.lender).deposit(partialAmount);

      await expectRevert(
        market.connect(users.borrower).startAndBorrow()
      );
    });

    it("Should transfer funds to borrower when loan starts", async function () {
      const { market, testUSDT, users } = await loadFixture(fullyFundedMarketFixture);
      const initialBalance = await testUSDT.balanceOf(users.borrower.address);

      await market.connect(users.borrower).startAndBorrow();

      const finalBalance = await testUSDT.balanceOf(users.borrower.address);
      expect(finalBalance - initialBalance).to.equal(TestConstants.LOAN_AMOUNT);
    });
  });

  describe("Repayment", function () {
    async function activeLoanFixture() {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund and start the loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      // Calculate repayment amount - simplified for immediate repayment
      const interest = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE)) / 10000n;
      const repaymentAmount = TestConstants.LOAN_AMOUNT + interest;
      
      // Mint repayment tokens to borrower
      await testUSDT.connect(users.owner).mint(users.borrower.address, repaymentAmount);

      return { market, testUSDT, users, repaymentAmount };
    }

    it("Should allow borrower to repay loan", async function () {
      const { market, testUSDT, users, repaymentAmount } = await loadFixture(activeLoanFixture);

      await testUSDT.connect(users.borrower).approve(await market.getAddress(), repaymentAmount);
      await market.connect(users.borrower).repay();

      expect(await market.currentState()).to.equal(2); // State.Repaid
    });

    it("Should prevent repayment from non-borrower", async function () {
      const { market, testUSDT, users, repaymentAmount } = await loadFixture(activeLoanFixture);

      await testUSDT.connect(users.owner).mint(users.lender.address, repaymentAmount);
      await testUSDT.connect(users.lender).approve(await market.getAddress(), repaymentAmount);

      await expectRevert(
        market.connect(users.lender).repay()
      );
    });
  });

  describe("Default Handling", function () {
    async function expiredLoanFixture() {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund and start loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      // Fast forward past loan expiry
      await increaseTime(TestConstants.TENOR_SECONDS + 1);

      return { market, testUSDT, users };
    }

    it("Should allow marking loan as defaulted after expiry", async function () {
      const { market, users } = await loadFixture(expiredLoanFixture);

      await market.connect(users.lender).markAsDefaulted();

      expect(await market.currentState()).to.equal(3); // State.Defaulted
    });

    it("Should prevent marking as defaulted before expiry", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund and start loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      await expectRevert(
        market.connect(users.lender).markAsDefaulted()
      );
    });
  });

  describe("Claims", function () {
    async function repaidLoanFixture() {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund and start loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      // Repay loan
      const interest = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE)) / 10000n;
      const repaymentAmount = TestConstants.LOAN_AMOUNT + interest;
      await testUSDT.connect(users.owner).mint(users.borrower.address, repaymentAmount);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), repaymentAmount);
      await market.connect(users.borrower).repay();

      return { market, testUSDT, users };
    }

    it("Should allow lenders to claim returns after repayment", async function () {
      const { market, testUSDT, users } = await loadFixture(repaidLoanFixture);

      const initialBalance = await testUSDT.balanceOf(users.lender.address);
      await market.connect(users.lender).claim();
      const finalBalance = await testUSDT.balanceOf(users.lender.address);

      expect(finalBalance).to.be.greaterThan(initialBalance);
      // After claiming, deposit should be reset to 0
      expect(await market.depositsOf(users.lender.address)).to.equal(0);
    });

    it("Should prevent double claiming", async function () {
      const { market, users } = await loadFixture(repaidLoanFixture);

      await market.connect(users.lender).claim();

      await expectRevert(
        market.connect(users.lender).claim()
      );
    });
  });

  describe("State Transitions", function () {
    it("Should transition through states correctly", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Initial state: Funding
      expect(await market.currentState()).to.equal(0);

      // Fund the market
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);

      // Start loan: Funding -> Active
      await market.connect(users.borrower).startAndBorrow();
      expect(await market.currentState()).to.equal(1);

      // Repay loan: Active -> Repaid
      const interest = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE)) / 10000n;
      const repaymentAmount = TestConstants.LOAN_AMOUNT + interest;
      await testUSDT.connect(users.owner).mint(users.borrower.address, repaymentAmount);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), repaymentAmount);
      await market.connect(users.borrower).repay();
      
      expect(await market.currentState()).to.equal(2);
    });

    it("Should handle default state transition", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fund and start loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      // Fast forward past expiry and mark as defaulted
      await increaseTime(TestConstants.TENOR_SECONDS + 1);
      await market.connect(users.lender).markAsDefaulted();

      expect(await market.currentState()).to.equal(3); // State.Defaulted
    });
  });
});
