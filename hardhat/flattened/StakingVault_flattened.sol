// Sources flattened with hardhat v2.26.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/Context.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/staking/StakingVault.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


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