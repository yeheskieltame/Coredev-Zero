// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingVault is Ownable, ReentrancyGuard {
    mapping(address => uint256) public stakesOf;
    mapping(address => uint256) public lockedStakes; // Locked stakes for active loans
    mapping(address => uint256) public activeLoanCount; // Number of active loans per developer
    
    uint256 public totalStakedInVault;
    uint256 public constant MINIMUM_STAKE_PER_LOAN = 1 * 10**18; // 1 tCORE per loan
    uint256 public constant LOCK_DURATION = 7 days; // Grace period after loan completion
    
    mapping(address => uint256) public lastLoanEndTime; // Track when last loan ended
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event StakeLocked(address indexed user, uint256 amount, uint256 loanCount);
    event StakeUnlocked(address indexed user, uint256 amount, uint256 loanCount);

    mapping(address => bool) public authorizedContracts;

    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        stakesOf[msg.sender] += msg.value;
        totalStakedInVault += msg.value;
        emit Staked(msg.sender, msg.value);
    }
    
    function unstake(uint256 _amount) external nonReentrant {
        require(stakesOf[msg.sender] >= _amount, "Insufficient stake");
        require(getAvailableStake(msg.sender) >= _amount, "Cannot unstake locked funds");
        
        // Check grace period for recent loan completions
        if (lastLoanEndTime[msg.sender] > 0) {
            require(
                block.timestamp >= lastLoanEndTime[msg.sender] + LOCK_DURATION,
                "Grace period not ended"
            );
        }
        
        stakesOf[msg.sender] -= _amount;
        totalStakedInVault -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Unstaked(msg.sender, _amount);
    }
    
    function lockStakeForLoan(address developer, uint256 loanAmount) external onlyAuthorizedContract {
        require(stakesOf[developer] >= MINIMUM_STAKE_PER_LOAN, "Insufficient stake for loan");
        require(getAvailableStake(developer) >= MINIMUM_STAKE_PER_LOAN, "Not enough available stake");
        
        lockedStakes[developer] += MINIMUM_STAKE_PER_LOAN;
        activeLoanCount[developer] += 1;
        
        emit StakeLocked(developer, MINIMUM_STAKE_PER_LOAN, activeLoanCount[developer]);
    }
    
    function unlockStakeForLoan(address developer, bool isSuccessful) external onlyAuthorizedContract {
        require(activeLoanCount[developer] > 0, "No active loans");
        require(lockedStakes[developer] >= MINIMUM_STAKE_PER_LOAN, "No locked stake");
        
        if (isSuccessful) {
            // Successful loan - unlock stake
            lockedStakes[developer] -= MINIMUM_STAKE_PER_LOAN;
        } else {
            // Failed loan - slash stake
            uint256 slashAmount = MINIMUM_STAKE_PER_LOAN / 2; // 50% slash
            lockedStakes[developer] -= MINIMUM_STAKE_PER_LOAN;
            stakesOf[developer] -= slashAmount;
            totalStakedInVault -= slashAmount;
            // Slashed amount goes to insurance fund (could be sent to treasury)
        }
        
        activeLoanCount[developer] -= 1;
        lastLoanEndTime[developer] = block.timestamp;
        
        emit StakeUnlocked(developer, MINIMUM_STAKE_PER_LOAN, activeLoanCount[developer]);
    }
    
    function getAvailableStake(address developer) public view returns (uint256) {
        return stakesOf[developer] - lockedStakes[developer];
    }
    
    function canCreateLoan(address developer) external view returns (bool) {
        return getAvailableStake(developer) >= MINIMUM_STAKE_PER_LOAN;
    }
    
    function getStakeInfo(address developer) external view returns (
        uint256 totalStake,
        uint256 lockedStake,
        uint256 availableStake,
        uint256 activeLoans,
        uint256 lastLoanEnd
    ) {
        totalStake = stakesOf[developer];
        lockedStake = lockedStakes[developer];
        availableStake = getAvailableStake(developer);
        activeLoans = activeLoanCount[developer];
        lastLoanEnd = lastLoanEndTime[developer];
    }
    
    // Admin functions
    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        // In production, this should be immutable or governed by DAO
    }
    
    function emergencyUnlockStake(address developer) external onlyOwner {
        lockedStakes[developer] = 0;
        activeLoanCount[developer] = 0;
    }
    
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }
    
    function unauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }
}