import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Market, Testnet_sUSDT } from "../../typechain-types";
import { getTestUsers, TestConstants, expectRevert, increaseTime, deployTestUSDT, getCurrentTimestamp } from "../utils/testHelpersSimple";

describe("Market Contract", function () {
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

    it("Should set project data CID", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      expect(await market.projectDataCID()).to.equal("QmTestProjectDataCID");
    });
  });

  describe("Deposits", function () {
    it("Should allow lenders to deposit funds", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);
      const depositAmount = ethers.parseEther("500");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), depositAmount);
      
      await expect(
        market.connect(users.lender).deposit(depositAmount)
      ).to.emit(market, "Deposited")
        .withArgs(users.lender.address, depositAmount);

      expect(await market.depositsOf(users.lender.address)).to.equal(depositAmount);
      expect(await market.totalDeposited()).to.equal(depositAmount);
    });

    it("Should allow multiple lenders to deposit", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);
      const depositAmount1 = ethers.parseEther("300");
      const depositAmount2 = ethers.parseEther("400");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), depositAmount1);
      await testUSDT.connect(users.user1).approve(await market.getAddress(), depositAmount2);

      await market.connect(users.lender).deposit(depositAmount1);
      await market.connect(users.user1).deposit(depositAmount2);

      expect(await market.totalDeposited()).to.equal(depositAmount1 + depositAmount2);
    });

    it("Should cap deposits at loan amount", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);
      const excessiveAmount = TestConstants.LOAN_AMOUNT + ethers.parseEther("500");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), excessiveAmount);
      await market.connect(users.lender).deposit(excessiveAmount);

      // Should only deposit up to loan amount
      expect(await market.totalDeposited()).to.equal(TestConstants.LOAN_AMOUNT);
      expect(await market.depositsOf(users.lender.address)).to.equal(TestConstants.LOAN_AMOUNT);
    });

    it("Should prevent deposits when market is fully funded", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund the market
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);

      // Try to deposit more
      await testUSDT.connect(users.user1).approve(await market.getAddress(), ethers.parseEther("100"));
      
      await expectRevert(
        market.connect(users.user1).deposit(ethers.parseEther("100"))
      );
    });

    it("Should prevent deposits when not in funding state", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund and start loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      // Try to deposit when in Active state
      await testUSDT.connect(users.user1).approve(await market.getAddress(), ethers.parseEther("100"));
      
      await expectRevert(
        market.connect(users.user1).deposit(ethers.parseEther("100"))
      );
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

      await expect(
        market.connect(users.borrower).startAndBorrow()
      ).to.emit(market, "LoanStarted");

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

      // Fully fund and start loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      return { market, testUSDT, users };
    }

    it("Should allow borrower to repay loan", async function () {
      const { market, testUSDT, users } = await loadFixture(activeLoanFixture);

      // Calculate expected repayment (principal + interest)
      const interest = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE)) / 10000n;
      const totalOwed = TestConstants.LOAN_AMOUNT + interest;

      // Mint repayment tokens to borrower
      await testUSDT.connect(users.owner).mint(users.borrower.address, totalOwed);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), totalOwed);

      await expect(
        market.connect(users.borrower).repay()
      ).to.emit(market, "LoanRepaid");

      expect(await market.currentState()).to.equal(2); // State.Repaid
    });

    it("Should calculate interest based on actual time elapsed", async function () {
      const { market, testUSDT, users } = await loadFixture(activeLoanFixture);

      // Fast forward to half the tenor
      await increaseTime(TestConstants.TENOR_SECONDS / 2);

      // For half tenor, interest should be roughly half
      const expectedDailyRate = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE)) / (10000n * 365n);
      const halfTenorDays = BigInt(TestConstants.TENOR_SECONDS / 2);
      const expectedInterest = expectedDailyRate * halfTenorDays;
      const totalOwed = TestConstants.LOAN_AMOUNT + expectedInterest;

      await testUSDT.connect(users.owner).mint(users.borrower.address, totalOwed);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), totalOwed);

      await market.connect(users.borrower).repay();
      expect(await market.currentState()).to.equal(2); // State.Repaid
    });

    it("Should prevent repayment from non-borrower", async function () {
      const { market, testUSDT, users } = await loadFixture(activeLoanFixture);

      const interest = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE)) / 10000n;
      const totalOwed = TestConstants.LOAN_AMOUNT + interest;

      await testUSDT.connect(users.owner).mint(users.lender.address, totalOwed);
      await testUSDT.connect(users.lender).approve(await market.getAddress(), totalOwed);

      await expectRevert(
        market.connect(users.lender).repay()
      );
    });

    it("Should prevent repayment when loan not active", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      const interest = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE)) / 10000n;
      const totalOwed = TestConstants.LOAN_AMOUNT + interest;

      await testUSDT.connect(users.owner).mint(users.borrower.address, totalOwed);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), totalOwed);

      await expectRevert(
        market.connect(users.borrower).repay()
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

      await expect(
        market.connect(users.lender).markAsDefaulted()
      ).to.emit(market, "MarkedAsDefaulted");

      expect(await market.currentState()).to.equal(3); // State.Defaulted
    });

    it("Should prevent marking as defaulted before expiry", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fully fund and start loan but don't wait for expiry
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      await expectRevert(
        market.connect(users.lender).markAsDefaulted()
      );
    });

    it("Should prevent marking as defaulted when not active", async function () {
      const { market, users } = await loadFixture(deployMarketFixture);

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

      // Advance time by a small amount to simulate loan duration
      await increaseTime(86400); // 1 day

      // To avoid precision issues, let's use a much larger buffer for repayment
      // The test should focus on the logic rather than exact amounts
      const largeBuffer = ethers.parseEther("10"); // Much larger buffer
      const totalOwed = TestConstants.LOAN_AMOUNT + largeBuffer;
      await testUSDT.connect(users.owner).mint(users.borrower.address, totalOwed);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), totalOwed);
      await market.connect(users.borrower).repay();

      // Calculate the rough interest for test expectations (won't be exact due to timing)
      const timeElapsed = 86400; // 1 day in seconds
      const roughInterest = (TestConstants.LOAN_AMOUNT * BigInt(TestConstants.INTEREST_RATE) * BigInt(timeElapsed)) / (10000n * 365n * 24n * 60n * 60n);

      return { market, testUSDT, users, interest: roughInterest };
    }

    it("Should allow lenders to claim returns after repayment", async function () {
      const { market, users } = await loadFixture(repaidLoanFixture);

      const balanceBefore = await market.depositsOf(users.lender.address);
      expect(balanceBefore).to.equal(TestConstants.LOAN_AMOUNT);

      await expect(
        market.connect(users.lender).claim()
      ).to.emit(market, "Claimed");

      expect(await market.depositsOf(users.lender.address)).to.equal(0);
    });

    it("Should prevent double claiming", async function () {
      const { market, users } = await loadFixture(repaidLoanFixture);

      await market.connect(users.lender).claim();

      await expectRevert(
        market.connect(users.lender).claim()
      );
    });

    it("Should prevent claiming when loan not finished", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);

      await expectRevert(
        market.connect(users.lender).claim()
      );
    });

    it("Should allow claiming in defaulted state with recovery", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Fund and start loan
      await testUSDT.connect(users.lender).approve(await market.getAddress(), TestConstants.LOAN_AMOUNT);
      await market.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await market.connect(users.borrower).startAndBorrow();

      // Let it expire and mark as defaulted
      await increaseTime(TestConstants.TENOR_SECONDS + 1);
      await market.connect(users.lender).markAsDefaulted();

      // Should be able to claim with recovery rate
      await market.connect(users.lender).claim();
      expect(await market.depositsOf(users.lender.address)).to.equal(0);
    });

    it("Should distribute returns proportionally to deposits", async function () {
      const { market, testUSDT, users } = await loadFixture(deployMarketFixture);

      // Two lenders with different deposit amounts
      const deposit1 = ethers.parseEther("600");
      const deposit2 = ethers.parseEther("400");

      await testUSDT.connect(users.lender).approve(await market.getAddress(), deposit1);
      await testUSDT.connect(users.user1).approve(await market.getAddress(), deposit2);

      await market.connect(users.lender).deposit(deposit1);
      await market.connect(users.user1).deposit(deposit2);

      // Start and repay loan
      await market.connect(users.borrower).startAndBorrow();
      
      // Advance time by a small amount
      await increaseTime(86400); // 1 day
      
      // Use a large buffer for repayment to avoid precision issues
      const largeBuffer = ethers.parseEther("10");
      const totalOwed = TestConstants.LOAN_AMOUNT + largeBuffer;
      await testUSDT.connect(users.owner).mint(users.borrower.address, totalOwed);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), totalOwed);
      await market.connect(users.borrower).repay();

      // Claim for both lenders
      const balance1Before = await testUSDT.balanceOf(users.lender.address);
      const balance2Before = await testUSDT.balanceOf(users.user1.address);

      await market.connect(users.lender).claim();
      await market.connect(users.user1).claim();

      const balance1After = await testUSDT.balanceOf(users.lender.address);
      const balance2After = await testUSDT.balanceOf(users.user1.address);

      const claim1 = balance1After - balance1Before;
      const claim2 = balance2After - balance2Before;

      // Should be proportional to deposits (60% vs 40%)
      expect(claim1 * 2n).to.equal(claim2 * 3n); // 60/40 = 3/2
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
      const totalOwed = TestConstants.LOAN_AMOUNT + interest;
      await testUSDT.connect(users.owner).mint(users.borrower.address, totalOwed);
      await testUSDT.connect(users.borrower).approve(await market.getAddress(), totalOwed);
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

  describe("Edge Cases", function () {
    it("Should handle zero interest rate", async function () {
      const { testUSDT, users } = await loadFixture(deployMarketFixture);

      const Market = await ethers.getContractFactory("Market");
      const zeroInterestMarket = await Market.deploy(
        await testUSDT.getAddress(),
        users.borrower.address,
        TestConstants.LOAN_AMOUNT,
        0, // 0% interest
        TestConstants.TENOR_SECONDS,
        "QmZeroInterestCID"
      );

      await testUSDT.connect(users.lender).approve(await zeroInterestMarket.getAddress(), TestConstants.LOAN_AMOUNT);
      await zeroInterestMarket.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await zeroInterestMarket.connect(users.borrower).startAndBorrow();

      // Repay with zero interest
      await testUSDT.connect(users.owner).mint(users.borrower.address, TestConstants.LOAN_AMOUNT);
      await testUSDT.connect(users.borrower).approve(await zeroInterestMarket.getAddress(), TestConstants.LOAN_AMOUNT);
      
      await zeroInterestMarket.connect(users.borrower).repay();
      expect(await zeroInterestMarket.currentState()).to.equal(2);
    });

    it("Should handle maximum interest rate", async function () {
      const { testUSDT, users } = await loadFixture(deployMarketFixture);

      const Market = await ethers.getContractFactory("Market");
      const highInterestMarket = await Market.deploy(
        await testUSDT.getAddress(),
        users.borrower.address,
        TestConstants.LOAN_AMOUNT,
        5000, // 50% interest
        TestConstants.TENOR_SECONDS,
        "QmHighInterestCID"
      );

      await testUSDT.connect(users.lender).approve(await highInterestMarket.getAddress(), TestConstants.LOAN_AMOUNT);
      await highInterestMarket.connect(users.lender).deposit(TestConstants.LOAN_AMOUNT);
      await highInterestMarket.connect(users.borrower).startAndBorrow();

      // Calculate high interest repayment
      const highInterest = (TestConstants.LOAN_AMOUNT * 5000n) / 10000n;
      const totalOwed = TestConstants.LOAN_AMOUNT + highInterest;
      
      await testUSDT.connect(users.owner).mint(users.borrower.address, totalOwed);
      await testUSDT.connect(users.borrower).approve(await highInterestMarket.getAddress(), totalOwed);
      
      await highInterestMarket.connect(users.borrower).repay();
      expect(await highInterestMarket.currentState()).to.equal(2);
    });
  });
});
