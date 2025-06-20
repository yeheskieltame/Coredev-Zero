// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../profiles/DeveloperProfile.sol";

contract RiskAssessmentOracle is Ownable, ReentrancyGuard {
    struct RiskMetrics {
        uint256 creditScore;
        uint256 volatilityScore;
        uint256 liquidityRisk;
        uint256 marketRisk;
        uint256 overallRiskScore;
        uint256 lastUpdated;
        bool isActive;
    }

    struct MarketConditions {
        uint256 baseRate;
        uint256 riskPremium;
        uint256 liquidityPremium;
        uint256 volatilityMultiplier;
        uint256 lastUpdated;
    }

    // Multi-signature governance structure
    struct Proposal {
        address target;
        bytes data;
        uint256 confirmations;
        uint256 deadline;
        bool executed;
        mapping(address => bool) confirmed;
    }

    mapping(address => RiskMetrics) public developerRisk;
    mapping(address => bool) public authorizedUpdaters;
    mapping(address => bool) public governors; // Multi-sig governors
    mapping(uint256 => Proposal) public proposals;
    
    MarketConditions public marketConditions;
    DeveloperProfile public developerProfile;
    
    uint256 public constant MAX_RISK_SCORE = 1000;
    uint256 public constant MIN_RISK_SCORE = 100;
    uint256 public constant PROPOSAL_DURATION = 7 days;
    uint256 public constant REQUIRED_CONFIRMATIONS = 3; // Require 3 out of N governors
    uint256 public constant MAX_DATA_AGE = 1 hours; // Max age for external data
    
    uint256 public proposalCount;
    
    event RiskAssessmentUpdated(address indexed developer, uint256 riskScore);
    event MarketConditionsUpdated(uint256 baseRate, uint256 riskPremium);
    event UpdaterAuthorized(address indexed updater);
    event UpdaterRevoked(address indexed updater);
    event ProposalCreated(uint256 indexed proposalId, address target, bytes data);
    event ProposalConfirmed(uint256 indexed proposalId, address governor);
    event ProposalExecuted(uint256 indexed proposalId);
    event DataValidationFailed(address indexed developer, string reason);

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || owner() == msg.sender, "Not authorized");
        _;
    }

    modifier onlyGovernor() {
        require(governors[msg.sender], "Not a governor");
        _;
    }

    modifier validDataAge(uint256 timestamp) {
        require(timestamp <= block.timestamp, "Future timestamp not allowed");
        require(block.timestamp - timestamp <= MAX_DATA_AGE, "Data too old");
        _;
    }

    constructor(address _developerProfile) Ownable(msg.sender) {
        developerProfile = DeveloperProfile(_developerProfile);
        authorizedUpdaters[msg.sender] = true;
        governors[msg.sender] = true; // Owner is initial governor
        
        // Initialize market conditions
        marketConditions = MarketConditions({
            baseRate: 500, // 5%
            riskPremium: 200, // 2%
            liquidityPremium: 100, // 1%
            volatilityMultiplier: 150, // 1.5x
            lastUpdated: block.timestamp
        });
    }

    // Enhanced update function with data validation
    function updateRiskMetrics(
        address developer,
        uint256 _creditScore,
        uint256 _volatilityScore,
        uint256 _liquidityRisk,
        uint256 _marketRisk,
        uint256 dataTimestamp
    ) external onlyAuthorized validDataAge(dataTimestamp) {
        // Validate score ranges
        require(_creditScore <= MAX_RISK_SCORE, "Credit score too high");
        require(_volatilityScore <= MAX_RISK_SCORE, "Volatility score too high");
        require(_liquidityRisk <= MAX_RISK_SCORE, "Liquidity risk too high");
        require(_marketRisk <= MAX_RISK_SCORE, "Market risk too high");

        // Cross-validate with profile data
        if (!_validateProfileData(developer, _creditScore)) {
            emit DataValidationFailed(developer, "Profile data inconsistent");
            return;
        }

        uint256 overallRisk = _calculateOverallRisk(
            _creditScore,
            _volatilityScore,
            _liquidityRisk,
            _marketRisk,
            developer
        );

        developerRisk[developer] = RiskMetrics({
            creditScore: _creditScore,
            volatilityScore: _volatilityScore,
            liquidityRisk: _liquidityRisk,
            marketRisk: _marketRisk,
            overallRiskScore: overallRisk,
            lastUpdated: block.timestamp,
            isActive: true
        });

        emit RiskAssessmentUpdated(developer, overallRisk);
    }

    function _validateProfileData(address developer, uint256 creditScore) internal view returns (bool) {
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        
        // Basic validation - check if credit score aligns with trust score
        if (profile.trustScore == 0) return false;
        
        // Credit score should be inversely related to trust score
        uint256 expectedRange = 1000 - profile.trustScore;
        uint256 tolerance = 200; // Allow 20% tolerance
        
        return (creditScore >= expectedRange - tolerance && creditScore <= expectedRange + tolerance);
    }

    // Multi-signature governance functions
    function createProposal(address target, bytes calldata data) external onlyGovernor returns (uint256) {
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.target = target;
        proposal.data = data;
        proposal.deadline = block.timestamp + PROPOSAL_DURATION;
        proposal.executed = false;
        
        emit ProposalCreated(proposalId, target, data);
        return proposalId;
    }

    function confirmProposal(uint256 proposalId) external onlyGovernor {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp <= proposal.deadline, "Proposal expired");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.confirmed[msg.sender], "Already confirmed");
        
        proposal.confirmed[msg.sender] = true;
        proposal.confirmations++;
        
        emit ProposalConfirmed(proposalId, msg.sender);
        
        if (proposal.confirmations >= REQUIRED_CONFIRMATIONS) {
            _executeProposal(proposalId);
        }
    }

    function _executeProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];
        proposal.executed = true;
        
        (bool success,) = proposal.target.call(proposal.data);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(proposalId);
    }

    // Governor management
    function addGovernor(address governor) external onlyOwner {
        governors[governor] = true;
    }

    function removeGovernor(address governor) external onlyOwner {
        governors[governor] = false;
    }

    function assessDeveloperRisk(address developer) external view returns (uint256 riskScore) {
        RiskMetrics memory risk = developerRisk[developer];
        
        if (!risk.isActive || risk.lastUpdated == 0) {
            return _calculateInitialRisk(developer);
        }
        
        return risk.overallRiskScore;
    }

    function updateRiskMetricsSimple(
        address developer,
        uint256 _creditScore,
        uint256 _volatilityScore,
        uint256 _liquidityRisk,
        uint256 _marketRisk
    ) external onlyAuthorized {
        require(_creditScore <= MAX_RISK_SCORE, "Credit score too high");
        require(_volatilityScore <= MAX_RISK_SCORE, "Volatility score too high");
        require(_liquidityRisk <= MAX_RISK_SCORE, "Liquidity risk too high");
        require(_marketRisk <= MAX_RISK_SCORE, "Market risk too high");

        uint256 overallRisk = _calculateOverallRisk(
            _creditScore,
            _volatilityScore,
            _liquidityRisk,
            _marketRisk,
            developer
        );

        developerRisk[developer] = RiskMetrics({
            creditScore: _creditScore,
            volatilityScore: _volatilityScore,
            liquidityRisk: _liquidityRisk,
            marketRisk: _marketRisk,
            overallRiskScore: overallRisk,
            lastUpdated: block.timestamp,
            isActive: true
        });

        emit RiskAssessmentUpdated(developer, overallRisk);
    }

    function _calculateInitialRisk(address developer) internal view returns (uint256) {
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        
        if (bytes(profile.githubHandle).length == 0) {
            return MAX_RISK_SCORE; // Highest risk for no profile
        }

        uint256 trustScore = profile.trustScore;
        uint256 baseRisk = MAX_RISK_SCORE;

        // Convert trust score to risk score (inverse relationship)
        if (trustScore > 0) {
            baseRisk = MAX_RISK_SCORE - ((trustScore * (MAX_RISK_SCORE - MIN_RISK_SCORE)) / 1000);
        }

        // Adjust for verification status
        if (profile.isVerified) {
            baseRisk = baseRisk * 80 / 100; // 20% risk reduction
        }

        // Adjust for loan history
        if (profile.successfulLoans > 0) {
            uint256 successRate = (profile.successfulLoans * 100) / 
                                 (profile.successfulLoans + profile.defaultedLoans);
            if (successRate >= 90) {
                baseRisk = baseRisk * 70 / 100; // 30% risk reduction for high success rate
            } else if (successRate >= 70) {
                baseRisk = baseRisk * 85 / 100; // 15% risk reduction
            }
        }

        return baseRisk < MIN_RISK_SCORE ? MIN_RISK_SCORE : baseRisk;
    }

    function _calculateOverallRisk(
        uint256 creditScore,
        uint256 volatilityScore,
        uint256 liquidityRisk,
        uint256 marketRisk,
        address developer
    ) internal view returns (uint256) {
        // Weight factors
        uint256 creditWeight = 40;
        uint256 volatilityWeight = 25;
        uint256 liquidityWeight = 20;
        uint256 marketWeight = 15;

        uint256 weightedRisk = (
            (creditScore * creditWeight) +
            (volatilityScore * volatilityWeight) +
            (liquidityRisk * liquidityWeight) +
            (marketRisk * marketWeight)
        ) / 100;

        // Apply trust score adjustment
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        if (profile.trustScore > 500) {
            uint256 adjustment = (profile.trustScore - 500) / 10; // Max 50% reduction
            weightedRisk = weightedRisk * (100 - adjustment) / 100;
        }

        return weightedRisk < MIN_RISK_SCORE ? MIN_RISK_SCORE : weightedRisk;
    }

    function calculateSuggestedInterestRate(address developer) external view returns (uint256) {
        uint256 riskScore = this.assessDeveloperRisk(developer);
        
        // Base rate + risk premium based on risk score
        uint256 riskMultiplier = (riskScore * 1000) / MAX_RISK_SCORE; // 0.1x to 1.0x
        
        uint256 suggestedRate = marketConditions.baseRate + 
                               (marketConditions.riskPremium * riskMultiplier / 1000) +
                               marketConditions.liquidityPremium;
        
        return suggestedRate;
    }

    function updateMarketConditions(
        uint256 _baseRate,
        uint256 _riskPremium,
        uint256 _liquidityPremium,
        uint256 _volatilityMultiplier
    ) external onlyOwner {
        marketConditions = MarketConditions({
            baseRate: _baseRate,
            riskPremium: _riskPremium,
            liquidityPremium: _liquidityPremium,
            volatilityMultiplier: _volatilityMultiplier,
            lastUpdated: block.timestamp
        });

        emit MarketConditionsUpdated(_baseRate, _riskPremium);
    }

    function getDeveloperRiskMetrics(address developer) external view returns (RiskMetrics memory) {
        return developerRisk[developer];
    }

    function getMarketConditions() external view returns (MarketConditions memory) {
        return marketConditions;
    }

    // Batch update for multiple developers
    function batchUpdateRisk(
        address[] calldata developers,
        uint256[] calldata riskScores
    ) external onlyAuthorized {
        require(developers.length == riskScores.length, "Array length mismatch");
        
        for (uint256 i = 0; i < developers.length; i++) {
            require(riskScores[i] <= MAX_RISK_SCORE, "Risk score too high");
            
            developerRisk[developers[i]].overallRiskScore = riskScores[i];
            developerRisk[developers[i]].lastUpdated = block.timestamp;
            developerRisk[developers[i]].isActive = true;
            
            emit RiskAssessmentUpdated(developers[i], riskScores[i]);
        }
    }

    // Emergency functions
    function pauseRiskAssessment(address developer) external onlyOwner {
        developerRisk[developer].isActive = false;
    }

    function resumeRiskAssessment(address developer) external onlyOwner {
        developerRisk[developer].isActive = true;
    }

    // Authorization management
    function authorizeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
        emit UpdaterAuthorized(updater);
    }

    function revokeUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
        emit UpdaterRevoked(updater);
    }

    function isAuthorizedUpdater(address updater) external view returns (bool) {
        return authorizedUpdaters[updater];
    }

    // Governance-specific functions (can be called by contract itself)
    function governanceAuthorizeUpdater(address updater) external {
        require(msg.sender == address(this), "Only governance");
        authorizedUpdaters[updater] = true;
        emit UpdaterAuthorized(updater);
    }
}
