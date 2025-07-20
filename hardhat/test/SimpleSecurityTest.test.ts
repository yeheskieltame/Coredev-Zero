import { expect } from "chai";
import { ethers } from "hardhat";

describe("Simple Security Contracts Test", function () {
    it("Should deploy DefaultBlacklist", async function () {
        const DefaultBlacklist = await ethers.getContractFactory("DefaultBlacklist");
        const defaultBlacklist = await DefaultBlacklist.deploy();
        await defaultBlacklist.waitForDeployment();
        
        expect(await defaultBlacklist.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
    
    it("Should deploy ReputationStaking", async function () {
        // First deploy DefaultBlacklist
        const DefaultBlacklist = await ethers.getContractFactory("DefaultBlacklist");
        const defaultBlacklist = await DefaultBlacklist.deploy();
        await defaultBlacklist.waitForDeployment();
        
        // Then deploy ReputationStaking
        const ReputationStaking = await ethers.getContractFactory("ReputationStaking");
        const reputationStaking = await ReputationStaking.deploy(await defaultBlacklist.getAddress());
        await reputationStaking.waitForDeployment();
        
        expect(await reputationStaking.getAddress()).to.not.equal(ethers.ZeroAddress);
    });
});
