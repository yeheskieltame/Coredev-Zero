// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IRiskAssessment
 * @dev Interface for risk assessment functionality in CoreDev Zero protocol
 * @notice Defines the core risk assessment methods and data structures
 */
interface IRiskAssessment {
    /// @dev Risk metrics for a developer
    struct RiskMetrics {
        uint256 creditScore;        // Credit worthiness (100-1000)
        uint256 volatilityScore;    // Historical volatility (100-1000)
        uint256 liquidityRisk;      // Liquidity risk factor (100-1000)
        uint256 marketRisk;         // Market conditions risk (100-1000)
        uint256 overallRiskScore;   // Calculated overall risk (100-1000)
        uint256 lastUpdated;        // Timestamp of last update
        bool isActive;              // Whether metrics are active
    }

    /// @dev Market conditions affecting all risk assessments
    struct MarketConditions {
        uint256 baseRate;           // Base interest rate (basis points)
        uint256 riskPremium;        // Risk premium adjustment (basis points)
        uint256 liquidityPremium;   // Liquidity premium (basis points)
        uint256 volatilityMultiplier; // Volatility multiplier (basis points)
        uint256 lastUpdated;        // Timestamp of last update
    }

    /**
     * @notice Get risk metrics for a developer
     * @param developer Address of the developer
     * @return Risk metrics struct
     */
    function getDeveloperRiskMetrics(address developer) external view returns (RiskMetrics memory);

    /**
     * @notice Calculate suggested interest rate for a developer
     * @param developer Address of the developer
     * @param loanAmount Amount of the loan
     * @return Suggested interest rate in basis points
     */
    function calculateSuggestedRate(address developer, uint256 loanAmount) external view returns (uint256);

    /**
     * @notice Update risk metrics for a developer
     * @param developer Address of the developer
     * @param creditScore Credit score (100-1000)
     * @param volatilityScore Volatility score (100-1000)
     * @param liquidityRisk Liquidity risk (100-1000)
     * @param marketRisk Market risk (100-1000)
     * @param dataTimestamp Timestamp of the data
     */
    function updateRiskMetrics(
        address developer,
        uint256 creditScore,
        uint256 volatilityScore,
        uint256 liquidityRisk,
        uint256 marketRisk,
        uint256 dataTimestamp
    ) external;

    /// @dev Emitted when risk metrics are updated
    event RiskMetricsUpdated(
        address indexed developer,
        uint256 creditScore,
        uint256 overallRiskScore,
        uint256 suggestedRate
    );

    /// @dev Emitted when data validation fails
    event DataValidationFailed(address indexed developer, string reason);

    /// @dev Emitted when market conditions are updated
    event MarketConditionsUpdated(
        uint256 baseRate,
        uint256 riskPremium,
        uint256 liquidityPremium,
        uint256 volatilityMultiplier
    );
}
