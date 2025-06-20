// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IDeveloperProfile.sol";
import "../libraries/TrustScoreLibrary.sol";

/**
 * @title DeveloperProfileRefactored
 * @dev Refactored developer profile management for CoreDev Zero protocol
 * @notice Demonstrates clean, modular architecture for hackathon evaluation
 * 
 * Key Features:
 * - Developer profile creation and verification
 * - GitHub metrics integration and trust score calculation
 * - Loan history tracking and performance metrics
 * - Role-based access control for oracles and verifiers
 */
contract DeveloperProfileRefactored is IDeveloperProfile, Ownable, ReentrancyGuard {
    using TrustScoreLibrary for *;

    /// @dev Developer profiles storage
    mapping(address => Profile) public profiles;
    
    /// @dev GitHub metrics storage
    mapping(address => GitHubMetrics) public githubMetrics;
    
    /// @dev Authorized oracles that can update GitHub metrics
    mapping(address => bool) public authorizedOracles;
    
    /// @dev Authorized verifiers that can verify profiles
    mapping(address => bool) public authorizedVerifiers;
    
    /// @dev Track if a GitHub handle is already taken
    mapping(string => address) public githubHandleToAddress;
    
    /// @dev Track profile creation order for enumeration
    address[] public allDevelopers;
    mapping(address => uint256) public developerIndex;

    /// @dev Custom errors for better gas efficiency
    error ProfileAlreadyExists(address developer);
    error ProfileNotFound(address developer);
    error GitHubHandleTaken(string handle);
    error UnauthorizedOracle(address caller);
    error UnauthorizedVerifier(address caller);
    error InvalidGitHubMetrics();
    error AlreadyVerified(address developer);

    /// @dev Modifiers for access control
    modifier onlyOracle() {
        if (!authorizedOracles[msg.sender]) {
            revert UnauthorizedOracle(msg.sender);
        }
        _;
    }

    modifier onlyVerifier() {
        if (!authorizedVerifiers[msg.sender]) {
            revert UnauthorizedVerifier(msg.sender);
        }
        _;
    }

    modifier profileExists(address developer) {
        if (!profiles[developer].isActive) {
            revert ProfileNotFound(developer);
        }
        _;
    }

    /**
     * @notice Initialize the Developer Profile contract
     */
    constructor() Ownable(msg.sender) {
        // Add deployer as initial oracle and verifier
        authorizedOracles[msg.sender] = true;
        authorizedVerifiers[msg.sender] = true;
    }

    /**
     * @inheritdoc IDeveloperProfile
     */
    function createProfile(
        string calldata githubHandle,
        string calldata profileDataCID
    ) external override {
        _createProfile(msg.sender, githubHandle, profileDataCID);
    }

    /**
     * @inheritdoc IDeveloperProfile
     */
    function createProfileFor(
        address developer,
        string calldata githubHandle,
        string calldata profileDataCID
    ) external override onlyOwner {
        _createProfile(developer, githubHandle, profileDataCID);
    }

    /**
     * @inheritdoc IDeveloperProfile
     */
    function verifyProfile(
        address developer,
        bytes calldata proof
    ) external override onlyVerifier profileExists(developer) {
        Profile storage profile = profiles[developer];
        
        if (profile.isVerified) {
            revert AlreadyVerified(developer);
        }
        
        profile.isVerified = true;
        profile.verificationTimestamp = block.timestamp;
        
        // Recalculate trust score with verification bonus
        uint256 newTrustScore = TrustScoreLibrary.calculateOverallTrustScore(
            profile,
            githubMetrics[developer]
        );
        
        uint256 oldTrustScore = profile.trustScore;
        profile.trustScore = newTrustScore;
        
        emit ProfileVerified(developer, msg.sender);
        emit TrustScoreUpdated(developer, newTrustScore, oldTrustScore);
    }

    /**
     * @inheritdoc IDeveloperProfile
     */
    function updateGitHubMetrics(
        address developer,
        uint256 publicRepos,
        uint256 followers,
        uint256 contributions,
        uint256 accountAge,
        uint256 consistencyScore
    ) external override onlyOracle profileExists(developer) {
        // Validate GitHub metrics
        if (!TrustScoreLibrary.validateGitHubMetrics(
            publicRepos, followers, contributions, accountAge, consistencyScore
        )) {
            revert InvalidGitHubMetrics();
        }

        // Update GitHub metrics
        githubMetrics[developer] = GitHubMetrics({
            publicRepos: publicRepos,
            followers: followers,
            totalContributions: contributions,
            accountAgeMonths: accountAge,
            consistencyScore: consistencyScore,
            lastUpdated: block.timestamp
        });

        // Update profile's contribution count for quick access
        profiles[developer].githubContributions = contributions;

        // Recalculate and update trust score
        uint256 oldTrustScore = profiles[developer].trustScore;
        uint256 newTrustScore = TrustScoreLibrary.calculateOverallTrustScore(
            profiles[developer],
            githubMetrics[developer]
        );
        
        profiles[developer].trustScore = newTrustScore;

        emit GitHubMetricsUpdated(developer, newTrustScore);
        emit TrustScoreUpdated(developer, newTrustScore, oldTrustScore);
    }

    /**
     * @notice Update loan metrics for a developer (called by authorized contracts)
     * @param developer Address of the developer
     * @param isSuccessful Whether the loan was successful
     * @param amount Loan amount
     * @param isRepayment Whether this is a repayment event
     */
    function updateLoanMetrics(
        address developer,
        bool isSuccessful,
        uint256 amount,
        bool isRepayment
    ) external onlyOracle profileExists(developer) {
        Profile storage profile = profiles[developer];
        
        if (isRepayment) {
            profile.totalRepaid += amount;
            if (isSuccessful) {
                profile.successfulLoans++;
            }
        } else {
            // New loan
            profile.totalLoans++;
            profile.totalBorrowed += amount;
        }

        // Recalculate trust score
        uint256 oldTrustScore = profile.trustScore;
        uint256 newTrustScore = TrustScoreLibrary.calculateOverallTrustScore(
            profile,
            githubMetrics[developer]
        );
        
        profile.trustScore = newTrustScore;

        emit LoanMetricsUpdated(developer, isRepayment, amount);
        emit TrustScoreUpdated(developer, newTrustScore, oldTrustScore);
    }

    /**
     * @inheritdoc IDeveloperProfile
     */
    function getDeveloperProfile(address developer) 
        external 
        view 
        override 
        returns (Profile memory) 
    {
        return profiles[developer];
    }

    /**
     * @inheritdoc IDeveloperProfile
     */
    function getGitHubMetrics(address developer) 
        external 
        view 
        override 
        returns (GitHubMetrics memory) 
    {
        return githubMetrics[developer];
    }

    /**
     * @inheritdoc IDeveloperProfile
     */
    function calculateTrustScore(address developer) 
        external 
        view 
        override 
        returns (uint256) 
    {
        return TrustScoreLibrary.calculateOverallTrustScore(
            profiles[developer],
            githubMetrics[developer]
        );
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Add an authorized oracle
     * @param oracle Address to authorize as oracle
     */
    function addOracle(address oracle) external onlyOwner {
        authorizedOracles[oracle] = true;
    }

    /**
     * @notice Remove an authorized oracle
     * @param oracle Address to remove oracle authorization
     */
    function removeOracle(address oracle) external onlyOwner {
        authorizedOracles[oracle] = false;
    }

    /**
     * @notice Add an authorized verifier
     * @param verifier Address to authorize as verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
    }

    /**
     * @notice Remove an authorized verifier
     * @param verifier Address to remove verifier authorization
     */
    function removeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Get total number of registered developers
     * @return Total developer count
     */
    function getTotalDevelopers() external view returns (uint256) {
        return allDevelopers.length;
    }

    /**
     * @notice Get developer address by index
     * @param index Index in the developers array
     * @return Developer address
     */
    function getDeveloperByIndex(uint256 index) external view returns (address) {
        require(index < allDevelopers.length, "Index out of bounds");
        return allDevelopers[index];
    }

    /**
     * @notice Check if a GitHub handle is available
     * @param githubHandle GitHub handle to check
     * @return bool Whether the handle is available
     */
    function isGitHubHandleAvailable(string calldata githubHandle) external view returns (bool) {
        return githubHandleToAddress[githubHandle] == address(0);
    }

    /**
     * @notice Check if an address is an authorized oracle
     * @param oracle Address to check
     * @return bool Authorization status
     */
    function isAuthorizedOracle(address oracle) external view returns (bool) {
        return authorizedOracles[oracle];
    }

    /**
     * @notice Check if an address is an authorized verifier
     * @param verifier Address to check
     * @return bool Authorization status
     */
    function isAuthorizedVerifier(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier];
    }

    // ========== INTERNAL FUNCTIONS ==========

    /**
     * @notice Internal function to create a developer profile
     * @param developer Address of the developer
     * @param githubHandle GitHub username
     * @param profileDataCID IPFS CID for additional profile data
     */
    function _createProfile(
        address developer,
        string calldata githubHandle,
        string calldata profileDataCID
    ) internal {
        // Check if profile already exists
        if (profiles[developer].isActive) {
            revert ProfileAlreadyExists(developer);
        }
        
        // Check if GitHub handle is already taken
        if (githubHandleToAddress[githubHandle] != address(0)) {
            revert GitHubHandleTaken(githubHandle);
        }

        // Create new profile with default values
        profiles[developer] = Profile({
            githubHandle: githubHandle,
            profileDataCID: profileDataCID,
            githubContributions: 0,
            trustScore: TrustScoreLibrary.BASE_TRUST_SCORE,
            completedProjects: 0,
            totalProjects: 0,
            reputationScore: 0,
            totalLoans: 0,
            successfulLoans: 0,
            totalBorrowed: 0,
            totalRepaid: 0,
            verificationTimestamp: 0,
            isVerified: false,
            isActive: true
        });

        // Reserve the GitHub handle
        githubHandleToAddress[githubHandle] = developer;
        
        // Add to developers array for enumeration
        developerIndex[developer] = allDevelopers.length;
        allDevelopers.push(developer);

        emit ProfileCreated(developer, githubHandle);
    }
}
