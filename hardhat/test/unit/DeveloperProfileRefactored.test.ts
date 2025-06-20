import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { DeveloperProfileRefactored } from "../../typechain-types";
import { getTestUsers, TestConstants, expectRevert, expectRevertWith } from "../utils/testHelpersSimple";

describe("DeveloperProfileRefactored", function () {
  async function deployDeveloperProfileFixture() {
    const users = await getTestUsers();

    const DeveloperProfile = await hre.ethers.getContractFactory("DeveloperProfileRefactored");
    const developerProfile = await DeveloperProfile.deploy();
    await developerProfile.waitForDeployment();

    return { developerProfile, users };
  }

  async function createProfileFixture() {
    const base = await loadFixture(deployDeveloperProfileFixture);
    
    await base.developerProfile.connect(base.users.developer).createProfile(
      "testdev",
      "QmTestProfileCID"
    );

    return base;
  }

  async function verifiedProfileFixture() {
    const base = await loadFixture(createProfileFixture);
    
    // Add developer as verifier
    await base.developerProfile.connect(base.users.owner).addVerifier(base.users.owner.address);
    
    // Verify profile
    await base.developerProfile.connect(base.users.owner).verifyProfile(
      base.users.developer.address,
      "0x"
    );

    return base;
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { developerProfile } = await loadFixture(deployDeveloperProfileFixture);
      expect(await developerProfile.getAddress()).to.not.equal(hre.ethers.ZeroAddress);
    });

    it("Should initialize with zero profiles", async function () {
      const { developerProfile } = await loadFixture(deployDeveloperProfileFixture);
      expect(await developerProfile.getTotalDevelopers()).to.equal(0);
    });
  });

  describe("Profile Creation", function () {
    it("Should allow creating a developer profile", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await developerProfile.connect(users.developer).createProfile(
        "testdev",
        "QmTestProfileCID"
      );

      const profile = await developerProfile.getDeveloperProfile(users.developer.address);
      expect(profile.githubHandle).to.equal("testdev");
      expect(profile.profileDataCID).to.equal("QmTestProfileCID");
      expect(profile.isVerified).to.be.false;
      expect(profile.isActive).to.be.true;
    });

    it("Should prevent creating duplicate profiles", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      await expectRevert(
        developerProfile.connect(users.developer).createProfile(
          "testdev2",
          "QmTestProfileCID2"
        )
      );
    });

    it("Should prevent creating profile with empty GitHub handle", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await expectRevert(
        developerProfile.connect(users.developer).createProfile(
          "",
          "QmTestProfileCID"
        )
      );
    });

    it("Should prevent creating profile with empty profile data", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await expectRevert(
        developerProfile.connect(users.developer).createProfile(
          "testdev",
          ""
        )
      );
    });

    it("Should initialize profile with default metrics", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      const profile = await developerProfile.getDeveloperProfile(users.developer.address);
      expect(profile.trustScore).to.be.greaterThan(0);
      expect(profile.completedProjects).to.equal(0);
      expect(profile.totalLoans).to.equal(0);
      expect(profile.successfulLoans).to.equal(0);
      expect(profile.totalBorrowed).to.equal(0);
      expect(profile.totalRepaid).to.equal(0);
    });
  });

  describe("Profile Verification", function () {
    it("Should allow verifier to verify profile", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      // Add verifier
      await developerProfile.connect(users.owner).addVerifier(users.owner.address);

      await developerProfile.connect(users.owner).verifyProfile(
        users.developer.address,
        "0x"
      );

      const profile = await developerProfile.getDeveloperProfile(users.developer.address);
      expect(profile.isVerified).to.be.true;
      expect(profile.verificationTimestamp).to.be.greaterThan(0);
    });

    it("Should prevent non-verifier from verifying profile", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      await expectRevert(
        developerProfile.connect(users.user1).verifyProfile(
          users.developer.address,
          "0x"
        )
      );
    });

    it("Should prevent verifying non-existent profile", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      // Add verifier
      await developerProfile.connect(users.owner).addVerifier(users.owner.address);

      await expectRevert(
        developerProfile.connect(users.owner).verifyProfile(
          users.user1.address,
          "0x"
        )
      );
    });

    it("Should prevent verifying already verified profile", async function () {
      const { developerProfile, users } = await loadFixture(verifiedProfileFixture);

      await expectRevert(
        developerProfile.connect(users.owner).verifyProfile(
          users.developer.address,
          "0x"
        )
      );
    });
  });

  describe("GitHub Metrics Updates", function () {
    it("Should allow oracle to update GitHub metrics", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      // Add oracle
      await developerProfile.connect(users.owner).addOracle(users.owner.address);

      const newMetrics = {
        publicRepos: 10,
        followers: 50,
        contributions: 500,
        accountAge: 24,
        consistencyScore: 85
      };

      await developerProfile.connect(users.owner).updateGitHubMetrics(
        users.developer.address,
        newMetrics.publicRepos,
        newMetrics.followers,
        newMetrics.contributions,
        newMetrics.accountAge,
        newMetrics.consistencyScore
      );

      const metrics = await developerProfile.getGitHubMetrics(users.developer.address);
      expect(metrics.publicRepos).to.equal(newMetrics.publicRepos);
      expect(metrics.followers).to.equal(newMetrics.followers);
      expect(metrics.totalContributions).to.equal(newMetrics.contributions);
      expect(metrics.accountAgeMonths).to.equal(newMetrics.accountAge);
      expect(metrics.consistencyScore).to.equal(newMetrics.consistencyScore);
    });

    it("Should prevent non-oracle from updating GitHub metrics", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      await expectRevert(
        developerProfile.connect(users.user1).updateGitHubMetrics(
          users.developer.address,
          10, 50, 500, 24, 85
        )
      );
    });

    it("Should update trust score when GitHub metrics change", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      // Add oracle
      await developerProfile.connect(users.owner).addOracle(users.owner.address);

      const oldProfile = await developerProfile.getDeveloperProfile(users.developer.address);
      const oldTrustScore = oldProfile.trustScore;

      await developerProfile.connect(users.owner).updateGitHubMetrics(
        users.developer.address,
        10, 50, 500, 24, 85
      );

      const newProfile = await developerProfile.getDeveloperProfile(users.developer.address);
      expect(newProfile.trustScore).to.not.equal(oldTrustScore);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to add oracle", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await developerProfile.connect(users.owner).addOracle(users.user1.address);

      expect(await developerProfile.isAuthorizedOracle(users.user1.address)).to.be.true;
    });

    it("Should allow owner to remove oracle", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await developerProfile.connect(users.owner).addOracle(users.user1.address);
      
      await developerProfile.connect(users.owner).removeOracle(users.user1.address);

      expect(await developerProfile.isAuthorizedOracle(users.user1.address)).to.be.false;
    });

    it("Should allow owner to add verifier", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await developerProfile.connect(users.owner).addVerifier(users.user1.address);

      expect(await developerProfile.isAuthorizedVerifier(users.user1.address)).to.be.true;
    });

    it("Should allow owner to remove verifier", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await developerProfile.connect(users.owner).addVerifier(users.user1.address);
      
      await developerProfile.connect(users.owner).removeVerifier(users.user1.address);

      expect(await developerProfile.isAuthorizedVerifier(users.user1.address)).to.be.false;
    });

    it("Should prevent non-owner from adding oracle", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await expectRevert(
        developerProfile.connect(users.user1).addOracle(users.user2.address)
      );
    });
  });

  describe("View Functions", function () {
    it("Should return correct total developers count", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      expect(await developerProfile.getTotalDevelopers()).to.equal(0);

      await developerProfile.connect(users.developer).createProfile("dev1", "QmCID1");
      expect(await developerProfile.getTotalDevelopers()).to.equal(1);

      await developerProfile.connect(users.user1).createProfile("dev2", "QmCID2");
      expect(await developerProfile.getTotalDevelopers()).to.equal(2);
    });

    it("Should return correct developer by index", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      await developerProfile.connect(users.developer).createProfile("dev1", "QmCID1");
      await developerProfile.connect(users.user1).createProfile("dev2", "QmCID2");

      expect(await developerProfile.getDeveloperByIndex(0)).to.equal(users.developer.address);
      expect(await developerProfile.getDeveloperByIndex(1)).to.equal(users.user1.address);
    });

    it("Should check GitHub handle availability", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      expect(await developerProfile.isGitHubHandleAvailable("testdev")).to.be.true;

      await developerProfile.connect(users.developer).createProfile("testdev", "QmCID");

      expect(await developerProfile.isGitHubHandleAvailable("testdev")).to.be.false;
      expect(await developerProfile.isGitHubHandleAvailable("anotherdev")).to.be.true;
    });

    it("Should calculate trust score correctly", async function () {
      const { developerProfile, users } = await loadFixture(createProfileFixture);

      const trustScore = await developerProfile.calculateTrustScore(users.developer.address);
      expect(trustScore).to.be.greaterThan(0);
      expect(trustScore).to.be.lessThanOrEqual(1000);
    });
  });

  describe("Error Handling", function () {
    it("Should handle non-existent profile queries gracefully", async function () {
      const { developerProfile, users } = await loadFixture(deployDeveloperProfileFixture);

      const profile = await developerProfile.getDeveloperProfile(users.user1.address);
      expect(profile.githubHandle).to.equal("");
      expect(profile.isActive).to.be.false;
    });

    it("Should handle out of bounds index queries", async function () {
      const { developerProfile } = await loadFixture(deployDeveloperProfileFixture);

      await expect(
        developerProfile.getDeveloperByIndex(0)
      ).to.be.revertedWith("Index out of bounds");
    });
  });
});
