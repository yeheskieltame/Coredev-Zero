import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { ReputationSBT } from "../../typechain-types";
import { getTestUsers, expectRevert, deployReputationSBT } from "../utils/testHelpersSimple";

describe("ReputationSBT", function () {
  async function deployReputationSBTFixture() {
    const users = await getTestUsers();
    
    const reputationSBT = await deployReputationSBT(users.owner.address);
    await reputationSBT.waitForDeployment();

    return { reputationSBT, users };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { reputationSBT } = await loadFixture(deployReputationSBTFixture);
      
      expect(await reputationSBT.name()).to.equal("Devs Reputation");
      expect(await reputationSBT.symbol()).to.equal("dREP");
    });

    it("Should set the correct owner", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      expect(await reputationSBT.owner()).to.equal(users.owner.address);
    });

    it("Should start with zero tokens", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      expect(await reputationSBT.balanceOf(users.developer.address)).to.equal(0);
    });
  });

  describe("Minting Achievements", function () {
    it("Should allow owner to mint achievement tokens", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      const tokenURI = "ipfs://QmTestAchievement1";

      await expect(
        reputationSBT.connect(users.owner).mintAchievement(users.developer.address, tokenURI)
      ).to.emit(reputationSBT, "Transfer")
        .withArgs(ethers.ZeroAddress, users.developer.address, 0);

      expect(await reputationSBT.balanceOf(users.developer.address)).to.equal(1);
      expect(await reputationSBT.ownerOf(0)).to.equal(users.developer.address);
    });

    it("Should prevent non-owner from minting", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      const tokenURI = "ipfs://QmTestAchievement1";

      await expectRevert(
        reputationSBT.connect(users.user1).mintAchievement(users.developer.address, tokenURI)
      );
    });

    it("Should set correct token URI", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      const tokenURI = "ipfs://QmTestAchievement1";

      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, tokenURI);
      
      expect(await reputationSBT.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should allow multiple achievements for same developer", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      const tokenURI1 = "ipfs://QmTestAchievement1";
      const tokenURI2 = "ipfs://QmTestAchievement2";

      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, tokenURI1);
      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, tokenURI2);

      expect(await reputationSBT.balanceOf(users.developer.address)).to.equal(2);
      expect(await reputationSBT.ownerOf(0)).to.equal(users.developer.address);
      expect(await reputationSBT.ownerOf(1)).to.equal(users.developer.address);
    });

    it("Should increment token IDs correctly", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      const tokenURI = "ipfs://QmTestAchievement";

      const tokenId1 = await reputationSBT.connect(users.owner).mintAchievement.staticCall(
        users.developer.address, 
        tokenURI
      );
      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, tokenURI);

      const tokenId2 = await reputationSBT.connect(users.owner).mintAchievement.staticCall(
        users.user1.address, 
        tokenURI
      );
      await reputationSBT.connect(users.owner).mintAchievement(users.user1.address, tokenURI);

      expect(tokenId1).to.equal(0);
      expect(tokenId2).to.equal(1);
    });
  });

  describe("Soulbound Properties", function () {
    async function mintedTokenFixture() {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      const tokenURI = "ipfs://QmTestAchievement1";

      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, tokenURI);

      return { reputationSBT, users };
    }

    it("Should prevent transfers between addresses", async function () {
      const { reputationSBT, users } = await loadFixture(mintedTokenFixture);

      await expectRevert(
        reputationSBT.connect(users.developer).transferFrom(
          users.developer.address,
          users.user1.address,
          0
        )
      );
    });

    it("Should prevent safe transfers", async function () {
      const { reputationSBT, users } = await loadFixture(mintedTokenFixture);

      await expectRevert(
        reputationSBT.connect(users.developer)["safeTransferFrom(address,address,uint256)"](
          users.developer.address,
          users.user1.address,
          0
        )
      );
    });

    it("Should prevent approvals", async function () {
      const { reputationSBT, users } = await loadFixture(mintedTokenFixture);

      await expectRevert(
        reputationSBT.connect(users.developer).approve(users.user1.address, 0)
      );
    });

    it("Should prevent approval for all", async function () {
      const { reputationSBT, users } = await loadFixture(mintedTokenFixture);

      await expectRevert(
        reputationSBT.connect(users.developer).setApprovalForAll(users.user1.address, true)
      );
    });

    it("Should allow burning tokens", async function () {
      const { reputationSBT, users } = await loadFixture(mintedTokenFixture);

      await expect(
        reputationSBT.connect(users.developer).transferFrom(
          users.developer.address,
          ethers.ZeroAddress,
          0
        )
      ).to.emit(reputationSBT, "Transfer")
        .withArgs(users.developer.address, ethers.ZeroAddress, 0);

      expect(await reputationSBT.balanceOf(users.developer.address)).to.equal(0);

      await expectRevert(
        reputationSBT.ownerOf(0)
      );
    });
  });

  describe("Token Metadata", function () {
    it("Should handle non-existent token URI", async function () {
      const { reputationSBT } = await loadFixture(deployReputationSBTFixture);

      await expectRevert(
        reputationSBT.tokenURI(999)
      );
    });

    it("Should support ERC721 interface", async function () {
      const { reputationSBT } = await loadFixture(deployReputationSBTFixture);

      // ERC721 interface ID
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await reputationSBT.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it("Should support ERC721Metadata interface", async function () {
      const { reputationSBT } = await loadFixture(deployReputationSBTFixture);

      // ERC721Metadata interface ID
      const ERC721_METADATA_INTERFACE_ID = "0x5b5e139f";
      expect(await reputationSBT.supportsInterface(ERC721_METADATA_INTERFACE_ID)).to.be.true;
    });
  });

  describe("Achievement Categories", function () {
    it("Should mint different types of achievements", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      const achievements = [
        "ipfs://QmFirstLoan",      // First successful loan
        "ipfs://QmTenLoans",       // 10 successful loans
        "ipfs://QmHighTrust",      // High trust score
        "ipfs://QmVerified",       // Profile verification
        "ipfs://QmLongTerm"        // Long-term member
      ];

      for (let i = 0; i < achievements.length; i++) {
        await reputationSBT.connect(users.owner).mintAchievement(
          users.developer.address,
          achievements[i]
        );
      }

      expect(await reputationSBT.balanceOf(users.developer.address)).to.equal(achievements.length);

      // Verify each achievement has correct URI
      for (let i = 0; i < achievements.length; i++) {
        expect(await reputationSBT.tokenURI(i)).to.equal(achievements[i]);
      }
    });

    it("Should track total achievements across all developers", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      // Mint achievements for different developers
      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, "ipfs://Achievement1");
      await reputationSBT.connect(users.owner).mintAchievement(users.user1.address, "ipfs://Achievement2");
      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, "ipfs://Achievement3");

      expect(await reputationSBT.balanceOf(users.developer.address)).to.equal(2);
      expect(await reputationSBT.balanceOf(users.user1.address)).to.equal(1);
    });
  });

  describe("Owner Management", function () {
    it("Should allow owner to transfer ownership", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      await reputationSBT.connect(users.owner).transferOwnership(users.admin.address);
      expect(await reputationSBT.owner()).to.equal(users.admin.address);
    });

    it("Should allow new owner to mint achievements", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      await reputationSBT.connect(users.owner).transferOwnership(users.admin.address);
      
      await reputationSBT.connect(users.admin).mintAchievement(
        users.developer.address,
        "ipfs://NewOwnerAchievement"
      );

      expect(await reputationSBT.balanceOf(users.developer.address)).to.equal(1);
    });

    it("Should prevent old owner from minting after transfer", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      await reputationSBT.connect(users.owner).transferOwnership(users.admin.address);
      
      await expectRevert(
        reputationSBT.connect(users.owner).mintAchievement(
          users.developer.address,
          "ipfs://OldOwnerAttempt"
        )
      );
    });
  });

  describe("Edge Cases", function () {
    it("Should handle minting to zero address", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      await expectRevert(
        reputationSBT.connect(users.owner).mintAchievement(
          ethers.ZeroAddress,
          "ipfs://TestAchievement"
        )
      );
    });

    it("Should handle empty token URI", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, "");
      
      expect(await reputationSBT.tokenURI(0)).to.equal("");
    });

    it("Should handle very long token URI", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);
      const longURI = "ipfs://Qm" + "a".repeat(1000);

      await reputationSBT.connect(users.owner).mintAchievement(users.developer.address, longURI);
      
      expect(await reputationSBT.tokenURI(0)).to.equal(longURI);
    });

    it("Should handle balance queries for non-existent addresses gracefully", async function () {
      const { reputationSBT } = await loadFixture(deployReputationSBTFixture);

      expect(await reputationSBT.balanceOf(ethers.ZeroAddress)).to.equal(0);
    });
  });

  describe("Gas Optimization", function () {
    it("Should be gas efficient for multiple mints", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      // Test that minting multiple tokens doesn't increase gas significantly
      const tx1 = await reputationSBT.connect(users.owner).mintAchievement(
        users.developer.address,
        "ipfs://Achievement1"
      );
      const receipt1 = await tx1.wait();

      const tx2 = await reputationSBT.connect(users.owner).mintAchievement(
        users.developer.address,
        "ipfs://Achievement2"
      );
      const receipt2 = await tx2.wait();

      // Gas usage should be similar (allowing for some variance)
      const gasUsed1 = receipt1!.gasUsed;
      const gasUsed2 = receipt2!.gasUsed;
      
      expect(gasUsed2).to.be.closeTo(gasUsed1, gasUsed1 / 10n); // Within 10%
    });
  });

  describe("Events", function () {
    it("Should emit Transfer event on minting", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      await expect(
        reputationSBT.connect(users.owner).mintAchievement(
          users.developer.address,
          "ipfs://TestAchievement"
        )
      ).to.emit(reputationSBT, "Transfer")
        .withArgs(ethers.ZeroAddress, users.developer.address, 0);
    });

    it("Should emit Transfer event on burning", async function () {
      const { reputationSBT, users } = await loadFixture(deployReputationSBTFixture);

      await reputationSBT.connect(users.owner).mintAchievement(
        users.developer.address,
        "ipfs://TestAchievement"
      );

      await expect(
        reputationSBT.connect(users.developer).transferFrom(
          users.developer.address,
          ethers.ZeroAddress,
          0
        )
      ).to.emit(reputationSBT, "Transfer")
        .withArgs(users.developer.address, ethers.ZeroAddress, 0);
    });
  });
});
