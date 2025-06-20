import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { StakingVault } from "../../typechain-types";
import { getTestUsers, TestConstants, expectRevert, increaseTime } from "../utils/testHelpersSimple";

describe("StakingVault", function () {
  async function deployStakingVaultFixture() {
    const users = await getTestUsers();
    
    const StakingVault = await ethers.getContractFactory("StakingVault");
    const stakingVault = await StakingVault.deploy(users.owner.address);
    await stakingVault.waitForDeployment();

    return { stakingVault, users };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      expect(await stakingVault.owner()).to.equal(users.owner.address);
    });

    it("Should initialize with zero total staked", async function () {
      const { stakingVault } = await loadFixture(deployStakingVaultFixture);
      expect(await stakingVault.totalStakedInVault()).to.equal(0);
    });

    it("Should set the correct minimum stake per loan", async function () {
      const { stakingVault } = await loadFixture(deployStakingVaultFixture);
      expect(await stakingVault.MINIMUM_STAKE_PER_LOAN()).to.equal(ethers.parseEther("1"));
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake ETH", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await expect(
        stakingVault.connect(users.developer).stake({ value: stakeAmount })
      ).to.emit(stakingVault, "Staked")
        .withArgs(users.developer.address, stakeAmount);

      expect(await stakingVault.stakesOf(users.developer.address)).to.equal(stakeAmount);
      expect(await stakingVault.totalStakedInVault()).to.equal(stakeAmount);
    });

    it("Should revert when trying to stake zero amount", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);

      await expectRevert(
        stakingVault.connect(users.developer).stake({ value: 0 })
      );
    });

    it("Should allow multiple stakes from same user", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = ethers.parseEther("500");

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });
      await stakingVault.connect(users.developer).stake({ value: stakeAmount });

      expect(await stakingVault.stakesOf(users.developer.address)).to.equal(ethers.parseEther("1000"));
      expect(await stakingVault.totalStakedInVault()).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Unstaking", function () {
    async function deployWithStakedFixture() {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });

      return { stakingVault, users, stakeAmount };
    }

    it("Should allow users to unstake their funds", async function () {
      const { stakingVault, users, stakeAmount } = await loadFixture(deployWithStakedFixture);
      const unstakeAmount = ethers.parseEther("500");

      await expect(
        stakingVault.connect(users.developer).unstake(unstakeAmount)
      ).to.emit(stakingVault, "Unstaked")
        .withArgs(users.developer.address, unstakeAmount);

      expect(await stakingVault.stakesOf(users.developer.address)).to.equal(stakeAmount - unstakeAmount);
    });

    it("Should revert when trying to unstake more than staked", async function () {
      const { stakingVault, users } = await loadFixture(deployWithStakedFixture);
      const excessiveAmount = ethers.parseEther("2000");

      await expectRevert(
        stakingVault.connect(users.developer).unstake(excessiveAmount)
      );
    });

    it("Should revert when trying to unstake without any stake", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);

      await expectRevert(
        stakingVault.connect(users.user1).unstake(ethers.parseEther("100"))
      );
    });
  });

  describe("Stake Locking", function () {
    async function deployWithAuthorizedFixture() {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });
      
      // Authorize a contract to lock stakes
      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);

      return { stakingVault, users, stakeAmount };
    }

    it("Should allow authorized contracts to lock stakes", async function () {
      const { stakingVault, users } = await loadFixture(deployWithAuthorizedFixture);
      const loanAmount = TestConstants.LOAN_AMOUNT;

      await expect(
        stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, loanAmount)
      ).to.emit(stakingVault, "StakeLocked")
        .withArgs(users.developer.address, ethers.parseEther("1"), 1);

      expect(await stakingVault.lockedStakes(users.developer.address)).to.equal(ethers.parseEther("1"));
      expect(await stakingVault.activeLoanCount(users.developer.address)).to.equal(1);
    });

    it("Should prevent unauthorized addresses from locking stakes", async function () {
      const { stakingVault, users } = await loadFixture(deployWithAuthorizedFixture);
      const loanAmount = TestConstants.LOAN_AMOUNT;

      await expectRevert(
        stakingVault.connect(users.user1).lockStakeForLoan(users.developer.address, loanAmount)
      );
    });

    it("Should prevent locking when insufficient stake", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const smallStake = ethers.parseEther("0.5");
      
      await stakingVault.connect(users.developer).stake({ value: smallStake });
      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);

      await expectRevert(
        stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, TestConstants.LOAN_AMOUNT)
      );
    });

    it("Should prevent unstaking when funds are locked", async function () {
      const { stakingVault, users, stakeAmount } = await loadFixture(deployWithAuthorizedFixture);

      await stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, TestConstants.LOAN_AMOUNT);

      await expectRevert(
        stakingVault.connect(users.developer).unstake(stakeAmount)
      );
    });
  });

  describe("Stake Unlocking", function () {
    async function deployWithLockedStakeFixture() {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });
      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);
      await stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, TestConstants.LOAN_AMOUNT);

      return { stakingVault, users, stakeAmount };
    }

    it("Should allow authorized contracts to unlock stakes successfully", async function () {
      const { stakingVault, users } = await loadFixture(deployWithLockedStakeFixture);

      await expect(
        stakingVault.connect(users.admin).unlockStakeForLoan(users.developer.address, true)
      ).to.emit(stakingVault, "StakeUnlocked")
        .withArgs(users.developer.address, ethers.parseEther("1"), 0);

      expect(await stakingVault.lockedStakes(users.developer.address)).to.equal(0);
      expect(await stakingVault.activeLoanCount(users.developer.address)).to.equal(0);
    });

    it("Should slash stake on failed loan", async function () {
      const { stakingVault, users, stakeAmount } = await loadFixture(deployWithLockedStakeFixture);
      const slashAmount = ethers.parseEther("0.5"); // 50% of minimum stake

      await expect(
        stakingVault.connect(users.admin).unlockStakeForLoan(users.developer.address, false)
      ).to.emit(stakingVault, "StakeUnlocked");

      expect(await stakingVault.stakesOf(users.developer.address)).to.equal(stakeAmount - slashAmount);
      expect(await stakingVault.lockedStakes(users.developer.address)).to.equal(0);
    });

    it("Should prevent unlocking without active loans", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);

      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);

      await expectRevert(
        stakingVault.connect(users.admin).unlockStakeForLoan(users.developer.address, true)
      );
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to authorize contracts", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);

      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);
      expect(await stakingVault.authorizedContracts(users.admin.address)).to.be.true;
    });

    it("Should allow owner to revoke contract authorization", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);

      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);
      await stakingVault.connect(users.owner).unauthorizeContract(users.admin.address);
      
      expect(await stakingVault.authorizedContracts(users.admin.address)).to.be.false;
    });

    it("Should prevent non-owners from authorizing contracts", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);

      await expectRevert(
        stakingVault.connect(users.user1).authorizeContract(users.admin.address)
      );
    });

    it("Should allow emergency unlock by owner", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });
      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);
      await stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, ethers.parseEther("500"));

      await stakingVault.connect(users.owner).emergencyUnlockStake(users.developer.address);

      expect(await stakingVault.lockedStakes(users.developer.address)).to.equal(0);
      expect(await stakingVault.activeLoanCount(users.developer.address)).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return correct available stake", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });
      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);
      await stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, TestConstants.LOAN_AMOUNT);

      const availableStake = await stakingVault.getAvailableStake(users.developer.address);
      expect(availableStake).to.equal(stakeAmount - ethers.parseEther("1"));
    });

    it("Should return true when developer can create loan", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });

      const canCreateLoan = await stakingVault.canCreateLoan(users.developer.address);
      expect(canCreateLoan).to.be.true;
    });

    it("Should return false when developer has insufficient stake", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const insufficientStake = ethers.parseEther("0.5");

      await stakingVault.connect(users.developer).stake({ value: insufficientStake });

      const canCreateLoan = await stakingVault.canCreateLoan(users.developer.address);
      expect(canCreateLoan).to.be.false;
    });

    it("Should return complete stake info", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });
      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);
      await stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, TestConstants.LOAN_AMOUNT);

      const stakeInfo = await stakingVault.getStakeInfo(users.developer.address);
      
      expect(stakeInfo.totalStake).to.equal(stakeAmount);
      expect(stakeInfo.lockedStake).to.equal(ethers.parseEther("1"));
      expect(stakeInfo.availableStake).to.equal(stakeAmount - ethers.parseEther("1"));
      expect(stakeInfo.activeLoans).to.equal(1);
    });
  });

  describe("Grace Period", function () {
    it("Should enforce grace period after loan completion", async function () {
      const { stakingVault, users } = await loadFixture(deployStakingVaultFixture);
      const stakeAmount = TestConstants.MINIMUM_STAKE;

      await stakingVault.connect(users.developer).stake({ value: stakeAmount });
      await stakingVault.connect(users.owner).authorizeContract(users.admin.address);
      
      // Lock and then unlock stake to simulate loan completion
      await stakingVault.connect(users.admin).lockStakeForLoan(users.developer.address, TestConstants.LOAN_AMOUNT);
      await stakingVault.connect(users.admin).unlockStakeForLoan(users.developer.address, true);
      
      // Try to unstake immediately (should fail due to grace period)
      await expectRevert(
        stakingVault.connect(users.developer).unstake(ethers.parseEther("100"))
      );

      // Fast forward through grace period
      await increaseTime(7 * 24 * 60 * 60 + 1); // 7 days + 1 second

      // Should now be able to unstake
      await stakingVault.connect(users.developer).unstake(ethers.parseEther("100"));
    });
  });
});
