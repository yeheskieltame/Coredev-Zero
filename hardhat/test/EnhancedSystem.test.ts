import { expect } from "chai";
import { ethers } from "hardhat";
import { DeveloperProfile, RiskAssessmentOracle, GitHubVerificationOracle, MockToken, MarketFactory } from "../typechain-types";

describe("CoreDev Zero Enhanced System", function () {
  let developerProfile: DeveloperProfile;
  let riskOracle: RiskAssessmentOracle;
  let githubOracle: GitHubVerificationOracle;
  let mockUSDT: MockToken;
  let marketFactory: MarketFactory;
  let owner: any;
  let developer: any;
  let lender: any;

  beforeEach(async function () {
    [owner, developer, lender] = await ethers.getSigners();

    // Deploy DeveloperProfile
    const DeveloperProfile = await ethers.getContractFactory("DeveloperProfile");
    developerProfile = await DeveloperProfile.deploy();

    // Deploy RiskAssessmentOracle
    const RiskAssessmentOracle = await ethers.getContractFactory("RiskAssessmentOracle");
    riskOracle = await RiskAssessmentOracle.deploy(await developerProfile.getAddress());

    // Deploy GitHubVerificationOracle
    const GitHubVerificationOracle = await ethers.getContractFactory("GitHubVerificationOracle");
    githubOracle = await GitHubVerificationOracle.deploy(await developerProfile.getAddress());

    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    mockUSDT = await MockToken.deploy("Staked USDT", "sUSDT", 6);

    // Deploy ReputationSBT (will be owned by MarketFactory)
    const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
    const reputationSBT = await ReputationSBT.deploy(owner.address);

    // Deploy StakingVault
    const StakingVault = await ethers.getContractFactory("StakingVault");
    const stakingVault = await StakingVault.deploy(owner.address);

    // Deploy MarketFactory
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    marketFactory = await MarketFactory.deploy(
      await mockUSDT.getAddress(),
      await reputationSBT.getAddress(),
      await stakingVault.getAddress()
    );

    // Transfer ownership of ReputationSBT to MarketFactory after deployment
    await reputationSBT.transferOwnership(await marketFactory.getAddress());

    // Setup permissions
    await developerProfile.addOracle(owner.address);
    await developerProfile.addVerifier(owner.address);
  });

  describe("DeveloperProfile", function () {
    it("Should create a developer profile", async function () {
      await developerProfile.connect(developer).createProfile("test-dev", "QmTestCID");
      
      const profile = await developerProfile.getDeveloperProfile(developer.address);
      expect(profile.githubHandle).to.equal("test-dev");
      expect(profile.trustScore).to.equal(100); // Base trust score
      expect(profile.isActive).to.be.true;
    });

    it("Should update GitHub metrics and recalculate trust score", async function () {
      // Create profile first
      await developerProfile.connect(developer).createProfile("test-dev", "QmTestCID");
      
      // Update GitHub metrics
      await developerProfile.updateGitHubMetrics(
        developer.address,
        10, // publicRepos
        50, // followers
        500, // totalCommits
        100, // totalStars
        365  // accountAge in days
      );

      const profile = await developerProfile.getDeveloperProfile(developer.address);
      const githubMetrics = await developerProfile.getGitHubMetrics(developer.address);
      
      expect(githubMetrics.publicRepos).to.equal(10);
      expect(githubMetrics.followers).to.equal(50);
      expect(profile.trustScore).to.be.greaterThan(100); // Should increase with GitHub metrics
    });

    it("Should verify developer profile", async function () {
      await developerProfile.connect(developer).createProfile("test-dev", "QmTestCID");
      
      await developerProfile.verifyProfile(developer.address, "0x");
      
      const profile = await developerProfile.getDeveloperProfile(developer.address);
      expect(profile.isVerified).to.be.true;
    });
  });

  describe("RiskAssessmentOracle", function () {
    it("Should assess developer risk", async function () {
      // Create and verify profile
      await developerProfile.connect(developer).createProfile("test-dev", "QmTestCID");
      await developerProfile.verifyProfile(developer.address, "0x");
      
      const riskScore = await riskOracle.assessDeveloperRisk(developer.address);
      expect(riskScore).to.be.greaterThan(0);
      expect(riskScore).to.be.lessThanOrEqual(1000);
    });

    it("Should calculate suggested interest rate", async function () {
      await developerProfile.connect(developer).createProfile("test-dev", "QmTestCID");
      
      const suggestedRate = await riskOracle.calculateSuggestedInterestRate(developer.address);
      expect(suggestedRate).to.be.greaterThan(0);
    });

    it("Should update risk metrics", async function () {
      await developerProfile.connect(developer).createProfile("test-dev", "QmTestCID");
      
      await riskOracle.updateRiskMetricsSimple(
        developer.address,
        300, // creditScore
        200, // volatilityScore
        150, // liquidityRisk
        100  // marketRisk
      );

      const riskMetrics = await riskOracle.getDeveloperRiskMetrics(developer.address);
      expect(riskMetrics.creditScore).to.equal(300);
      expect(riskMetrics.isActive).to.be.true;
    });
  });

  describe("GitHubVerificationOracle", function () {
    it("Should request GitHub verification", async function () {
      await githubOracle.connect(developer).requestVerification("test-github-handle");
      
      const pending = await githubOracle.getPendingVerification(developer.address);
      expect(pending.isActive).to.be.true;
      expect(pending.githubHandle).to.equal("test-github-handle");
    });

    it("Should check GitHub handle availability", async function () {
      const isAvailable = await githubOracle.isGitHubHandleAvailable("new-handle");
      expect(isAvailable).to.be.true;
    });
  });

  describe("Integration Tests", function () {
    it("Should complete full developer onboarding flow", async function () {
      // 1. Create profile
      await developerProfile.connect(developer).createProfile("test-dev", "QmTestCID");
      
      // 2. Update GitHub metrics
      await developerProfile.updateGitHubMetrics(
        developer.address,
        15, // publicRepos
        100, // followers
        1000, // totalCommits
        200, // totalStars
        730  // accountAge (2 years)
      );
      
      // 3. Verify profile
      await developerProfile.verifyProfile(developer.address, "0x");
      
      // 4. Check updated trust score
      const profile = await developerProfile.getDeveloperProfile(developer.address);
      expect(profile.isVerified).to.be.true;
      expect(profile.trustScore).to.be.greaterThan(200); // Should be significantly higher
      
      // 5. Assess risk
      const riskScore = await riskOracle.assessDeveloperRisk(developer.address);
      expect(riskScore).to.be.lessThan(800); // Lower risk due to good metrics
      
      // 6. Get suggested interest rate
      const rate = await riskOracle.calculateSuggestedInterestRate(developer.address);
      expect(rate).to.be.greaterThan(0);
      
      console.log(`Developer onboarded successfully:`);
      console.log(`- Trust Score: ${profile.trustScore}`);
      console.log(`- Risk Score: ${riskScore}`);
      console.log(`- Suggested Rate: ${rate} bps`);
    });
  });
});
