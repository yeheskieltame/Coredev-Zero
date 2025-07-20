// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./DefaultBlacklist.sol";

/**
 * @title ReputationStaking
 * @dev Reputation & Identity On-Chain system for borrower trust assessment
 * @notice This contract manages reputation staking, GitHub verification, and achievement tracking
 */
contract ReputationStaking is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    struct GitHubProfile {
        string username;
        uint256 repositories;
        uint256 followers;
        uint256 following;
        uint256 publicGists;
        uint256 totalStars;
        uint256 totalForks;
        uint256 contributionScore;
        uint256 accountAge; // Account age in seconds
        bool isVerified;
        uint256 verificationTimestamp;
    }

    struct Achievement {
        string achievementType; // "hackathon", "grant", "poap", "gitcoin", etc.
        string description;
        string proofCID; // IPFS CID for proof
        uint256 value; // Numeric value/score for the achievement
        uint256 timestamp;
        address verifier;
        bool isVerified;
    }

    struct ReputationProfile {
        address owner;
        GitHubProfile github;
        Achievement[] achievements;
        uint256 totalStaked; // Total reputation tokens staked
        uint256 lockedStake; // Locked stake due to active loans
        uint256 totalLoans;
        uint256 successfulLoans;
        uint256 defaultedLoans;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 reputationScore;
        uint256 lastScoreUpdate;
        mapping(address => uint256) endorsements; // Peer endorsements
        address[] endorsers;
        bool isBlacklisted;
    }

    mapping(address => ReputationProfile) public profiles;
    mapping(string => address) public githubToAddress; // GitHub username to address mapping
    mapping(address => bool) public hasProfile;
    
    DefaultBlacklist public immutable defaultBlacklist;
    
    // Scoring weights (in basis points)
    uint256 public constant GITHUB_WEIGHT = 4000; // 40%
    uint256 public constant ACHIEVEMENT_WEIGHT = 2500; // 25%
    uint256 public constant LOAN_HISTORY_WEIGHT = 2000; // 20%
    uint256 public constant ENDORSEMENT_WEIGHT = 1500; // 15%
    
    // Minimum requirements
    uint256 public constant MIN_GITHUB_REPOS = 5;
    uint256 public constant MIN_ACCOUNT_AGE = 180 days;
    uint256 public constant MIN_CONTRIBUTION_SCORE = 100;
    
    // Reputation token (native token staking)
    uint256 public constant MIN_REPUTATION_STAKE = 0.1 ether;
    uint256 public constant MAX_REPUTATION_STAKE = 10 ether;
    
    address[] public allProfiles;
    uint256 public totalStaked;
    uint256 public totalProfiles;

    event ProfileCreated(address indexed user, string githubUsername);
    event GitHubVerified(address indexed user, string githubUsername, uint256 score);
    event AchievementAdded(address indexed user, string achievementType, uint256 value);
    event AchievementVerified(address indexed user, uint256 achievementIndex);
    event ReputationStaked(address indexed user, uint256 amount);
    event ReputationUnstaked(address indexed user, uint256 amount);
    event StakeLocked(address indexed user, uint256 amount);
    event StakeUnlocked(address indexed user, uint256 amount);
    event StakeSlashed(address indexed user, uint256 amount, string reason);
    event EndorsementGiven(address indexed endorser, address indexed endorsed, uint256 value);
    event ReputationScoreUpdated(address indexed user, uint256 newScore);

    constructor(address _defaultBlacklist) {
        require(_defaultBlacklist != address(0), "Invalid blacklist address");
        defaultBlacklist = DefaultBlacklist(_defaultBlacklist);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @dev Create a new reputation profile
     * @param _githubUsername GitHub username to link
     */
    function createProfile(string memory _githubUsername) external {
        require(!hasProfile[msg.sender], "Profile already exists");
        require(bytes(_githubUsername).length > 0, "GitHub username required");
        require(githubToAddress[_githubUsername] == address(0), "GitHub username already linked");
        require(!defaultBlacklist.isBlacklisted(msg.sender), "Address is blacklisted");

        ReputationProfile storage profile = profiles[msg.sender];
        profile.owner = msg.sender;
        profile.github.username = _githubUsername;
        profile.lastScoreUpdate = block.timestamp;
        
        githubToAddress[_githubUsername] = msg.sender;
        hasProfile[msg.sender] = true;
        allProfiles.push(msg.sender);
        totalProfiles++;

        emit ProfileCreated(msg.sender, _githubUsername);
    }

    /**
     * @dev Verify GitHub profile data (called by oracle)
     * @param _user User address
     * @param _repositories Number of repositories
     * @param _followers Number of followers
     * @param _following Number of following
     * @param _publicGists Number of public gists
     * @param _totalStars Total stars received
     * @param _totalForks Total forks received
     * @param _contributionScore Calculated contribution score
     * @param _accountAge Account age in seconds
     */
    function verifyGitHubProfile(
        address _user,
        uint256 _repositories,
        uint256 _followers,
        uint256 _following,
        uint256 _publicGists,
        uint256 _totalStars,
        uint256 _totalForks,
        uint256 _contributionScore,
        uint256 _accountAge
    ) external onlyRole(ORACLE_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        GitHubProfile storage github = profile.github;
        
        github.repositories = _repositories;
        github.followers = _followers;
        github.following = _following;
        github.publicGists = _publicGists;
        github.totalStars = _totalStars;
        github.totalForks = _totalForks;
        github.contributionScore = _contributionScore;
        github.accountAge = _accountAge;
        github.isVerified = true;
        github.verificationTimestamp = block.timestamp;
        
        // Update reputation score
        _updateReputationScore(_user);
        
        emit GitHubVerified(_user, github.username, github.contributionScore);
    }

    /**
     * @dev Add achievement to profile
     * @param _achievementType Type of achievement
     * @param _description Description of achievement
     * @param _proofCID IPFS CID for proof
     * @param _value Numeric value/score
     */
    function addAchievement(
        string memory _achievementType,
        string memory _description,
        string memory _proofCID,
        uint256 _value
    ) external {
        require(hasProfile[msg.sender], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[msg.sender];
        profile.achievements.push(Achievement({
            achievementType: _achievementType,
            description: _description,
            proofCID: _proofCID,
            value: _value,
            timestamp: block.timestamp,
            verifier: address(0),
            isVerified: false
        }));
        
        emit AchievementAdded(msg.sender, _achievementType, _value);
    }

    /**
     * @dev Verify achievement
     * @param _user User address
     * @param _achievementIndex Index of achievement to verify
     */
    function verifyAchievement(address _user, uint256 _achievementIndex) external onlyRole(VERIFIER_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(_achievementIndex < profile.achievements.length, "Invalid achievement index");
        
        Achievement storage achievement = profile.achievements[_achievementIndex];
        require(!achievement.isVerified, "Achievement already verified");
        
        achievement.isVerified = true;
        achievement.verifier = msg.sender;
        
        // Update reputation score
        _updateReputationScore(_user);
        
        emit AchievementVerified(_user, _achievementIndex);
    }

    /**
     * @dev Stake reputation (native token)
     */
    function stakeReputation() external payable {
        require(hasProfile[msg.sender], "Profile does not exist");
        require(msg.value >= MIN_REPUTATION_STAKE, "Minimum stake not met");
        require(!defaultBlacklist.isBlacklisted(msg.sender), "Address is blacklisted");
        
        ReputationProfile storage profile = profiles[msg.sender];
        require(profile.totalStaked + msg.value <= MAX_REPUTATION_STAKE, "Maximum stake exceeded");
        
        profile.totalStaked += msg.value;
        totalStaked += msg.value;
        
        // Update reputation score
        _updateReputationScore(msg.sender);
        
        emit ReputationStaked(msg.sender, msg.value);
    }

    /**
     * @dev Unstake reputation (if not locked)
     * @param _amount Amount to unstake
     */
    function unstakeReputation(uint256 _amount) external nonReentrant {
        require(hasProfile[msg.sender], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[msg.sender];
        require(_amount > 0, "Amount must be greater than 0");
        require(profile.totalStaked >= _amount, "Insufficient staked amount");
        require(profile.totalStaked - profile.lockedStake >= _amount, "Insufficient unlocked stake");
        
        profile.totalStaked -= _amount;
        totalStaked -= _amount;
        
        // Update reputation score
        _updateReputationScore(msg.sender);
        
        payable(msg.sender).transfer(_amount);
        
        emit ReputationUnstaked(msg.sender, _amount);
    }

    /**
     * @dev Lock stake for active loan
     * @param _user User address
     * @param _amount Amount to lock
     */
    function lockStake(address _user, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(profile.totalStaked >= profile.lockedStake + _amount, "Insufficient unlocked stake");
        
        profile.lockedStake += _amount;
        
        emit StakeLocked(_user, _amount);
    }

    /**
     * @dev Unlock stake after loan completion
     * @param _user User address
     * @param _amount Amount to unlock
     */
    function unlockStake(address _user, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(profile.lockedStake >= _amount, "Insufficient locked stake");
        
        profile.lockedStake -= _amount;
        
        emit StakeUnlocked(_user, _amount);
    }

    /**
     * @dev Slash stake for default
     * @param _user User address
     * @param _amount Amount to slash
     * @param _reason Reason for slashing
     */
    function slashStake(address _user, uint256 _amount, string memory _reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(profile.lockedStake >= _amount, "Insufficient locked stake");
        
        profile.lockedStake -= _amount;
        profile.totalStaked -= _amount;
        totalStaked -= _amount;
        
        // Update reputation score
        _updateReputationScore(_user);
        
        emit StakeSlashed(_user, _amount, _reason);
    }

    /**
     * @dev Give endorsement to another user
     * @param _endorsed User to endorse
     * @param _value Endorsement value
     */
    function giveEndorsement(address _endorsed, uint256 _value) external {
        require(hasProfile[msg.sender], "Endorser profile does not exist");
        require(hasProfile[_endorsed], "Endorsed profile does not exist");
        require(_endorsed != msg.sender, "Cannot endorse yourself");
        require(_value > 0, "Endorsement value must be greater than 0");
        
        ReputationProfile storage endorsedProfile = profiles[_endorsed];
        
        // If first endorsement from this user, add to endorsers list
        if (endorsedProfile.endorsements[msg.sender] == 0) {
            endorsedProfile.endorsers.push(msg.sender);
        }
        
        endorsedProfile.endorsements[msg.sender] = _value;
        
        // Update reputation score
        _updateReputationScore(_endorsed);
        
        emit EndorsementGiven(msg.sender, _endorsed, _value);
    }

    /**
     * @dev Update loan statistics
     * @param _user User address
     * @param _loanAmount Loan amount
     * @param _isSuccessful Whether loan was successful
     */
    function updateLoanStats(address _user, uint256 _loanAmount, bool _isSuccessful) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        profile.totalLoans++;
        profile.totalBorrowed += _loanAmount;
        
        if (_isSuccessful) {
            profile.successfulLoans++;
            profile.totalRepaid += _loanAmount;
        } else {
            profile.defaultedLoans++;
        }
        
        // Update reputation score
        _updateReputationScore(_user);
    }

    /**
     * @dev Calculate and update reputation score
     * @param _user User address
     */
    function _updateReputationScore(address _user) internal {
        ReputationProfile storage profile = profiles[_user];
        
        uint256 githubScore = _calculateGitHubScore(_user);
        uint256 achievementScore = _calculateAchievementScore(_user);
        uint256 loanHistoryScore = _calculateLoanHistoryScore(_user);
        uint256 endorsementScore = _calculateEndorsementScore(_user);
        
        uint256 totalScore = (githubScore * GITHUB_WEIGHT) / 10000 +
                           (achievementScore * ACHIEVEMENT_WEIGHT) / 10000 +
                           (loanHistoryScore * LOAN_HISTORY_WEIGHT) / 10000 +
                           (endorsementScore * ENDORSEMENT_WEIGHT) / 10000;
        
        profile.reputationScore = totalScore;
        profile.lastScoreUpdate = block.timestamp;
        
        emit ReputationScoreUpdated(_user, totalScore);
    }

    /**
     * @dev Calculate GitHub score
     * @param _user User address
     */
    function _calculateGitHubScore(address _user) internal view returns (uint256) {
        GitHubProfile storage github = profiles[_user].github;
        
        if (!github.isVerified) return 0;
        
        uint256 score = 0;
        
        // Repository count (0-200 points)
        score += github.repositories > 100 ? 200 : github.repositories * 2;
        
        // Stars and forks (0-300 points)
        uint256 starForkScore = (github.totalStars + github.totalForks) / 10;
        score += starForkScore > 300 ? 300 : starForkScore;
        
        // Contribution score (0-300 points)
        score += github.contributionScore > 300 ? 300 : github.contributionScore;
        
        // Account age bonus (0-100 points)
        uint256 ageBonus = github.accountAge / (365 days);
        score += ageBonus > 100 ? 100 : ageBonus;
        
        // Followers bonus (0-100 points)
        uint256 followerBonus = github.followers / 10;
        score += followerBonus > 100 ? 100 : followerBonus;
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Calculate achievement score
     * @param _user User address
     */
    function _calculateAchievementScore(address _user) internal view returns (uint256) {
        ReputationProfile storage profile = profiles[_user];
        
        uint256 score = 0;
        for (uint256 i = 0; i < profile.achievements.length; i++) {
            if (profile.achievements[i].isVerified) {
                score += profile.achievements[i].value;
            }
        }
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Calculate loan history score
     * @param _user User address
     */
    function _calculateLoanHistoryScore(address _user) internal view returns (uint256) {
        ReputationProfile storage profile = profiles[_user];
        
        if (profile.totalLoans == 0) return 500; // Neutral score for new users
        
        uint256 successRate = (profile.successfulLoans * 100) / profile.totalLoans;
        uint256 score = (successRate * 10); // 0-1000 points based on success rate
        
        // Bonus for loan volume
        uint256 volumeBonus = profile.totalRepaid / 1 ether; // 1 point per ETH repaid
        score += volumeBonus > 100 ? 100 : volumeBonus;
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Calculate endorsement score
     * @param _user User address
     */
    function _calculateEndorsementScore(address _user) internal view returns (uint256) {
        ReputationProfile storage profile = profiles[_user];
        
        uint256 score = 0;
        for (uint256 i = 0; i < profile.endorsers.length; i++) {
            address endorser = profile.endorsers[i];
            uint256 endorsementValue = profile.endorsements[endorser];
            
            // Weight endorsement by endorser's reputation
            uint256 endorserScore = profiles[endorser].reputationScore;
            uint256 weightedValue = (endorsementValue * endorserScore) / 1000;
            
            score += weightedValue;
        }
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Get reputation profile info
     * @param _user User address
     */
    function getReputationProfile(address _user) external view returns (
        string memory githubUsername,
        uint256 reputationScore,
        uint256 userTotalStaked,
        uint256 lockedStake,
        uint256 totalLoans,
        uint256 successfulLoans,
        uint256 defaultedLoans,
        bool isVerified,
        bool isBlacklisted
    ) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        return (
            profile.github.username,
            profile.reputationScore,
            profile.totalStaked,
            profile.lockedStake,
            profile.totalLoans,
            profile.successfulLoans,
            profile.defaultedLoans,
            profile.github.isVerified,
            profile.isBlacklisted
        );
    }

    /**
     * @dev Get GitHub profile info
     * @param _user User address
     */
    function getGitHubProfile(address _user) external view returns (GitHubProfile memory) {
        require(hasProfile[_user], "Profile does not exist");
        return profiles[_user].github;
    }

    /**
     * @dev Get achievement info
     * @param _user User address
     * @param _index Achievement index
     */
    function getAchievement(address _user, uint256 _index) external view returns (Achievement memory) {
        require(hasProfile[_user], "Profile does not exist");
        require(_index < profiles[_user].achievements.length, "Invalid achievement index");
        return profiles[_user].achievements[_index];
    }

    /**
     * @dev Get total achievements count
     * @param _user User address
     */
    function getAchievementCount(address _user) external view returns (uint256) {
        require(hasProfile[_user], "Profile does not exist");
        return profiles[_user].achievements.length;
    }

    /**
     * @dev Get endorsement value
     * @param _endorsed Endorsed user
     * @param _endorser Endorser
     */
    function getEndorsement(address _endorsed, address _endorser) external view returns (uint256) {
        require(hasProfile[_endorsed], "Profile does not exist");
        return profiles[_endorsed].endorsements[_endorser];
    }

    /**
     * @dev Check if user meets minimum requirements
     * @param _user User address
     */
    function meetsMinimumRequirements(address _user) external view returns (bool) {
        if (!hasProfile[_user]) return false;
        
        ReputationProfile storage profile = profiles[_user];
        GitHubProfile storage github = profile.github;
        
        return github.isVerified &&
               github.repositories >= MIN_GITHUB_REPOS &&
               github.accountAge >= MIN_ACCOUNT_AGE &&
               github.contributionScore >= MIN_CONTRIBUTION_SCORE &&
               profile.totalStaked >= MIN_REPUTATION_STAKE &&
               !defaultBlacklist.isBlacklisted(_user);
    }

    /**
     * @dev Get all profiles
     */
    function getAllProfiles() external view returns (address[] memory) {
        return allProfiles;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
