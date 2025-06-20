// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IRiskAssessment.sol";
import "../libraries/MultiSigGovernance.sol";
import "../libraries/RiskCalculationLibrary.sol";
import "../profiles/DeveloperProfile.sol";

/**
 * @title RiskAssessmentOracleRefactored
 * @dev Refactored risk assessment oracle for CoreDev Zero protocol
 * @notice Demonstrates clean, modular architecture with excellent documentation
 * 
 * Key Features:
 * - Multi-factor risk assessment (credit, volatility, liquidity, market)
 * - Dynamic interest rate calculation based on risk profiles
 * - Multi-signature governance for parameter updates
 * - Data validation and freshness checks
 * - Integration with developer profiles for trust score validation
 */
contract RiskAssessmentOracleRefactored is IRiskAssessment, Ownable, ReentrancyGuard {
    using MultiSigGovernance for MultiSigGovernance.GovernanceConfig;
    using MultiSigGovernance for mapping(uint256 => MultiSigGovernance.Proposal);
    using RiskCalculationLibrary for *;

    /// @dev Risk metrics storage for each developer
    mapping(address => RiskMetrics) public developerRisk;
    
    /// @dev Authorized addresses that can update risk metrics
    mapping(address => bool) public authorizedUpdaters;
    
    /// @dev Multi-signature governance proposals
    mapping(uint256 => MultiSigGovernance.Proposal) public proposals;
    
    /// @dev Current market conditions affecting all assessments
    MarketConditions public marketConditions;
    
    /// @dev Developer profile contract for trust score validation
    DeveloperProfile public immutable developerProfile;
    
    /// @dev Governance configuration
    MultiSigGovernance.GovernanceConfig internal governanceConfig;
    
    /// @dev Current proposal count for unique IDs
    uint256 public proposalCount;

    /// @dev Protocol constants
    uint256 public constant MAX_DATA_AGE = 1 hours;
    uint256 public constant PROPOSAL_DURATION = 7 days;
    uint256 public constant REQUIRED_CONFIRMATIONS = 3;

    /// @dev Custom errors for better gas efficiency
    error UnauthorizedUpdater(address caller);
    error DataTooOld(uint256 age);
    error FutureTimestamp(uint256 timestamp);
    error InvalidRiskScore(string parameter, uint256 value);
    error ProfileDataInconsistent(address developer);

    /// @dev Modifier to check if caller is authorized to update risk metrics
    modifier onlyAuthorized() {
        if (!authorizedUpdaters[msg.sender]) {
            revert UnauthorizedUpdater(msg.sender);
        }
        _;
    }

    /// @dev Modifier to validate data age
    modifier validDataAge(uint256 dataTimestamp) {
        if (dataTimestamp > block.timestamp) {
            revert FutureTimestamp(dataTimestamp);
        }
        if (!RiskCalculationLibrary.isDataFresh(dataTimestamp, MAX_DATA_AGE)) {
            revert DataTooOld(block.timestamp - dataTimestamp);
        }
        _;
    }

    /**
     * @notice Initialize the Risk Assessment Oracle
     * @param _developerProfile Address of the developer profile contract
     */
    constructor(address _developerProfile) Ownable(msg.sender) {
        require(_developerProfile != address(0), "Invalid profile address");
        
        developerProfile = DeveloperProfile(_developerProfile);
        
        // Initialize default market conditions
        marketConditions = MarketConditions({
            baseRate: 500,          // 5.00% base rate
            riskPremium: 1000,      // Up to 10.00% risk premium
            liquidityPremium: 100,  // 1.00% liquidity premium
            volatilityMultiplier: 1000, // 1.0x volatility multiplier
            lastUpdated: block.timestamp
        });

        // Initialize governance
        governanceConfig.requiredConfirmations = REQUIRED_CONFIRMATIONS;
        governanceConfig.proposalDuration = PROPOSAL_DURATION;
        
        // Add deployer as initial governor and updater
        governanceConfig.addGovernor(msg.sender);
        authorizedUpdaters[msg.sender] = true;
    }

    /**
     * @inheritdoc IRiskAssessment
     */
    function getDeveloperRiskMetrics(address developer) 
        external 
        view 
        override 
        returns (RiskMetrics memory) 
    {
        return developerRisk[developer];
    }

    /**
     * @inheritdoc IRiskAssessment
     */
    function calculateSuggestedRate(address developer, uint256 loanAmount) 
        external 
        view 
        override 
        returns (uint256) 
    {
        RiskMetrics memory metrics = developerRisk[developer];
        
        // Use overall risk score if available, otherwise calculate from defaults
        uint256 riskScore = metrics.isActive ? metrics.overallRiskScore : 600; // Default medium risk
        
        return RiskCalculationLibrary.calculateInterestRate(
            riskScore,
            marketConditions,
            loanAmount
        );
    }

    /**
     * @inheritdoc IRiskAssessment
     */
    function updateRiskMetrics(
        address developer,
        uint256 creditScore,
        uint256 volatilityScore,
        uint256 liquidityRisk,
        uint256 marketRisk,
        uint256 dataTimestamp
    ) external override onlyAuthorized validDataAge(dataTimestamp) {
        // Validate all risk scores are within acceptable ranges
        if (!RiskCalculationLibrary.validateRiskScores(creditScore, volatilityScore, liquidityRisk, marketRisk)) {
            revert InvalidRiskScore("One or more scores out of range", 0);
        }

        // Cross-validate with developer profile data
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        if (!RiskCalculationLibrary.validateProfileData(profile, creditScore)) {
            emit DataValidationFailed(developer, "Profile data inconsistent");
            revert ProfileDataInconsistent(developer);
        }

        // Calculate overall risk score
        uint256 overallRisk = RiskCalculationLibrary.calculateOverallRisk(
            creditScore,
            volatilityScore,
            liquidityRisk,
            marketRisk,
            profile.trustScore
        );

        // Store updated risk metrics
        developerRisk[developer] = RiskMetrics({
            creditScore: creditScore,
            volatilityScore: volatilityScore,
            liquidityRisk: liquidityRisk,
            marketRisk: marketRisk,
            overallRiskScore: overallRisk,
            lastUpdated: block.timestamp,
            isActive: true
        });

        // Calculate suggested interest rate for the event
        uint256 suggestedRate = RiskCalculationLibrary.calculateInterestRate(
            overallRisk,
            marketConditions,
            100000 * 10**6 // Default loan amount for rate calculation
        );

        emit RiskMetricsUpdated(developer, creditScore, overallRisk, suggestedRate);
    }

    // ========== GOVERNANCE FUNCTIONS ==========

    /**
     * @notice Create a governance proposal
     * @param target Target contract address
     * @param data Encoded function call data
     * @return proposalId New proposal ID
     */
    function createProposal(address target, bytes calldata data) 
        external 
        returns (uint256 proposalId) 
    {
        proposalId = governanceConfig.createProposal(proposals, proposalCount, target, data);
        proposalCount++;
        return proposalId;
    }

    /**
     * @notice Confirm a governance proposal
     * @param proposalId ID of the proposal to confirm
     */
    function confirmProposal(uint256 proposalId) external {
        governanceConfig.confirmProposal(proposals, proposalId);
    }

    /**
     * @notice Execute a confirmed governance proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external {
        governanceConfig.executeProposal(proposals, proposalId);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Add an authorized risk data updater
     * @param updater Address to authorize
     */
    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }

    /**
     * @notice Remove an authorized risk data updater
     * @param updater Address to remove authorization
     */
    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }

    /**
     * @notice Add a new governor for multi-sig governance
     * @param governor Address of the new governor
     */
    function addGovernor(address governor) external onlyOwner {
        governanceConfig.addGovernor(governor);
    }

    /**
     * @notice Remove a governor from multi-sig governance
     * @param governor Address of the governor to remove
     */
    function removeGovernor(address governor) external onlyOwner {
        governanceConfig.removeGovernor(governor);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @notice Check if an address is an authorized updater
     * @param updater Address to check
     * @return bool Authorization status
     */
    function isAuthorizedUpdater(address updater) external view returns (bool) {
        return authorizedUpdaters[updater];
    }

    /**
     * @notice Check if an address is a governor
     * @param governor Address to check
     * @return bool Governor status
     */
    function isGovernor(address governor) external view returns (bool) {
        return governanceConfig.governors[governor];
    }

    /**
     * @notice Get current governance configuration
     * @return requiredConfirmations Number of required confirmations
     * @return proposalDuration Duration for proposals
     * @return governorCount Total number of governors
     */
    function getGovernanceConfig() external view returns (
        uint256 requiredConfirmations,
        uint256 proposalDuration,
        uint256 governorCount
    ) {
        return (
            governanceConfig.requiredConfirmations,
            governanceConfig.proposalDuration,
            governanceConfig.governorCount
        );
    }
}
