import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { RiskAssessmentOracleRefactored, DeveloperProfile } from "../../typechain-types";
import { getTestUsers, TestConstants, expectRevert, increaseTime } from "../utils/testHelpersSimple";

describe("RiskAssessmentOracleRefactored", function () {
  async function deployRiskOracleFixture() {
    const users = await getTestUsers();

    // First deploy DeveloperProfile
    const DeveloperProfile = await ethers.getContractFactory("DeveloperProfile");
    const developerProfile = await DeveloperProfile.deploy();
    await developerProfile.waitForDeployment();

    // Deploy MultiSigGovernance library first
    const MultiSigGovernance = await ethers.getContractFactory("MultiSigGovernance");
    const multiSigGovernance = await MultiSigGovernance.deploy();
    await multiSigGovernance.waitForDeployment();

    const RiskOracle = await ethers.getContractFactory("RiskAssessmentOracleRefactored", {
      libraries: {
        MultiSigGovernance: await multiSigGovernance.getAddress(),
      },
    });
    const riskOracle = await RiskOracle.deploy(await developerProfile.getAddress());
    await riskOracle.waitForDeployment();

    return { riskOracle, developerProfile, users };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { riskOracle } = await loadFixture(deployRiskOracleFixture);
      expect(await riskOracle.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should set correct owner", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);
      expect(await riskOracle.owner()).to.equal(users.owner.address);
    });
  });

  describe("Updater Management", function () {
    it("Should allow owner to authorize updater", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      await riskOracle.connect(users.owner).authorizeUpdater(users.user1.address);
      expect(await riskOracle.isAuthorizedUpdater(users.user1.address)).to.be.true;
    });

    it("Should allow owner to revoke updater", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      await riskOracle.connect(users.owner).authorizeUpdater(users.user1.address);
      await riskOracle.connect(users.owner).revokeUpdater(users.user1.address);
      
      expect(await riskOracle.isAuthorizedUpdater(users.user1.address)).to.be.false;
    });

    it("Should prevent non-owner from authorizing updater", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      await expectRevert(
        riskOracle.connect(users.user1).authorizeUpdater(users.user2.address)
      );
    });
  });

  describe("Governor Management", function () {
    it("Should allow owner to add governor", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      await riskOracle.connect(users.owner).addGovernor(users.user1.address);
      expect(await riskOracle.isGovernor(users.user1.address)).to.be.true;
    });

    it("Should allow owner to remove governor", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      await riskOracle.connect(users.owner).addGovernor(users.user1.address);
      await riskOracle.connect(users.owner).removeGovernor(users.user1.address);
      
      expect(await riskOracle.isGovernor(users.user1.address)).to.be.false;
    });
  });

  describe("Risk Assessment", function () {
    async function authorizedUpdaterFixture() {
      const base = await loadFixture(deployRiskOracleFixture);
      await base.riskOracle.connect(base.users.owner).authorizeUpdater(base.users.user1.address);
      
      // Create developer profile first to pass validation
      await base.developerProfile.connect(base.users.developer).createProfile(
        "testdev",
        "QmTestProfileCID"
      );
      
      return base;
    }

    it("Should allow authorized updater to update risk metrics", async function () {
      const { riskOracle, users } = await loadFixture(authorizedUpdaterFixture);

      const riskData = {
        creditScore: 750,
        volatilityScore: 300,
        liquidityScore: 600,
        marketScore: 400,
        overallRisk: 500,
        lastUpdated: Math.floor(Date.now() / 1000) - 100
      };

      await riskOracle.connect(users.user1).updateRiskMetrics(
        users.developer.address,
        riskData.creditScore,
        riskData.volatilityScore,
        riskData.liquidityScore,
        riskData.marketScore,
        riskData.lastUpdated
      );

      const metrics = await riskOracle.getDeveloperRiskMetrics(users.developer.address);
      expect(metrics.creditScore).to.equal(riskData.creditScore);
      expect(metrics.volatilityScore).to.equal(riskData.volatilityScore);
    });

    it("Should prevent unauthorized user from updating risk metrics", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      await expectRevert(
        riskOracle.connect(users.user1).updateRiskMetrics(
          users.developer.address,
          750, 300, 600, 400,
          Math.floor(Date.now() / 1000) - 100
        )
      );
    });

    it("Should calculate suggested interest rates", async function () {
      const { riskOracle, users } = await loadFixture(authorizedUpdaterFixture);

      // First update risk metrics
      await riskOracle.connect(users.user1).updateRiskMetrics(
        users.developer.address,
        750, 300, 600, 400,
        Math.floor(Date.now() / 1000) - 100
      );

      const suggestedRate = await riskOracle.calculateSuggestedRate(
        users.developer.address,
        ethers.parseEther("1000")
      );

      expect(suggestedRate).to.be.greaterThan(0);
    });
  });

  describe("View Functions", function () {
    it("Should return governance configuration", async function () {
      const { riskOracle } = await loadFixture(deployRiskOracleFixture);

      const config = await riskOracle.getGovernanceConfig();
      expect(config.requiredConfirmations).to.be.greaterThan(0);
      expect(config.proposalDuration).to.be.greaterThan(0);
    });

    it("Should check if address is authorized updater", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      expect(await riskOracle.isAuthorizedUpdater(users.user1.address)).to.be.false;
      
      await riskOracle.connect(users.owner).authorizeUpdater(users.user1.address);
      expect(await riskOracle.isAuthorizedUpdater(users.user1.address)).to.be.true;
    });

    it("Should check if address is governor", async function () {
      const { riskOracle, users } = await loadFixture(deployRiskOracleFixture);

      expect(await riskOracle.isGovernor(users.user1.address)).to.be.false;
      
      await riskOracle.connect(users.owner).addGovernor(users.user1.address);
      expect(await riskOracle.isGovernor(users.user1.address)).to.be.true;
    });
  });

  describe("Market Conditions", function () {
    it("Should have default market conditions", async function () {
      const { riskOracle } = await loadFixture(deployRiskOracleFixture);

      const conditions = await riskOracle.marketConditions();
      expect(conditions.baseRate).to.be.greaterThan(0);
      expect(conditions.riskPremium).to.be.greaterThan(0);
      expect(conditions.lastUpdated).to.be.greaterThan(0);
    });
  });
});
