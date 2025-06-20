// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../profiles/DeveloperProfile.sol";
import "../interfaces/IRiskAssessment.sol";

/**
 * @title RiskCalculationLibrary
 * @dev Library for risk assessment calculations in CoreDev Zero protocol
 * @notice Contains pure calculation functions for risk scoring and interest rate determination
 */
library RiskCalculationLibrary {
    /// @dev Constants for risk calculation
    uint256 public constant MAX_RISK_SCORE = 1000;
    uint256 public constant MIN_RISK_SCORE = 100;
    uint256 public constant BASE_INTEREST_RATE = 500; // 5.00% in basis points
    uint256 public constant MAX_INTEREST_RATE = 2000; // 20.00% in basis points
    uint256 public constant TRUST_SCORE_WEIGHT = 30; // 30% weight
    uint256 public constant CREDIT_SCORE_WEIGHT = 40; // 40% weight
    uint256 public constant MARKET_CONDITION_WEIGHT = 30; // 30% weight

    /**
     * @notice Calculate overall risk score from individual risk components
     * @param creditScore Credit score (100-1000)
     * @param volatilityScore Volatility score (100-1000)
     * @param liquidityRisk Liquidity risk (100-1000)
     * @param marketRisk Market risk (100-1000)
     * @param trustScore Developer trust score from profile
     * @return Overall risk score (100-1000)
     */
    function calculateOverallRisk(
        uint256 creditScore,
        uint256 volatilityScore,
        uint256 liquidityRisk,
        uint256 marketRisk,
        uint256 trustScore
    ) internal pure returns (uint256) {
        // Weighted average of risk components
        uint256 riskAverage = (creditScore * 40 + volatilityScore * 25 + liquidityRisk * 20 + marketRisk * 15) / 100;
        
        // Adjust based on trust score (inverse relationship)
        uint256 trustAdjustment = (1000 - trustScore) / 4; // Convert trust to risk adjustment
        
        // Combine with bounds checking
        uint256 overallRisk = (riskAverage + trustAdjustment) / 2;
        
        // Ensure within valid range
        if (overallRisk < MIN_RISK_SCORE) return MIN_RISK_SCORE;
        if (overallRisk > MAX_RISK_SCORE) return MAX_RISK_SCORE;
        
        return overallRisk;
    }

    /**
     * @notice Calculate suggested interest rate based on risk assessment
     * @param overallRiskScore Overall risk score (100-1000)
     * @param marketConditions Current market conditions
     * @param loanAmount Loan amount for risk adjustment
     * @return Suggested interest rate in basis points
     */
    function calculateInterestRate(
        uint256 overallRiskScore,
        IRiskAssessment.MarketConditions memory marketConditions,
        uint256 loanAmount
    ) internal pure returns (uint256) {
        // Base rate from market conditions
        uint256 baseRate = marketConditions.baseRate;
        
        // Risk premium based on overall risk score
        uint256 riskPremium = (overallRiskScore * marketConditions.riskPremium) / MAX_RISK_SCORE;
        
        // Liquidity premium
        uint256 liquidityPremium = marketConditions.liquidityPremium;
        
        // Loan amount adjustment (larger loans = lower rates)
        uint256 sizeAdjustment = 0;
        if (loanAmount > 100000 * 10**6) { // > $100k
            sizeAdjustment = 50; // -0.5% for large loans
        } else if (loanAmount < 10000 * 10**6) { // < $10k
            sizeAdjustment = 100; // +1.0% for small loans
        }
        
        // Calculate final rate
        uint256 totalRate = baseRate + riskPremium + liquidityPremium;
        
        // Apply size adjustment
        if (loanAmount > 100000 * 10**6) {
            totalRate = totalRate > sizeAdjustment ? totalRate - sizeAdjustment : BASE_INTEREST_RATE;
        } else if (loanAmount < 10000 * 10**6) {
            totalRate += sizeAdjustment;
        }
        
        // Apply volatility multiplier
        totalRate = (totalRate * marketConditions.volatilityMultiplier) / 1000;
        
        // Ensure within bounds
        if (totalRate < BASE_INTEREST_RATE) return BASE_INTEREST_RATE;
        if (totalRate > MAX_INTEREST_RATE) return MAX_INTEREST_RATE;
        
        return totalRate;
    }

    /**
     * @notice Validate profile data consistency for risk assessment
     * @param profile Developer profile data
     * @param creditScore Proposed credit score
     * @return bool Whether the data is consistent
     */
    function validateProfileData(
        DeveloperProfile.Profile memory profile,
        uint256 creditScore
    ) internal pure returns (bool) {
        // Basic validation - trust score should exist
        if (profile.trustScore == 0) return false;
        
        // Credit score should be inversely related to trust score
        uint256 expectedRange = MAX_RISK_SCORE - profile.trustScore;
        uint256 tolerance = 200; // Allow 20% tolerance
        
        return (creditScore >= expectedRange - tolerance && creditScore <= expectedRange + tolerance);
    }

    /**
     * @notice Check if data timestamp is within acceptable age limit
     * @param dataTimestamp Timestamp of the data
     * @param maxAge Maximum acceptable age in seconds
     * @return bool Whether the data is within acceptable age
     */
    function isDataFresh(uint256 dataTimestamp, uint256 maxAge) internal view returns (bool) {
        return dataTimestamp <= block.timestamp && (block.timestamp - dataTimestamp) <= maxAge;
    }

    /**
     * @notice Validate risk score ranges
     * @param creditScore Credit score to validate
     * @param volatilityScore Volatility score to validate
     * @param liquidityRisk Liquidity risk to validate
     * @param marketRisk Market risk to validate
     * @return bool Whether all scores are within valid ranges
     */
    function validateRiskScores(
        uint256 creditScore,
        uint256 volatilityScore,
        uint256 liquidityRisk,
        uint256 marketRisk
    ) internal pure returns (bool) {
        return (
            creditScore >= MIN_RISK_SCORE && creditScore <= MAX_RISK_SCORE &&
            volatilityScore >= MIN_RISK_SCORE && volatilityScore <= MAX_RISK_SCORE &&
            liquidityRisk >= MIN_RISK_SCORE && liquidityRisk <= MAX_RISK_SCORE &&
            marketRisk >= MIN_RISK_SCORE && marketRisk <= MAX_RISK_SCORE
        );
    }
}
