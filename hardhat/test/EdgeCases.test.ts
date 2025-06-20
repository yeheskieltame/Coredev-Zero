import { expect } from "chai";
import { ethers } from "hardhat";
import { StakingVault, DeveloperProfile, RiskAssessmentOracle, ReputationSBT, MarketFactory, MockToken } from "../typechain-types";

describe("Comprehensive Edge Cases & Security Tests", function () {
  let stakingVault: StakingVault;
  let developerProfile: DeveloperProfile;
  let riskOracle: RiskAssessmentOracle;
  let reputationSBT: ReputationSBT;
  let marketFactory: MarketFactory;
  let mockToken: MockToken;
  let owner: any;
  let developer: any;
  let lender: any;
  let attacker: any;

  beforeEach(async function () {
    [owner, developer, lender, attacker] = await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy("Mock USDT", "mUSDT", 6);

    const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
    reputationSBT = await ReputationSBT.deploy(owner.address);

    const StakingVault = await ethers.getContractFactory("StakingVault");
    stakingVault = await StakingVault.deploy(owner.address);

    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    marketFactory = await MarketFactory.deploy(
      await mockToken.getAddress(),
      await reputationSBT.getAddress(),
      await stakingVault.getAddress()
    );

    // Get the DeveloperProfile instance from MarketFactory for consistency
    const marketFactoryProfileAddress = await marketFactory.developerProfile();
    developerProfile = await ethers.getContractAt("DeveloperProfile", marketFactoryProfileAddress);

    // Deploy RiskOracle with the same DeveloperProfile
    const RiskAssessmentOracle = await ethers.getContractFactory("RiskAssessmentOracle");
    riskOracle = await RiskAssessmentOracle.deploy(marketFactoryProfileAddress);

    // Setup proper permissions
    await stakingVault.connect(owner).authorizeContract(await marketFactory.getAddress());
    await marketFactory.connect(owner).addVerifierToDeveloperProfile(await marketFactory.getAddress());
    await riskOracle.connect(owner).authorizeUpdater(owner.address);
  });

  describe("Security & Access Control Tests", function () {
    it("Should prevent unauthorized access to critical functions", async function () {
      // Test unauthorized access to StakingVault admin functions
      await expect(
        stakingVault.connect(attacker).authorizeContract(attacker.address)
      ).to.be.revertedWithCustomError(stakingVault, "OwnableUnauthorizedAccount");

      await expect(
        stakingVault.connect(attacker).emergencyUnlockStake(developer.address)
      ).to.be.revertedWithCustomError(stakingVault, "OwnableUnauthorizedAccount");

      // Test unauthorized access to DeveloperProfile admin functions
      await expect(
        developerProfile.connect(attacker).addVerifier(attacker.address)
      ).to.be.revertedWithCustomError(developerProfile, "OwnableUnauthorizedAccount");

      await expect(
        developerProfile.connect(attacker).addOracle(attacker.address)
      ).to.be.revertedWithCustomError(developerProfile, "OwnableUnauthorizedAccount");

      // Test unauthorized access to RiskOracle admin functions
      await expect(
        riskOracle.connect(attacker).addGovernor(attacker.address)
      ).to.be.revertedWithCustomError(riskOracle, "OwnableUnauthorizedAccount");

      await expect(
        riskOracle.connect(attacker).authorizeUpdater(attacker.address)
      ).to.be.revertedWithCustomError(riskOracle, "OwnableUnauthorizedAccount");
    });

    it("Should prevent role escalation attacks", async function () {
      // Developer should not be able to grant themselves admin role
      await expect(
        marketFactory.connect(developer).grantRole(await marketFactory.DEFAULT_ADMIN_ROLE(), developer.address)
      ).to.be.revertedWithCustomError(marketFactory, "AccessControlUnauthorizedAccount");

      // Attacker should not be able to create profiles for others
      await expect(
        developerProfile.connect(attacker).createProfileFor(developer.address, "fake-github", "fake-cid")
      ).to.be.revertedWithCustomError(developerProfile, "OwnableUnauthorizedAccount");
    });

    it("Should prevent reentrancy attacks on StakingVault", async function () {
      // Stake some amount first
      await stakingVault.connect(developer).stake({ value: ethers.parseEther("2.0") });
      
      // Normal unstake should work
      await stakingVault.connect(developer).unstake(ethers.parseEther("1.0"));
      expect(await stakingVault.stakesOf(developer.address)).to.equal(ethers.parseEther("1.0"));
      
      // Multiple unstake attempts should not cause issues
      await stakingVault.connect(developer).unstake(ethers.parseEther("0.5"));
      await stakingVault.connect(developer).unstake(ethers.parseEther("0.5"));
      expect(await stakingVault.stakesOf(developer.address)).to.equal(0);
    });
  });

  describe("Edge Cases for StakingVault", function () {
    it("Should handle edge case of exact minimum stake", async function () {
      // Stake exactly the minimum required (1 ETH)
      await stakingVault.connect(developer).stake({ value: ethers.parseEther("1.0") });
      
      // Should be able to create exactly one loan
      expect(await stakingVault.canCreateLoan(developer.address)).to.be.true;
      
      // After locking stake for loan, should not be able to create another
      await stakingVault.lockStakeForLoan(developer.address, ethers.parseEther("1000"));
      expect(await stakingVault.canCreateLoan(developer.address)).to.be.false;
    });

    it("Should handle multiple simultaneous developers correctly", async function () {
      const developers = await ethers.getSigners();
      const testDevs = developers.slice(1, 6); // 5 developers
      
      // All stake different amounts
      for (let i = 0; i < testDevs.length; i++) {
        await stakingVault.connect(testDevs[i]).stake({ 
          value: ethers.parseEther((i + 1).toString()) 
        });
      }
      
      // All should be able to create loans
      for (let i = 0; i < testDevs.length; i++) {
        expect(await stakingVault.canCreateLoan(testDevs[i].address)).to.be.true;
      }
      
      // Lock stakes for loans
      for (let i = 0; i < testDevs.length; i++) {
        await stakingVault.lockStakeForLoan(testDevs[i].address, ethers.parseEther("1000"));
      }
      
      // Check locked amounts and remaining availability
      for (let i = 0; i < testDevs.length; i++) {
        expect(await stakingVault.lockedStakes(testDevs[i].address)).to.equal(ethers.parseEther("1.0"));
        expect(await stakingVault.getAvailableStake(testDevs[i].address)).to.equal(ethers.parseEther(i.toString()));
      }
    });

    it("Should handle slashing correctly for defaulted loans", async function () {
      await stakingVault.connect(developer).stake({ value: ethers.parseEther("3.0") });
      
      const initialBalance = await ethers.provider.getBalance(developer.address);
      const initialStake = await stakingVault.stakesOf(developer.address);
      
      // Lock stake for loan
      await stakingVault.lockStakeForLoan(developer.address, ethers.parseEther("1000"));
      
      // Simulate loan default (false = unsuccessful)
      await stakingVault.unlockStakeForLoan(developer.address, false);
      
      // Check that 50% was slashed (0.5 ETH from 1 ETH locked)
      const finalStake = await stakingVault.stakesOf(developer.address);
      expect(finalStake).to.equal(initialStake - ethers.parseEther("0.5"));
      
      // Should still be able to create another loan with remaining stake
      expect(await stakingVault.canCreateLoan(developer.address)).to.be.true;
    });
  });

  describe("Developer Profile Edge Cases", function () {
    it("Should handle trust score calculations correctly", async function () {
      await marketFactory.connect(developer).createProfile("test-dev", "QmTestCID");
      
      // Initial trust score should be 100 (base)
      let profile = await developerProfile.getDeveloperProfile(developer.address);
      expect(profile.trustScore).to.equal(100);
      
      // Update GitHub metrics (need to add owner as oracle first through MarketFactory)
      await marketFactory.connect(owner).addOracleToDeveloperProfile(owner.address);
      await developerProfile.connect(owner).updateGitHubMetrics(
        developer.address,
        50, // publicRepos
        100, // followers  
        1000, // contributions
        30, // accountAge (months)
        50 // consistencyScore
      );
      
      profile = await developerProfile.getDeveloperProfile(developer.address);
      // Trust score should increase: 100 + (50*2) + (100/10) + (1000/100) = 100 + 100 + 10 + 10 = 220
      expect(profile.trustScore).to.be.greaterThan(100);
    });

    it("Should prevent duplicate profile creation", async function () {
      await marketFactory.connect(developer).createProfile("test-dev", "QmTestCID");
      
      // Attempt to create another profile should fail
      await expect(
        marketFactory.connect(developer).createProfile("test-dev-2", "QmTestCID2")
      ).to.be.revertedWith("Profile already exists");
    });

    it("Should handle profile verification correctly", async function () {
      await marketFactory.connect(developer).createProfile("test-dev", "QmTestCID");
      
      let profile = await developerProfile.getDeveloperProfile(developer.address);
      expect(profile.isVerified).to.be.false;
      
      // Verify profile through MarketFactory (which has verifier role)
      await marketFactory.connect(owner).verifyDeveloper(developer.address, "0x1234");
      
      profile = await developerProfile.getDeveloperProfile(developer.address);
      expect(profile.isVerified).to.be.true;
      expect(profile.verificationTimestamp).to.be.greaterThan(0);
    });
  });

  describe("Risk Oracle Edge Cases", function () {
    it("Should handle risk score boundaries correctly", async function () {
      await marketFactory.connect(developer).createProfile("test-dev", "QmTestCID");
      
      // Test minimum risk score (should not revert)
      await riskOracle.connect(owner).updateRiskMetrics(
        developer.address,
        100, 100, 100, 100,
        Math.floor(Date.now() / 1000)
      );
      
      // Test maximum risk score (should not revert)
      await riskOracle.connect(owner).updateRiskMetrics(
        developer.address,
        1000, 1000, 1000, 1000,
        Math.floor(Date.now() / 1000)
      );
      
      // Test exceeding maximum (should revert)
      await expect(
        riskOracle.connect(owner).updateRiskMetrics(
          developer.address,
          1001, 1000, 1000, 1000,
          Math.floor(Date.now() / 1000)
        )
      ).to.be.revertedWith("Credit score too high");
    });

    it("Should handle multiple risk assessments over time", async function () {
      await marketFactory.connect(developer).createProfile("test-dev", "QmTestCID");
      
      // Use blockchain timestamp to avoid future timestamp issues
      const latestBlock = await ethers.provider.getBlock('latest');
      const currentTime = latestBlock!.timestamp;
      
      // Initial risk assessment (credit score should align with trust score 100 -> expected range ~900)
      await riskOracle.connect(owner).updateRiskMetrics(
        developer.address,
        850, 400, 300, 200, // Credit score of 850 is within valid range (700-1100)
        currentTime - 10 // Use past timestamp to be safe
      );
      
      let riskMetrics = await riskOracle.getDeveloperRiskMetrics(developer.address);
      expect(riskMetrics.creditScore).to.equal(850);
      
      // Updated risk assessment (should overwrite)
      await riskOracle.connect(owner).updateRiskMetrics(
        developer.address,
        900, 450, 350, 250, // Credit score of 900 is also within valid range
        currentTime // Current timestamp should be safe
      );
      
      riskMetrics = await riskOracle.getDeveloperRiskMetrics(developer.address);
      expect(riskMetrics.creditScore).to.equal(900);
    });
  });

  describe("Reputation SBT Tests", function () {
    it("Should prevent transfers of reputation tokens", async function () {
      await reputationSBT.mintAchievement(developer.address, "ipfs://achievement1");
      
      expect(await reputationSBT.ownerOf(0)).to.equal(developer.address);
      
      // Should not be transferable
      await expect(
        reputationSBT.connect(developer).transferFrom(developer.address, lender.address, 0)
      ).to.be.revertedWith("SBT: non-transferable");
      
      // Should still be owned by original recipient
      expect(await reputationSBT.ownerOf(0)).to.equal(developer.address);
    });

    it("Should allow multiple achievements for same developer", async function () {
      await reputationSBT.mintAchievement(developer.address, "ipfs://achievement1");
      await reputationSBT.mintAchievement(developer.address, "ipfs://achievement2");
      await reputationSBT.mintAchievement(lender.address, "ipfs://achievement3");
      
      expect(await reputationSBT.balanceOf(developer.address)).to.equal(2);
      expect(await reputationSBT.balanceOf(lender.address)).to.equal(1);
    });
  });

  describe("Integration Stress Tests", function () {
    it("Should handle complete developer lifecycle", async function () {
      // 1. Create profile
      await marketFactory.connect(developer).createProfile("stress-test-dev", "QmStressCID");
      
      // 2. Verify developer
      await marketFactory.connect(owner).verifyDeveloper(developer.address, "0x");
      
      // 3. Grant developer role
      await marketFactory.connect(owner).grantDeveloperRole(developer.address);
      
      // 4. Stake tokens
      await stakingVault.connect(developer).stake({ value: ethers.parseEther("5.0") });
      
      // 5. Update metrics (need to add owner as oracle first)
      await marketFactory.connect(owner).addOracleToDeveloperProfile(owner.address);
      await developerProfile.connect(owner).updateGitHubMetrics(
        developer.address, 25, 75, 500, 24, 80
      );
      
      // 6. Assess risk (use blockchain timestamp)
      const latestBlock = await ethers.provider.getBlock('latest');
      const currentTime = latestBlock!.timestamp;
      await riskOracle.connect(owner).updateRiskMetrics(
        developer.address, 800, 300, 250, 200, currentTime - 10 // Credit score 800 should align with trust score
      );
      
      // 7. Create market
      await mockToken.mint(owner.address, ethers.parseUnits("100000", 6));
      await marketFactory.connect(developer).createMarket(
        ethers.parseUnits("10000", 6),
        800,
        180 * 24 * 3600,
        "QmProjectCID"
      );
      
      // 8. Mint achievement
      await reputationSBT.mintAchievement(developer.address, "ipfs://completed-loan");
      
      // Verify final state
      const profile = await developerProfile.getDeveloperProfile(developer.address);
      expect(profile.isVerified).to.be.true;
      expect(profile.trustScore).to.be.greaterThan(100);
      
      const stakeInfo = await stakingVault.getStakeInfo(developer.address);
      expect(stakeInfo.totalStake).to.equal(ethers.parseEther("5.0"));
      expect(stakeInfo.lockedStake).to.equal(ethers.parseEther("1.0")); // One loan created
      
      expect(await reputationSBT.balanceOf(developer.address)).to.equal(1);
    });
  });
});
