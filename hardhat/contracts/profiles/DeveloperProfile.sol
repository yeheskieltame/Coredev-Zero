// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DeveloperProfile is Ownable, ReentrancyGuard {
    struct Profile {
        string githubHandle;
        string profileDataCID;
        uint256 trustScore;
        uint256 completedProjects;
        uint256 successfulLoans;
        uint256 defaultedLoans;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        bool isVerified;
        bool isActive;
        uint256 verificationTimestamp;
        uint256 lastActivityTimestamp;
    }

    struct GitHubMetrics {
        uint256 publicRepos;
        uint256 followers;
        uint256 totalCommits;
        uint256 totalStars;
        uint256 accountAge; // in days
        uint256 lastUpdated;
    }

    struct TrustScoreFactors {
        uint256 baseScore;
        uint256 githubBonus;
        uint256 loanHistoryBonus;
        uint256 projectBonus;
        uint256 timeBonus;
        uint256 verificationBonus;
    }

    mapping(address => Profile) public profiles;
    mapping(address => GitHubMetrics) public githubMetrics;
    mapping(address => TrustScoreFactors) public trustFactors;
    
    // Trust score weights (out of 100)
    uint256 public constant GITHUB_WEIGHT = 30;
    uint256 public constant LOAN_HISTORY_WEIGHT = 40;
    uint256 public constant PROJECT_WEIGHT = 20;
    uint256 public constant TIME_WEIGHT = 10;
    
    // Verification roles
    mapping(address => bool) public verifiers;
    mapping(address => bool) public oracles;
    
    address public riskAssessmentOracle;
    
    event ProfileCreated(address indexed developer, string githubHandle);
    event ProfileVerified(address indexed developer, address indexed verifier);
    event TrustScoreUpdated(address indexed developer, uint256 oldScore, uint256 newScore);
    event GitHubMetricsUpdated(address indexed developer, uint256 timestamp);
    event LoanMetricsUpdated(address indexed developer, bool isSuccessful, uint256 amount);

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || owner() == msg.sender, "Not authorized verifier");
        _;
    }

    modifier onlyOracle() {
        require(oracles[msg.sender] || owner() == msg.sender, "Not authorized oracle");
        _;
    }

    modifier onlyProfileOwner(address developer) {
        require(developer == msg.sender, "Not profile owner");
        _;
    }

    constructor() Ownable(msg.sender) {
        verifiers[msg.sender] = true;
        oracles[msg.sender] = true;
    }

    function createProfile(
        string memory _githubHandle,
        string memory _profileDataCID
    ) external {
        require(bytes(profiles[msg.sender].githubHandle).length == 0, "Profile already exists");
        require(bytes(_githubHandle).length > 0, "GitHub handle required");

        profiles[msg.sender] = Profile({
            githubHandle: _githubHandle,
            profileDataCID: _profileDataCID,
            trustScore: 100, // Base trust score
            completedProjects: 0,
            successfulLoans: 0,
            defaultedLoans: 0,
            totalBorrowed: 0,
            totalRepaid: 0,
            isVerified: false,
            isActive: true,
            verificationTimestamp: 0,
            lastActivityTimestamp: block.timestamp
        });

        emit ProfileCreated(msg.sender, _githubHandle);
    }

    function createProfileFor(
        address developer,
        string memory _githubHandle,
        string memory _profileDataCID
    ) external onlyOwner {
        require(bytes(profiles[developer].githubHandle).length == 0, "Profile already exists");
        require(bytes(_githubHandle).length > 0, "GitHub handle required");

        profiles[developer] = Profile({
            githubHandle: _githubHandle,
            profileDataCID: _profileDataCID,
            trustScore: 100, // Base trust score
            completedProjects: 0,
            successfulLoans: 0,
            defaultedLoans: 0,
            totalBorrowed: 0,
            totalRepaid: 0,
            isVerified: false,
            isActive: true,
            verificationTimestamp: 0,
            lastActivityTimestamp: block.timestamp
        });

        emit ProfileCreated(developer, _githubHandle);
    }
    
    function updateGitHubMetrics(
        address developer,
        uint256 _publicRepos,
        uint256 _followers,
        uint256 _totalCommits,
        uint256 _totalStars,
        uint256 _accountAge
    ) external onlyOracle {
        githubMetrics[developer] = GitHubMetrics({
            publicRepos: _publicRepos,
            followers: _followers,
            totalCommits: _totalCommits,
            totalStars: _totalStars,
            accountAge: _accountAge,
            lastUpdated: block.timestamp
        });

        _updateTrustScore(developer);
        emit GitHubMetricsUpdated(developer, block.timestamp);
    }

    function verifyProfile(address developer, bytes calldata proof) external onlyVerifier {
        require(profiles[developer].isActive, "Profile not active");
        require(!profiles[developer].isVerified, "Already verified");

        // In production, verify proof against GitHub API signature
        // For now, we trust the verifier
        
        profiles[developer].isVerified = true;
        profiles[developer].verificationTimestamp = block.timestamp;
        
        _updateTrustScore(developer);
        emit ProfileVerified(developer, msg.sender);
    }

    function updateLoanMetrics(
        address developer,
        bool isSuccessful,
        uint256 amount,
        bool isRepayment
    ) external onlyOracle {
        Profile storage profile = profiles[developer];
        require(profile.isActive, "Profile not active");

        if (isRepayment) {
            profile.totalRepaid += amount;
            if (isSuccessful) {
                profile.successfulLoans++;
            }
        } else {
            profile.totalBorrowed += amount;
            if (!isSuccessful) {
                profile.defaultedLoans++;
            }
        }

        profile.lastActivityTimestamp = block.timestamp;
        _updateTrustScore(developer);
        
        emit LoanMetricsUpdated(developer, isSuccessful, amount);
    }

    function updateProjectCount(address developer, uint256 projectCount) external onlyOracle {
        profiles[developer].completedProjects = projectCount;
        _updateTrustScore(developer);
    }

    function _updateTrustScore(address developer) internal {
        Profile storage profile = profiles[developer];
        uint256 oldScore = profile.trustScore;
        
        TrustScoreFactors memory factors = _calculateTrustFactors(developer);
        trustFactors[developer] = factors;
        
        uint256 newScore = factors.baseScore + (
            (factors.githubBonus * GITHUB_WEIGHT) +
            (factors.loanHistoryBonus * LOAN_HISTORY_WEIGHT) +
            (factors.projectBonus * PROJECT_WEIGHT) +
            (factors.timeBonus * TIME_WEIGHT)
        ) / 100;
        
        // Add verification bonus
        if (profile.isVerified) {
            newScore += factors.verificationBonus;
        }
        
        // Cap at 1000 max score
        profile.trustScore = newScore > 1000 ? 1000 : newScore;
        
        emit TrustScoreUpdated(developer, oldScore, profile.trustScore);
    }

    function _calculateTrustFactors(address developer) internal view returns (TrustScoreFactors memory) {
        Profile memory profile = profiles[developer];
        GitHubMetrics memory github = githubMetrics[developer];
        
        // Base score
        uint256 baseScore = 100;
        
        // GitHub metrics bonus (0-200 points)
        uint256 githubBonus = 0;
        if (github.lastUpdated > 0) {
            githubBonus = (github.publicRepos * 2) + 
                         (github.followers / 10) + 
                         (github.totalCommits / 100) + 
                         (github.totalStars / 10) +
                         (github.accountAge / 30); // Bonus for account age in months
            githubBonus = githubBonus > 200 ? 200 : githubBonus;
        }
        
        // Loan history bonus (0-300 points)
        uint256 loanHistoryBonus = 0;
        if (profile.successfulLoans > 0) {
            uint256 successRate = (profile.successfulLoans * 100) / 
                                 (profile.successfulLoans + profile.defaultedLoans);
            loanHistoryBonus = (successRate * 3) + (profile.successfulLoans * 10);
            loanHistoryBonus = loanHistoryBonus > 300 ? 300 : loanHistoryBonus;
        }
        
        // Project completion bonus (0-200 points)
        uint256 projectBonus = profile.completedProjects * 20;
        projectBonus = projectBonus > 200 ? 200 : projectBonus;
        
        // Time bonus - account age (0-100 points)
        uint256 timeBonus = 0;
        if (profile.verificationTimestamp > 0) {
            uint256 daysSinceVerification = (block.timestamp - profile.verificationTimestamp) / 86400;
            timeBonus = daysSinceVerification / 3; // 1 point per 3 days
            timeBonus = timeBonus > 100 ? 100 : timeBonus;
        }
        
        // Verification bonus (100 points)
        uint256 verificationBonus = profile.isVerified ? 100 : 0;
        
        return TrustScoreFactors({
            baseScore: baseScore,
            githubBonus: githubBonus,
            loanHistoryBonus: loanHistoryBonus,
            projectBonus: projectBonus,
            timeBonus: timeBonus,
            verificationBonus: verificationBonus
        });
    }

    function calculateTrustScore(address developer) external view returns (uint256) {
        return profiles[developer].trustScore;
    }

    function getDeveloperProfile(address developer) external view returns (Profile memory) {
        return profiles[developer];
    }

    function getGitHubMetrics(address developer) external view returns (GitHubMetrics memory) {
        return githubMetrics[developer];
    }

    function getTrustFactors(address developer) external view returns (TrustScoreFactors memory) {
        return trustFactors[developer];
    }

    // Admin functions
    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
    }

    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
    }

    function addOracle(address oracle) external onlyOwner {
        oracles[oracle] = true;
    }

    function removeOracle(address oracle) external onlyOwner {
        oracles[oracle] = false;
    }

    function setRiskAssessmentOracle(address _oracle) external onlyOwner {
        riskAssessmentOracle = _oracle;
    }

    function markVerifiedForTesting(address developer) external onlyOwner {
        require(profiles[developer].isActive, "Profile not active");
        profiles[developer].isVerified = true;
        profiles[developer].verificationTimestamp = block.timestamp;
        emit ProfileVerified(developer, msg.sender);
    }
    
    // TEST MODE FUNCTIONS - Only for development/testing
    function setTrustScoreForTesting(address developer, uint256 score) external onlyOwner {
        require(profiles[developer].isActive, "Profile not active");
        uint256 oldScore = profiles[developer].trustScore;
        profiles[developer].trustScore = score > 1000 ? 1000 : score;
        emit TrustScoreUpdated(developer, oldScore, profiles[developer].trustScore);
    }

    function deactivateProfile(address developer) external onlyOwner {
        profiles[developer].isActive = false;
    }

    function reactivateProfile(address developer) external onlyOwner {
        profiles[developer].isActive = true;
    }
}