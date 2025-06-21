// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./tokens/ReputationSBT.sol";
import "./staking/StakingVault.sol";
import "./profiles/DeveloperProfile.sol";
import "./oracles/RiskAssessmentOracle.sol";
import "./Market.sol";

contract MarketFactoryTesting is AccessControl, Pausable {
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    address public immutable assetAddress; // Alamat sUSDT
    ReputationSBT public immutable reputationSBT;
    StakingVault public immutable stakingVault;
    DeveloperProfile public immutable developerProfile;
    RiskAssessmentOracle public riskAssessmentOracle;
    
    uint256 public constant MINIMUM_STAKE = 1 * 10**18; // 1 tCORE
    uint256 public constant MIN_TRUST_SCORE = 100; // LOWERED FOR TESTING - was 200
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
        require(profile.trustScore >= MIN_TRUST_SCORE, "Trust score too low"); // Now requires >= 100 instead of 200
        
        // Validate staking requirements
        require(stakingVault.canCreateLoan(msg.sender), "Insufficient stake");
        
        // Validate loan parameters
        require(_loanAmount > 0, "Loan amount must be positive");
        require(_interestRateBps > 0 && _interestRateBps <= 10000, "Invalid interest rate");
        require(_tenorSeconds >= 7 days && _tenorSeconds <= 365 days, "Invalid tenor");
        require(bytes(_projectDataCID).length > 0, "Project data required");
        
        // Get risk assessment
        uint256 riskScore = 500; // Default medium risk
        uint256 suggestedRate = _interestRateBps;
        
        if (address(riskAssessmentOracle) != address(0)) {
            try riskAssessmentOracle.assessDeveloperRisk(msg.sender) 
            returns (uint256 _riskScore) {
                riskScore = _riskScore;
                // Calculate suggested rate based on risk
                suggestedRate = riskAssessmentOracle.calculateSuggestedInterestRate(msg.sender);
            } catch {
                // Use defaults if oracle fails
            }
        }
        
        require(riskScore <= MAX_RISK_SCORE, "Risk score too high");
        
        // Create new market
        Market newMarket = new Market(
            assetAddress,
            msg.sender,
            _loanAmount,
            _interestRateBps,
            _tenorSeconds,
            _projectDataCID
        );
        
        address marketAddress = address(newMarket);
        
        // Update tracking
        allMarkets.push(marketAddress);
        marketsByDeveloper[msg.sender].push(marketAddress);
        developerLoanCount[msg.sender]++;
        developerTotalBorrowed[msg.sender] += _loanAmount;
        
        // Update platform metrics
        platformMetrics.totalMarkets++;
        platformMetrics.totalVolume += _loanAmount;
        platformMetrics.activeMarkets++;
        
        // Lock stake for this loan
        stakingVault.lockStakeForLoan(msg.sender, _loanAmount);
        
        emit MarketCreated(msg.sender, marketAddress, _projectDataCID, suggestedRate, riskScore);
        
        return marketAddress;
    }

    // Rest of the functions remain the same...
    function canCreateLoan(address developer) external view returns (bool) {
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        
        return profile.isActive && 
               profile.trustScore >= MIN_TRUST_SCORE &&
               hasRole(DEVELOPER_ROLE, developer) &&
               stakingVault.canCreateLoan(developer);
    }

    function getDeveloperStats(address developer) external view returns (uint256, uint256, uint256) {
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        return (profile.trustScore, developerLoanCount[developer], developerTotalBorrowed[developer]);
    }

    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    function getMarketsByDeveloper(address developer) external view returns (address[] memory) {
        return marketsByDeveloper[developer];
    }

    function getTotalMarkets() external view returns (uint256) {
        return allMarkets.length;
    }

    function getPlatformMetrics() external view returns (MarketMetrics memory) {
        return platformMetrics;
    }

    function setRiskAssessmentOracle(address _oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldOracle = address(riskAssessmentOracle);
        riskAssessmentOracle = RiskAssessmentOracle(_oracle);
        emit RiskOracleUpdated(oldOracle, _oracle);
    }

    function setPlatformFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function updateLoanMetrics(address developer, bool successful, uint256 amount) external {
        require(msg.sender == address(this) || hasRole(ORACLE_ROLE, msg.sender), "Not authorized");
        
        if (successful) {
            platformMetrics.successfulLoans++;
            developerProfile.updateLoanMetrics(developer, true, amount, true);
        } else {
            platformMetrics.defaultedLoans++;
            developerProfile.updateLoanMetrics(developer, false, amount, false);
        }
        
        // Update active markets count
        if (platformMetrics.activeMarkets > 0) {
            platformMetrics.activeMarkets--;
        }
    }
}
