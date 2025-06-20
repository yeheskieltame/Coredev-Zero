// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IDeveloperProfile.sol";

/**
 * @title TrustScoreLibrary
 * @dev Library for trust score calculations in CoreDev Zero protocol
 * @notice Contains pure calculation functions for developer trust scoring
 */
library TrustScoreLibrary {
    /// @dev Constants for trust score calculation
    uint256 public constant BASE_TRUST_SCORE = 100;
    uint256 public constant MAX_TRUST_SCORE = 1000;
    uint256 public constant MIN_TRUST_SCORE = 50;
    
    /// @dev Weight constants for different factors (out of 100)
    uint256 public constant GITHUB_WEIGHT = 40;
    uint256 public constant LOAN_HISTORY_WEIGHT = 35;
    uint256 public constant PROJECT_COMPLETION_WEIGHT = 15;
    uint256 public constant REPUTATION_WEIGHT = 10;

    /**
     * @notice Calculate trust score based on GitHub metrics
     * @param metrics GitHub metrics structure
     * @return GitHub contribution to trust score
     */
    function calculateGitHubScore(
        IDeveloperProfile.GitHubMetrics memory metrics
    ) internal pure returns (uint256) {
        if (metrics.totalContributions == 0) return 0;
        
        // Contribution score (max 200 points)
        uint256 contributionScore = metrics.totalContributions >= 1000 
            ? 200 
            : (metrics.totalContributions * 200) / 1000;
        
        // Repository score (max 100 points)
        uint256 repoScore = metrics.publicRepos >= 50 
            ? 100 
            : (metrics.publicRepos * 100) / 50;
        
        // Follower score (max 50 points)
        uint256 followerScore = metrics.followers >= 500 
            ? 50 
            : (metrics.followers * 50) / 500;
        
        // Account age bonus (max 50 points)
        uint256 ageBonus = metrics.accountAgeMonths >= 24 
            ? 50 
            : (metrics.accountAgeMonths * 50) / 24;
        
        // Consistency score (0-100 points)
        uint256 consistencyScore = metrics.consistencyScore;
        
        // Total GitHub score with scaling
        uint256 totalScore = contributionScore + repoScore + followerScore + ageBonus + consistencyScore;
        
        // Scale to GITHUB_WEIGHT percentage
        return (totalScore * GITHUB_WEIGHT) / 500; // 500 is max possible points
    }

    /**
     * @notice Calculate trust score based on loan history
     * @param profile Developer profile structure
     * @return Loan history contribution to trust score
     */
    function calculateLoanHistoryScore(
        IDeveloperProfile.Profile memory profile
    ) internal pure returns (uint256) {
        if (profile.totalLoans == 0) return 0;
        
        // Success rate score (0-100 points)
        uint256 successRate = (profile.successfulLoans * 100) / profile.totalLoans;
        
        // Volume bonus based on total borrowed (max 50 points)
        uint256 volumeBonus = 0;
        if (profile.totalBorrowed > 0) {
            // Assume token has 6 decimals (USDT-like)
            uint256 totalBorrowedUSD = profile.totalBorrowed / 10**6;
            volumeBonus = totalBorrowedUSD >= 100000 
                ? 50 
                : (totalBorrowedUSD * 50) / 100000;
        }
        
        // Loan count bonus (max 30 points)
        uint256 countBonus = profile.totalLoans >= 10 
            ? 30 
            : (profile.totalLoans * 30) / 10;
        
        // Repayment ratio bonus (max 20 points)
        uint256 repaymentRatio = profile.totalBorrowed > 0 
            ? (profile.totalRepaid * 100) / profile.totalBorrowed 
            : 0;
        uint256 repaymentBonus = repaymentRatio >= 100 
            ? 20 
            : (repaymentRatio * 20) / 100;
        
        // Total loan score
        uint256 totalScore = successRate + volumeBonus + countBonus + repaymentBonus;
        
        // Scale to LOAN_HISTORY_WEIGHT percentage
        return (totalScore * LOAN_HISTORY_WEIGHT) / 200; // 200 is max possible points
    }

    /**
     * @notice Calculate trust score based on project completion
     * @param profile Developer profile structure
     * @return Project completion contribution to trust score
     */
    function calculateProjectCompletionScore(
        IDeveloperProfile.Profile memory profile
    ) internal pure returns (uint256) {
        if (profile.totalProjects == 0) return 0;
        
        // Completion rate (0-100 points)
        uint256 completionRate = (profile.completedProjects * 100) / profile.totalProjects;
        
        // Project count bonus (max 50 points)
        uint256 countBonus = profile.totalProjects >= 20 
            ? 50 
            : (profile.totalProjects * 50) / 20;
        
        // Total project score
        uint256 totalScore = completionRate + countBonus;
        
        // Scale to PROJECT_COMPLETION_WEIGHT percentage
        return (totalScore * PROJECT_COMPLETION_WEIGHT) / 150; // 150 is max possible points
    }

    /**
     * @notice Calculate trust score based on reputation (SBT achievements)
     * @param profile Developer profile structure
     * @return Reputation contribution to trust score
     */
    function calculateReputationScore(
        IDeveloperProfile.Profile memory profile
    ) internal pure returns (uint256) {
        // Reputation score is already 0-100, scale to REPUTATION_WEIGHT
        return (profile.reputationScore * REPUTATION_WEIGHT) / 100;
    }

    /**
     * @notice Calculate overall trust score for a developer
     * @param profile Developer profile structure
     * @param metrics GitHub metrics structure
     * @return Overall trust score (MIN_TRUST_SCORE to MAX_TRUST_SCORE)
     */
    function calculateOverallTrustScore(
        IDeveloperProfile.Profile memory profile,
        IDeveloperProfile.GitHubMetrics memory metrics
    ) internal pure returns (uint256) {
        // Calculate component scores
        uint256 githubScore = calculateGitHubScore(metrics);
        uint256 loanScore = calculateLoanHistoryScore(profile);
        uint256 projectScore = calculateProjectCompletionScore(profile);
        uint256 reputationScore = calculateReputationScore(profile);
        
        // Combine all scores with base score
        uint256 totalScore = BASE_TRUST_SCORE + githubScore + loanScore + projectScore + reputationScore;
        
        // Apply verification bonus (10% boost for verified profiles)
        if (profile.isVerified) {
            totalScore = (totalScore * 110) / 100;
        }
        
        // Ensure within bounds
        if (totalScore < MIN_TRUST_SCORE) return MIN_TRUST_SCORE;
        if (totalScore > MAX_TRUST_SCORE) return MAX_TRUST_SCORE;
        
        return totalScore;
    }

    /**
     * @notice Validate GitHub metrics input
     * @param publicRepos Number of public repositories
     * @param followers Number of followers
     * @param contributions Total contributions
     * @param accountAge Account age in months
     * @param consistencyScore Consistency score (0-100)
     * @return bool Whether all metrics are valid
     */
    function validateGitHubMetrics(
        uint256 publicRepos,
        uint256 followers,
        uint256 contributions,
        uint256 accountAge,
        uint256 consistencyScore
    ) internal pure returns (bool) {
        return (
            publicRepos <= 10000 &&           // Reasonable upper limit
            followers <= 1000000 &&          // Reasonable upper limit
            contributions <= 100000 &&       // Reasonable upper limit
            accountAge <= 240 &&              // 20 years maximum
            consistencyScore <= 100           // Percentage score
        );
    }

    /**
     * @notice Calculate trust score change impact
     * @param oldScore Previous trust score
     * @param newScore New trust score
     * @return change Absolute change amount
     * @return isIncrease Whether the change is positive
     */
    function calculateScoreChange(
        uint256 oldScore,
        uint256 newScore
    ) internal pure returns (uint256 change, bool isIncrease) {
        if (newScore >= oldScore) {
            return (newScore - oldScore, true);
        } else {
            return (oldScore - newScore, false);
        }
    }
}
