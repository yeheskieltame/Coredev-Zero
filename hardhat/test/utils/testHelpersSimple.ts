import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export interface TestUsers {
  owner: SignerWithAddress;
  developer: SignerWithAddress;
  lender: SignerWithAddress;
  borrower: SignerWithAddress;
  oracle: SignerWithAddress;
  admin: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  user3: SignerWithAddress;
}

export async function getTestUsers(): Promise<TestUsers> {
  const [owner, developer, lender, borrower, oracle, admin, user1, user2, user3] = await ethers.getSigners();
  
  return {
    owner,
    developer,
    lender,
    borrower,
    oracle,
    admin,
    user1,
    user2,
    user3
  };
}

export const TestConstants = {
  MINIMUM_STAKE: ethers.parseEther("1000"),
  LOAN_AMOUNT: ethers.parseEther("1000"),
  INTEREST_RATE: 1000, // 10%
  TENOR_DAYS: 30,
  TENOR_SECONDS: 30 * 24 * 60 * 60,
  TRUST_SCORE_THRESHOLD: 100,
  RISK_SCORE_THRESHOLD: 500,
  GITHUB_METRICS: {
    repositories: 10,
    totalStars: 100,
    followers: 50,
    contributions: 200,
    accountAge: 365 * 2 // 2 years
  }
};

export function expectRevert(promise: Promise<any>) {
  return expect(promise).to.be.reverted;
}

export function expectRevertWith(promise: Promise<any>, expectedError: string) {
  return expect(promise).to.be.revertedWith(expectedError);
}

export async function increaseTime(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

export async function getCurrentTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  return block!.timestamp;
}

export async function deployMockToken() {
  const MockToken = await ethers.getContractFactory("MockToken");
  return await MockToken.deploy("Test Core Token", "tCORE", ethers.parseEther("1000000"));
}

export async function deployTestUSDT(owner: string) {
  const TestUSDT = await ethers.getContractFactory("Testnet_sUSDT");
  return await TestUSDT.deploy(owner);
}

export async function deployReputationSBT(owner: string) {
  const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
  return await ReputationSBT.deploy(owner);
}

export async function deployStakingVault(owner: string) {
  const StakingVault = await ethers.getContractFactory("StakingVault");
  return await StakingVault.deploy(owner);
}

export async function deployLoanPositionNFT() {
  const LoanPositionNFT = await ethers.getContractFactory("LoanPositionNFT");
  return await LoanPositionNFT.deploy();
}
