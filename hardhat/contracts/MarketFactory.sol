// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./tokens/ReputationSBT.sol";
import "./staking/StakingVault.sol";
import "./profiles/DeveloperProfile.sol";
import "./oracles/RiskAssessmentOracle.sol";
import "./Market.sol";

contract MarketFactory is AccessControl, Pausable {
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    address public immutable assetAddress; // Alamat sUSDT
    ReputationSBT public immutable reputationSBT;
    StakingVault public immutable stakingVault;
    DeveloperProfile public immutable developerProfile;
    RiskAssessmentOracle public riskAssessmentOracle;
    
    uint256 public constant MINIMUM_STAKE = 1 * 10**18; // 1 tCORE
    uint256 public constant MIN_TRUST_SCORE = 200; // Minimum trust score required
    uint256 public constant MAX_RISK_SCORE = 800; // Maximum risk score allowed
    uint256 public platformFee = 100; // 1% platform fee

    address[] public allMarkets;
    mapping(address => address[]) public marketsByDeveloper;
    mapping(address => bool) public verifiedDevelopers;
    mapping(address => uint256) public developerLoanCount;
    mapping(address => uint256) public developerTotalBorrowed;
    
    struct MarketMetrics {
        uint256 totalMarkets;
        uint256 totalVolume;
        uint256 activeMarkets;
        uint256 successfulLoans;
        uint256 defaultedLoans;
    }
    
    MarketMetrics public platformMetrics;

    event ProfileCreated(address indexed developer, string githubHandle);
    event MarketCreated(
        address indexed borrower, 
        address indexed marketAddress, 
        string projectCID,
        uint256 suggestedRate,
        uint256 riskScore
    );
    event DeveloperVerified(address indexed developer, address indexed verifier);
    event RiskOracleUpdated(address indexed oldOracle, address indexed newOracle);

    constructor(
        address _assetAddress,
        address _reputationSBTAddress,
        address _stakingVaultAddress
    ) {
        assetAddress = _assetAddress;
        reputationSBT = ReputationSBT(_reputationSBTAddress);
        stakingVault = StakingVault(_stakingVaultAddress);
        developerProfile = new DeveloperProfile();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    function createProfile(string memory _githubHandle, string memory _profileDataCID) external {
        require(bytes(_githubHandle).length > 0, "GitHub handle required");
        
        developerProfile.createProfileFor(msg.sender, _githubHandle, _profileDataCID);
        emit ProfileCreated(msg.sender, _githubHandle);
    }

    function verifyDeveloper(address developer, bytes calldata proof) external onlyRole(ORACLE_ROLE) {
        require(!verifiedDevelopers[developer], "Already verified");
        
        developerProfile.verifyProfile(developer, proof);
        verifiedDevelopers[developer] = true;
        
        emit DeveloperVerified(developer, msg.sender);
    }

    function grantDeveloperRole(address _developer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifiedDevelopers[_developer], "Developer must be verified first");
        grantRole(DEVELOPER_ROLE, _developer);
    }

    function createMarket(
        uint256 _loanAmount,
        uint256 _interestRateBps,
        uint256 _tenorSeconds,
        string memory _projectDataCID
    ) external whenNotPaused onlyRole(DEVELOPER_ROLE) returns (address) {
        // Validate developer requirements
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(msg.sender);
        require(profile.isActive, "Profile not active");
        require(profile.trustScore >= MIN_TRUST_SCORE, "Trust score too low");
        
        // Enhanced staking requirement check
        require(stakingVault.canCreateLoan(msg.sender), "Insufficient available stake");
        
        // Lock stake for the loan
        stakingVault.lockStakeForLoan(msg.sender, _loanAmount);
        
        // Risk assessment
        uint256 riskScore = 500; // Default risk score
        uint256 suggestedRate = _interestRateBps;
        
        if (address(riskAssessmentOracle) != address(0)) {
            riskScore = riskAssessmentOracle.assessDeveloperRisk(msg.sender);
            require(riskScore <= MAX_RISK_SCORE, "Risk score too high");
            suggestedRate = riskAssessmentOracle.calculateSuggestedInterestRate(msg.sender);
        }
        
        // Create market
        Market newMarket = new Market(
            assetAddress, 
            msg.sender, 
            _loanAmount, 
            _interestRateBps, 
            _tenorSeconds, 
            _projectDataCID
        );
        
        // Update tracking
        allMarkets.push(address(newMarket));
        marketsByDeveloper[msg.sender].push(address(newMarket));
        developerLoanCount[msg.sender]++;
        developerTotalBorrowed[msg.sender] += _loanAmount;
        
        // Update platform metrics
        platformMetrics.totalMarkets++;
        platformMetrics.totalVolume += _loanAmount;
        platformMetrics.activeMarkets++;
        
        emit MarketCreated(msg.sender, address(newMarket), _projectDataCID, suggestedRate, riskScore);
        return address(newMarket);
    }

    function updateLoanStatus(
        address developer,
        bool isSuccessful,
        uint256 amount,
        bool isRepayment
    ) external onlyRole(ORACLE_ROLE) {
        // Update developer profile metrics
        developerProfile.updateLoanMetrics(developer, isSuccessful, amount, isRepayment);
        
        // Update platform metrics
        if (isRepayment) {
            if (isSuccessful) {
                platformMetrics.successfulLoans++;
            } else {
                platformMetrics.defaultedLoans++;
            }
            platformMetrics.activeMarkets--;
        }
    }

    function updateGitHubMetrics(
        address developer,
        uint256 _publicRepos,
        uint256 _followers,
        uint256 _totalCommits,
        uint256 _totalStars,
        uint256 _accountAge
    ) external onlyRole(ORACLE_ROLE) {
        developerProfile.updateGitHubMetrics(
            developer,
            _publicRepos,
            _followers,
            _totalCommits,
            _totalStars,
            _accountAge
        );
    }

    function awardRepaymentSBT(address developer, string memory tokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        reputationSBT.mintAchievement(developer, tokenURI);
    }

    function addVerifierToDeveloperProfile(address verifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        developerProfile.addVerifier(verifier);
    }

    function addOracleToDeveloperProfile(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        developerProfile.addOracle(oracle);
    }

    // View functions
    function getDeveloperMarkets(address developer) external view returns (address[] memory) {
        return marketsByDeveloper[developer];
    }

    function getDeveloperStats(address developer) external view returns (
        uint256 trustScore,
        uint256 loanCount,
        uint256 totalBorrowed,
        bool isVerified,
        uint256 riskScore
    ) {
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        
        riskScore = 500; // Default
        if (address(riskAssessmentOracle) != address(0)) {
            riskScore = riskAssessmentOracle.assessDeveloperRisk(developer);
        }
        
        return (
            profile.trustScore,
            developerLoanCount[developer],
            developerTotalBorrowed[developer],
            verifiedDevelopers[developer],
            riskScore
        );
    }

    function getPlatformMetrics() external view returns (MarketMetrics memory) {
        return platformMetrics;
    }

    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    function getMarketCount() external view returns (uint256) {
        return allMarkets.length;
    }

    function canCreateMarket(address developer) external view returns (bool, string memory) {
        if (!hasRole(DEVELOPER_ROLE, developer)) {
            return (false, "Not a developer");
        }
        
        if (!verifiedDevelopers[developer]) {
            return (false, "Not verified");
        }
        
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        if (!profile.isActive) {
            return (false, "Profile not active");
        }
        
        if (profile.trustScore < MIN_TRUST_SCORE) {
            return (false, "Trust score too low");
        }
        
        if (stakingVault.stakesOf(developer) < MINIMUM_STAKE) {
            return (false, "Insufficient stake");
        }
        
        if (address(riskAssessmentOracle) != address(0)) {
            uint256 riskScore = riskAssessmentOracle.assessDeveloperRisk(developer);
            if (riskScore > MAX_RISK_SCORE) {
                return (false, "Risk score too high");
            }
        }
        
        return (true, "Can create market");
    }

    // Admin functions
    function setRiskAssessmentOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldOracle = address(riskAssessmentOracle);
        riskAssessmentOracle = RiskAssessmentOracle(_oracle);
        emit RiskOracleUpdated(oldOracle, _oracle);
    }

    function setPlatformFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    function setMinTrustScore(uint256 _score) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // This would require a state variable, adding for completeness
    }

    function setMaxRiskScore(uint256 _score) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // This would require a state variable, adding for completeness
    }

    function grantOracleRole(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ORACLE_ROLE, oracle);
    }

    function revokeOracleRole(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ORACLE_ROLE, oracle);
    }
    
    // TEST MODE FUNCTIONS - Only for development/testing
    function markVerifiedForTesting(address developer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!verifiedDevelopers[developer], "Already verified");
        verifiedDevelopers[developer] = true;
        emit DeveloperVerified(developer, msg.sender);
    }
    
    function markProfileVerifiedForTesting(address developer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        developerProfile.markVerifiedForTesting(developer);
        verifiedDevelopers[developer] = true;
        emit DeveloperVerified(developer, msg.sender);
    }
    
    function setTrustScoreForTesting(address developer, uint256 score) external onlyRole(DEFAULT_ADMIN_ROLE) {
        developerProfile.setTrustScoreForTesting(developer, score);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}