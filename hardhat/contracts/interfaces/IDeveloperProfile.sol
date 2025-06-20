// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDeveloperProfile
 * @dev Interface for developer profile management in CoreDev Zero protocol
 * @notice Defines core profile functionality including trust scores and verification
 */
interface IDeveloperProfile {
    /// @dev Developer profile structure
    struct Profile {
        string githubHandle;           // GitHub username
        string profileDataCID;         // IPFS CID for additional profile data
        uint256 githubContributions;   // GitHub contribution count
        uint256 trustScore;            // Calculated trust score (100-1000)
        uint256 completedProjects;     // Number of completed projects
        uint256 totalProjects;         // Total number of projects
        uint256 reputationScore;       // Reputation score from SBT achievements
        uint256 totalLoans;            // Total number of loans taken
        uint256 successfulLoans;       // Number of successfully repaid loans
        uint256 totalBorrowed;         // Total amount borrowed (in token units)
        uint256 totalRepaid;           // Total amount repaid (in token units)
        uint256 verificationTimestamp; // Timestamp of profile verification
        bool isVerified;               // Whether profile is verified
        bool isActive;                 // Whether profile is active
    }

    /// @dev GitHub metrics structure for detailed tracking
    struct GitHubMetrics {
        uint256 publicRepos;           // Number of public repositories
        uint256 followers;             // Number of followers
        uint256 totalContributions;    // Total contributions across repos
        uint256 accountAgeMonths;      // Account age in months
        uint256 consistencyScore;      // Contribution consistency score (0-100)
        uint256 lastUpdated;           // Timestamp of last metrics update
    }

    /**
     * @notice Create a new developer profile
     * @param githubHandle GitHub username
     * @param profileDataCID IPFS CID for additional profile data
     */
    function createProfile(string calldata githubHandle, string calldata profileDataCID) external;

    /**
     * @notice Create a profile for another address (admin only)
     * @param developer Address of the developer
     * @param githubHandle GitHub username
     * @param profileDataCID IPFS CID for additional profile data
     */
    function createProfileFor(
        address developer,
        string calldata githubHandle,
        string calldata profileDataCID
    ) external;

    /**
     * @notice Verify a developer profile
     * @param developer Address of the developer
     * @param proof Verification proof data
     */
    function verifyProfile(address developer, bytes calldata proof) external;

    /**
     * @notice Update GitHub metrics for a developer
     * @param developer Address of the developer
     * @param publicRepos Number of public repositories
     * @param followers Number of followers
     * @param contributions Total contributions
     * @param accountAge Account age in months
     * @param consistencyScore Consistency score (0-100)
     */
    function updateGitHubMetrics(
        address developer,
        uint256 publicRepos,
        uint256 followers,
        uint256 contributions,
        uint256 accountAge,
        uint256 consistencyScore
    ) external;

    /**
     * @notice Get developer profile information
     * @param developer Address of the developer
     * @return Profile structure
     */
    function getDeveloperProfile(address developer) external view returns (Profile memory);

    /**
     * @notice Get developer GitHub metrics
     * @param developer Address of the developer
     * @return GitHubMetrics structure
     */
    function getGitHubMetrics(address developer) external view returns (GitHubMetrics memory);

    /**
     * @notice Calculate trust score for a developer
     * @param developer Address of the developer
     * @return Calculated trust score
     */
    function calculateTrustScore(address developer) external view returns (uint256);

    /// @dev Events for profile management
    event ProfileCreated(address indexed developer, string githubHandle);
    event ProfileVerified(address indexed developer, address indexed verifier);
    event GitHubMetricsUpdated(address indexed developer, uint256 trustScore);
    event LoanMetricsUpdated(address indexed developer, bool isRepayment, uint256 amount);
    event TrustScoreUpdated(address indexed developer, uint256 newScore, uint256 oldScore);
}
