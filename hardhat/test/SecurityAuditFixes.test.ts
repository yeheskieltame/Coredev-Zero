import { expect } from "chai";
import { ethers } from "hardhat";
import { Market, StakingVault, RiskAssessmentOracle, DeveloperProfile, MockToken } from "../typechain-types";

describe("Security Audit Fixes", function () {
  let market: Market;
  let stakingVault: StakingVault;
  let riskOracle: RiskAssessmentOracle;
  let developerProfile: DeveloperProfile;
  let mockToken: MockToken;
  let owner: any;
  let borrower: any;
  let lender: any;

  beforeEach(async function () {
    [owner, borrower, lender] = await ethers.getSigners();

    // Deploy mock token
    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy("Test USDT", "tUSDT", 18);
    
    // Deploy DeveloperProfile
    const DeveloperProfile = await ethers.getContractFactory("DeveloperProfile");
    developerProfile = await DeveloperProfile.deploy();

    // Deploy StakingVault
    const StakingVault = await ethers.getContractFactory("StakingVault");
    stakingVault = await StakingVault.deploy(owner.address);

    // Deploy RiskAssessmentOracle
    const RiskAssessmentOracle = await ethers.getContractFactory("RiskAssessmentOracle");
    riskOracle = await RiskAssessmentOracle.deploy(await developerProfile.getAddress());

    // Deploy Market
    const Market = await ethers.getContractFactory("Market");
    market = await Market.deploy(
      await mockToken.getAddress(),
      borrower.address,
      ethers.parseEther("1000"), // 1000 tokens
      1000, // 10% APR
      365 * 24 * 3600, // 1 year
      "QmTestProject"
    );

    // Setup tokens
    await mockToken.mint(lender.address, ethers.parseEther("2000"));
    await mockToken.mint(borrower.address, ethers.parseEther("2000"));
    
    // Approve spending
    await mockToken.connect(lender).approve(await market.getAddress(), ethers.parseEther("2000"));
    await mockToken.connect(borrower).approve(await market.getAddress(), ethers.parseEther("2000"));
  });

  describe("1. Interest Calculation Fix", function () {
    it("Should calculate interest based on actual time elapsed, not full tenor", async function () {
      // Fund the market
      await market.connect(lender).deposit(ethers.parseEther("1000"));
      
      // Start loan
      await market.connect(borrower).startAndBorrow();
      
      // Fast forward 6 months (half the tenor)
      const sixMonthsInSeconds = 182 * 24 * 3600;
      await ethers.provider.send("evm_increaseTime", [sixMonthsInSeconds]);
      await ethers.provider.send("evm_mine");
      
      // Get the exact time elapsed for precise calculation
      const currentBlock = await ethers.provider.getBlock("latest");
      const loanStartTime = (await market.loanStartTime()).toString();
      const actualTimeElapsed = currentBlock!.timestamp - parseInt(loanStartTime);
      
      // Repay early
      const initialBalance = await mockToken.balanceOf(borrower.address);
      await market.connect(borrower).repay();
      const finalBalance = await mockToken.balanceOf(borrower.address);
      
      const paidAmount = initialBalance - finalBalance;
      const expectedInterest = ethers.parseEther("1000") * BigInt(1000) * BigInt(actualTimeElapsed) / (BigInt(10000) * BigInt(365 * 24 * 3600));
      const expectedTotal = ethers.parseEther("1000") + expectedInterest;
      
      expect(paidAmount).to.be.closeTo(expectedTotal, ethers.parseEther("0.01")); // Within 0.01 ETH precision
      expect(paidAmount).to.be.lessThan(ethers.parseEther("1100")); // Less than full year interest
    });

    it("Should not charge more than full tenor interest", async function () {
      // Fund the market
      await market.connect(lender).deposit(ethers.parseEther("1000"));
      
      // Start loan
      await market.connect(borrower).startAndBorrow();
      
      // Fast forward more than tenor (1.5 years)
      await ethers.provider.send("evm_increaseTime", [548 * 24 * 3600]);
      await ethers.provider.send("evm_mine");
      
      // Repay late
      const initialBalance = await mockToken.balanceOf(borrower.address);
      await market.connect(borrower).repay();
      const finalBalance = await mockToken.balanceOf(borrower.address);
      
      const paidAmount = initialBalance - finalBalance;
      const maxExpectedInterest = ethers.parseEther("1000") * BigInt(1000) / BigInt(10000); // 10% for full year
      const maxExpectedTotal = ethers.parseEther("1000") + maxExpectedInterest;
      
      expect(paidAmount).to.equal(maxExpectedTotal);
    });
  });

  describe("2. Default State Enhancement", function () {
    it("Should apply recovery rate in default state", async function () {
      // Fund the market
      await market.connect(lender).deposit(ethers.parseEther("1000"));
      
      // Start loan
      await market.connect(borrower).startAndBorrow();
      
      // Simulate partial repayment/insurance fund by adding some funds to contract
      // In real scenario, this would come from insurance fund or staking slashing
      await mockToken.connect(owner).mint(await market.getAddress(), ethers.parseEther("700"));
      
      // Fast forward past tenor to trigger default
      await ethers.provider.send("evm_increaseTime", [366 * 24 * 3600]);
      await ethers.provider.send("evm_mine");
      
      // Mark as defaulted
      await market.markAsDefaulted();
      
      // Lender claims with recovery rate
      const initialBalance = await mockToken.balanceOf(lender.address);
      await market.connect(lender).claim();
      const finalBalance = await mockToken.balanceOf(lender.address);
      
      const recoveredAmount = finalBalance - initialBalance;
      const expectedRecovery = ethers.parseEther("700"); // The amount we put in as insurance/recovery
      
      expect(recoveredAmount).to.equal(expectedRecovery);
    });
  });

  describe("3. Enhanced Staking Vault", function () {
    it("Should enforce minimum stake per loan", async function () {
      // Try to create loan without sufficient stake
      expect(await stakingVault.canCreateLoan(borrower.address)).to.be.false;
      
      // Stake insufficient amount
      await stakingVault.connect(borrower).stake({ value: ethers.parseEther("0.5") });
      expect(await stakingVault.canCreateLoan(borrower.address)).to.be.false;
      
      // Stake sufficient amount
      await stakingVault.connect(borrower).stake({ value: ethers.parseEther("1.5") });
      expect(await stakingVault.canCreateLoan(borrower.address)).to.be.true;
    });

    it("Should lock stake when loan is created", async function () {
      // Stake enough for loan
      await stakingVault.connect(borrower).stake({ value: ethers.parseEther("2") });
      
      const initialAvailable = await stakingVault.getAvailableStake(borrower.address);
      
      // Lock stake for loan
      await stakingVault.lockStakeForLoan(borrower.address, ethers.parseEther("1000"));
      
      const finalAvailable = await stakingVault.getAvailableStake(borrower.address);
      
      expect(finalAvailable).to.equal(initialAvailable - ethers.parseEther("1"));
    });

    it("Should prevent unstaking locked funds", async function () {
      // Stake and lock
      await stakingVault.connect(borrower).stake({ value: ethers.parseEther("1") });
      await stakingVault.lockStakeForLoan(borrower.address, ethers.parseEther("1000"));
      
      // Try to unstake locked funds
      await expect(
        stakingVault.connect(borrower).unstake(ethers.parseEther("1"))
      ).to.be.revertedWith("Cannot unstake locked funds");
    });

    it("Should slash stake on loan default", async function () {
      // Stake for loan
      await stakingVault.connect(borrower).stake({ value: ethers.parseEther("2") });
      await stakingVault.lockStakeForLoan(borrower.address, ethers.parseEther("1000"));
      
      const initialStake = await stakingVault.stakesOf(borrower.address);
      
      // Unlock with failure (default)
      await stakingVault.unlockStakeForLoan(borrower.address, false);
      
      const finalStake = await stakingVault.stakesOf(borrower.address);
      const slashedAmount = ethers.parseEther("0.5"); // 50% of minimum stake
      
      expect(finalStake).to.equal(initialStake - slashedAmount);
    });
  });

  describe("4. Risk Oracle Data Validation", function () {
    beforeEach(async function () {
      // Setup developer profile
      await developerProfile.connect(borrower).createProfile("test-dev", "QmTestCID");
      await developerProfile.updateGitHubMetrics(
        borrower.address,
        10, 50, 500, 100, 365
      );
    });

    it("Should validate data age", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const currentTimestamp = currentBlock!.timestamp;
      const oldTimestamp = currentTimestamp - 7200; // 2 hours ago
      
      await expect(
        riskOracle.updateRiskMetrics(
          borrower.address,
          500, 300, 200, 100,
          oldTimestamp
        )
      ).to.be.revertedWith("Data too old");
    });

    it("Should reject future timestamps", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const currentTimestamp = currentBlock!.timestamp;
      const futureTimestamp = currentTimestamp + 3600; // 1 hour future
      
      await expect(
        riskOracle.updateRiskMetrics(
          borrower.address,
          500, 300, 200, 100,
          futureTimestamp
        )
      ).to.be.revertedWith("Future timestamp not allowed");
    });

    it("Should validate score ranges", async function () {
      const currentBlock = await ethers.provider.getBlock("latest");
      const currentTimestamp = currentBlock!.timestamp;
      
      await expect(
        riskOracle.updateRiskMetrics(
          borrower.address,
          1500, 300, 200, 100, // Credit score too high
          currentTimestamp
        )
      ).to.be.revertedWith("Credit score too high");
    });
  });

  describe("5. Multi-Signature Governance", function () {
    it("Should require multiple confirmations for proposals", async function () {
      // Add additional governors
      await riskOracle.addGovernor(borrower.address);
      await riskOracle.addGovernor(lender.address);
      
      // Create a simple proposal that just updates an authorized updater (safer)
      const [,,,newUpdater] = await ethers.getSigners();
      const proposalData = riskOracle.interface.encodeFunctionData("governanceAuthorizeUpdater", [newUpdater.address]);
      const proposalId = await riskOracle.createProposal(await riskOracle.getAddress(), proposalData);
      
      // Single confirmation should not execute
      await riskOracle.connect(borrower).confirmProposal(0);
      
      const proposal = await riskOracle.proposals(0);
      expect(proposal.executed).to.be.false;
      expect(proposal.confirmations).to.equal(1);
      
      // Second confirmation should still not execute
      await riskOracle.connect(owner).confirmProposal(0);
      const proposal2 = await riskOracle.proposals(0);
      expect(proposal2.executed).to.be.false;
      expect(proposal2.confirmations).to.equal(2);
      
      // Third confirmation should execute (3 required)
      await riskOracle.connect(lender).confirmProposal(0);
      
      const finalProposal = await riskOracle.proposals(0);
      expect(finalProposal.executed).to.be.true;
      expect(finalProposal.confirmations).to.equal(3);
      
      // Verify the action was executed - newUpdater should be authorized
      expect(await riskOracle.authorizedUpdaters(newUpdater.address)).to.be.true;
    });
  });
});
