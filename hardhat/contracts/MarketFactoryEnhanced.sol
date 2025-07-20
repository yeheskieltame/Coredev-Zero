// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./tokens/ReputationSBT.sol";
import "./staking/StakingVault.sol";
import "./profiles/DeveloperProfile.sol";
import "./oracles/RiskAssessmentOracle.sol";
import "./security/MilestoneEscrowVault.sol";
import "./security/ReputationStaking.sol";
import "./security/CommunityVerification.sol";
import "./security/DefaultBlacklist.sol";
import "./Market.sol";

/**
 * @title MarketFactory
 * @dev Enhanced MarketFactory with integrated security features
 * @notice Central hub for creating and managing secure milestone-based lending markets
 */
contract MarketFactory is AccessControl, Pausable {
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Core contracts
    address public immutable assetAddress; // sUSDT token address
    ReputationSBT public immutable reputationSBT;
    StakingVault public immutable stakingVault;
    DeveloperProfile public immutable developerProfile;
    RiskAssessmentOracle public riskAssessmentOracle;
    
    // Security contracts
    MilestoneEscrowVault public immutable milestoneEscrowVault;
    ReputationStaking public immutable reputationStaking;
    CommunityVerification public immutable communityVerification;
    DefaultBlacklist public immutable defaultBlacklist;
    
    // Configuration
    uint256 public constant MINIMUM_STAKE = 1 * 10**18; // 1 tCORE
    uint256 public constant MIN_TRUST_SCORE = 200; // Minimum trust score required
    uint256 public constant MAX_RISK_SCORE = 800; // Maximum risk score allowed
    uint256 public constant MIN_REPUTATION_SCORE = 400; // Minimum reputation score
    uint256 public platformFee = 100; // 1% platform fee

    // Market tracking
    address[] public allMarkets;
    uint256[] public allMilestoneVaults;
    mapping(address => address[]) public marketsByDeveloper;
    mapping(address => uint256[]) public vaultsByDeveloper;
    mapping(address => bool) public verifiedDevelopers;
    mapping(address => uint256) public developerLoanCount;
    mapping(address => uint256) public developerTotalBorrowed;
    mapping(uint256 => address) public vaultToMarket; // Vault ID to Market address
    mapping(address => uint256) public marketToVault; // Market address to Vault ID
    
    struct MarketMetrics {
        uint256 totalMarkets;
        uint256 totalMilestoneVaults;
        uint256 totalVolume;
        uint256 activeMarkets;
        uint256 successfulLoans;
        uint256 defaultedLoans;
        uint256 totalStaked;
        uint256 totalApprovedProposals;
    }
    
    MarketMetrics public platformMetrics;

    event ProfileCreated(address indexed developer, string githubHandle);
    event MarketCreated(
        address indexed borrower,
        address indexed marketAddress,
        uint256 indexed vaultId,
        uint256 proposalId,
        string projectCID,
        uint256 suggestedRate,
        uint256 riskScore
    );
    event MilestoneVaultCreated(
        uint256 indexed vaultId,
        address indexed borrower,
        uint256 amount,
        uint256 milestoneCount
    );
    event DeveloperVerified(address indexed developer, address indexed verifier);
    event LoanCompleted(address indexed borrower, uint256 indexed vaultId, bool successful);
    event SecurityCheckFailed(address indexed developer, string reason);
    event RiskOracleUpdated(address indexed oldOracle, address indexed newOracle);

    constructor(
        address _assetAddress,
        address _reputationSBTAddress,
        address _stakingVaultAddress,
        address _milestoneEscrowVault,
        address _reputationStaking,
        address _communityVerification,
        address _defaultBlacklist
    ) {
        require(_assetAddress != address(0), "Invalid asset address");
        require(_reputationSBTAddress != address(0), "Invalid reputation SBT address");
        require(_stakingVaultAddress != address(0), "Invalid staking vault address");
        require(_milestoneEscrowVault != address(0), "Invalid milestone vault address");
        require(_reputationStaking != address(0), "Invalid reputation staking address");
        require(_communityVerification != address(0), "Invalid community verification address");
        require(_defaultBlacklist != address(0), "Invalid default blacklist address");
        
        assetAddress = _assetAddress;
        reputationSBT = ReputationSBT(_reputationSBTAddress);
        stakingVault = StakingVault(_stakingVaultAddress);
        milestoneEscrowVault = MilestoneEscrowVault(_milestoneEscrowVault);
        reputationStaking = ReputationStaking(_reputationStaking);
        communityVerification = CommunityVerification(_communityVerification);
        defaultBlacklist = DefaultBlacklist(_defaultBlacklist);
        
        developerProfile = new DeveloperProfile();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Create developer profile with enhanced security checks
     * @param _githubHandle GitHub username
     * @param _profileDataCID IPFS CID for profile data
     */
    function createProfile(string memory _githubHandle, string memory _profileDataCID) external {
        require(bytes(_githubHandle).length > 0, "GitHub handle required");
        require(!defaultBlacklist.isBlacklisted(msg.sender), "Address is blacklisted");
        
        // Create profile in legacy system
        developerProfile.createProfileFor(msg.sender, _githubHandle, _profileDataCID);
        
        // Create reputation staking profile
        reputationStaking.createProfile(_githubHandle);
        
        emit ProfileCreated(msg.sender, _githubHandle);
    }

    /**
     * @dev Verify developer with enhanced security checks
     * @param developer Developer address
     * @param proof Verification proof
     */
    function verifyDeveloper(address developer, bytes calldata proof) external onlyRole(ORACLE_ROLE) {
        require(!verifiedDevelopers[developer], "Already verified");
        require(!defaultBlacklist.isBlacklisted(developer), "Address is blacklisted");
        
        // Verify in legacy system
        developerProfile.verifyProfile(developer, proof);
        
        // Check reputation staking requirements
        require(reputationStaking.hasProfile(developer), "Reputation profile required");
        require(reputationStaking.meetsMinimumRequirements(developer), "Minimum requirements not met");
        
        verifiedDevelopers[developer] = true;
        
        emit DeveloperVerified(developer, msg.sender);
    }

    /**
     * @dev Grant developer role with security checks
     * @param _developer Developer address
     */
    function grantDeveloperRole(address _developer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(verifiedDevelopers[_developer], "Developer must be verified first");
        require(!defaultBlacklist.isBlacklisted(_developer), "Address is blacklisted");
        
        grantRole(DEVELOPER_ROLE, _developer);
    }

    /**
     * @dev Create market with integrated security features
     * @param _proposalId Approved proposal ID from CommunityVerification
     * @param _loanAmount Loan amount
     * @param _interestRateBps Interest rate in basis points
     * @param _tenorSeconds Loan duration in seconds
     * @param _projectDataCID IPFS CID for project data
     */
    function createMarketFromApprovedProposal(
        uint256 _proposalId,
        uint256 _loanAmount,
        uint256 _interestRateBps,
        uint256 _tenorSeconds,
        string memory _projectDataCID
    ) external whenNotPaused onlyRole(DEVELOPER_ROLE) returns (address marketAddress, uint256 vaultId) {
        // Comprehensive security checks
        require(_performSecurityChecks(msg.sender), "Security checks failed");
        
        // Verify proposal is approved
        (
            address proposer,
            ,
            ,
            ,
            ,
            CommunityVerification.ProposalStatus status,
            ,
            ,
        ) = communityVerification.getProposalInfo(_proposalId);
        
        require(proposer == msg.sender, "Not proposal owner");
        require(status == CommunityVerification.ProposalStatus.Approved, "Proposal not approved");
        
        // Get proposal milestones
        (
            string[] memory milestones,
            uint256[] memory percentages,
            uint256[] memory deadlines
        ) = communityVerification.getProposalMilestones(_proposalId);
        
        // Create milestone escrow vault
        vaultId = milestoneEscrowVault.createVault(
            msg.sender,
            assetAddress,
            _loanAmount,
            _interestRateBps,
            _tenorSeconds,
            _projectDataCID,
            milestones,
            percentages,
            deadlines
        );
        
        // Create traditional market for compatibility
        Market market = new Market(
            assetAddress,
            msg.sender,
            _loanAmount,
            _interestRateBps,
            _tenorSeconds,
            _projectDataCID
        );
        
        marketAddress = address(market);
        
        // Lock reputation stake
        (,, uint256 totalStaked, uint256 lockedStake,,,,,) = reputationStaking.getReputationProfile(msg.sender);
        uint256 requiredStake = _loanAmount / 10; // 10% of loan amount
        require(totalStaked >= lockedStake + requiredStake, "Insufficient reputation stake");
        
        reputationStaking.lockStake(msg.sender, requiredStake);
        
        // Update mappings
        allMarkets.push(marketAddress);
        allMilestoneVaults.push(vaultId);
        marketsByDeveloper[msg.sender].push(marketAddress);
        vaultsByDeveloper[msg.sender].push(vaultId);
        vaultToMarket[vaultId] = marketAddress;
        marketToVault[marketAddress] = vaultId;
        
        // Update metrics
        platformMetrics.totalMarkets++;
        platformMetrics.totalMilestoneVaults++;
        platformMetrics.totalVolume += _loanAmount;
        platformMetrics.activeMarkets++;
        platformMetrics.totalApprovedProposals++;
        
        developerLoanCount[msg.sender]++;
        developerTotalBorrowed[msg.sender] += _loanAmount;
        
        // Get risk assessment
        uint256 riskScore = 0;
        uint256 suggestedRate = _interestRateBps;
        
        if (address(riskAssessmentOracle) != address(0)) {
            try riskAssessmentOracle.assessDeveloperRisk(msg.sender) returns (uint256 risk) {
                riskScore = risk;
            } catch {
                riskScore = 500; // Default medium risk
            }
            
            try riskAssessmentOracle.calculateSuggestedInterestRate(msg.sender) returns (uint256 rate) {
                suggestedRate = rate;
            } catch {
                suggestedRate = _interestRateBps;
            }
        }
        
        emit MarketCreated(msg.sender, marketAddress, vaultId, _proposalId, _projectDataCID, suggestedRate, riskScore);
        emit MilestoneVaultCreated(vaultId, msg.sender, _loanAmount, milestones.length);
        
        return (marketAddress, vaultId);
    }

    /**
     * @dev Handle loan completion (success or default)
     * @param _vaultId Vault ID
     * @param _successful Whether loan was successful
     */
    function handleLoanCompletion(uint256 _vaultId, bool _successful) external onlyRole(VERIFIER_ROLE) {
        (address borrower,,,,,,,) = milestoneEscrowVault.getVaultInfo(_vaultId);
        require(borrower != address(0), "Invalid vault");
        
        // Update reputation staking
        if (_successful) {
            // Unlock stake and update loan stats
            (,, uint256 totalStaked, uint256 lockedStake,,,,,) = reputationStaking.getReputationProfile(borrower);
            if (lockedStake > 0) {
                reputationStaking.unlockStake(borrower, lockedStake);
            }
            
            platformMetrics.successfulLoans++;
            reputationStaking.updateLoanStats(borrower, developerTotalBorrowed[borrower], true);
        } else {
            // Handle default
            _handleDefault(_vaultId, borrower);
        }
        
        platformMetrics.activeMarkets--;
        
        emit LoanCompleted(borrower, _vaultId, _successful);
    }

    /**
     * @dev Handle loan default
     * @param _vaultId Vault ID
     * @param _borrower Borrower address
     */
    function _handleDefault(uint256 _vaultId, address _borrower) internal {
        // Slash reputation stake
        (,, uint256 totalStaked, uint256 lockedStake,,,,,) = reputationStaking.getReputationProfile(_borrower);
        if (lockedStake > 0) {
            reputationStaking.slashStake(_borrower, lockedStake, "Loan default");
        }
        
        // Record default
        (,, uint256 totalAmount, uint256 totalReleased, uint256 totalDeposited, MilestoneEscrowVault.VaultStatus status,,) = milestoneEscrowVault.getVaultInfo(_vaultId);
        uint256 outstandingAmount = totalAmount - totalReleased;
        
        if (outstandingAmount > 0) {
            defaultBlacklist.recordDefault(
                _borrower,
                totalAmount,
                outstandingAmount,
                DefaultBlacklist.DefaultReason.MissedMilestone,
                "Milestone-based loan default",
                "" // Evidence CID can be added
            );
        }
        
        // Update statistics
        platformMetrics.defaultedLoans++;
        reputationStaking.updateLoanStats(_borrower, totalAmount, false);
        
        // Consider blacklisting for repeated defaults
        (,, uint256 totalDefaults,,,,,) = defaultBlacklist.getCreditProfile(_borrower);
        if (totalDefaults >= 3) {
            defaultBlacklist.addToBlacklist(_borrower, "Multiple loan defaults");
        }
    }

    /**
     * @dev Perform comprehensive security checks
     * @param _developer Developer address
     */
    function _performSecurityChecks(address _developer) internal view returns (bool) {
        // Check blacklist
        if (defaultBlacklist.isBlacklisted(_developer)) {
            return false;
        }
        
        // Check reputation staking requirements
        if (!reputationStaking.hasProfile(_developer)) {
            return false;
        }
        
        if (!reputationStaking.meetsMinimumRequirements(_developer)) {
            return false;
        }
        
        // Check reputation score
        (,uint256 reputationScore,,,,,,,) = reputationStaking.getReputationProfile(_developer);
        if (reputationScore < MIN_REPUTATION_SCORE) {
            return false;
        }
        
        // Check legacy profile
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(_developer);
        if (!profile.isActive || profile.trustScore < MIN_TRUST_SCORE) {
            return false;
        }
        
        // Check staking requirement
        (uint256 stakedAmount,,,,) = stakingVault.getStakeInfo(_developer);
        if (stakedAmount < MINIMUM_STAKE) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Get comprehensive developer statistics
     * @param _developer Developer address
     */
    function getDeveloperStats(address _developer) external view returns (
        uint256 totalLoans,
        uint256 totalBorrowed,
        uint256 successfulLoans,
        uint256 defaultedLoans,
        uint256 reputationScore,
        uint256 trustScore,
        uint256 totalStaked,
        uint256 lockedStake,
        bool isVerified,
        bool isBlacklisted
    ) {
        // Get reputation staking stats
        (,uint256 repScore, uint256 staked, uint256 locked, uint256 totalLoansRep, uint256 successfulRep, uint256 defaultedRep,,) = reputationStaking.getReputationProfile(_developer);
        
        // Get legacy profile stats
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(_developer);
        
        return (
            totalLoansRep,
            developerTotalBorrowed[_developer],
            successfulRep,
            defaultedRep,
            repScore,
            profile.trustScore,
            staked,
            locked,
            verifiedDevelopers[_developer],
            defaultBlacklist.isBlacklisted(_developer)
        );
    }

    /**
     * @dev Get platform metrics
     */
    function getPlatformMetrics() external view returns (MarketMetrics memory) {
        return platformMetrics;
    }

    /**
     * @dev Get markets by developer
     * @param _developer Developer address
     */
    function getMarketsByDeveloper(address _developer) external view returns (address[] memory) {
        return marketsByDeveloper[_developer];
    }

    /**
     * @dev Get vaults by developer
     * @param _developer Developer address
     */
    function getVaultsByDeveloper(address _developer) external view returns (uint256[] memory) {
        return vaultsByDeveloper[_developer];
    }

    /**
     * @dev Get all markets
     */
    function getAllMarkets() external view returns (address[] memory) {
        return allMarkets;
    }

    /**
     * @dev Get all milestone vaults
     */
    function getAllMilestoneVaults() external view returns (uint256[] memory) {
        return allMilestoneVaults;
    }

    /**
     * @dev Set risk assessment oracle
     * @param _oracleAddress Oracle address
     */
    function setRiskAssessmentOracle(address _oracleAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldOracle = address(riskAssessmentOracle);
        riskAssessmentOracle = RiskAssessmentOracle(_oracleAddress);
        emit RiskOracleUpdated(oldOracle, _oracleAddress);
    }

    /**
     * @dev Set platform fee
     * @param _fee Fee in basis points
     */
    function setPlatformFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        platformFee = _fee;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Emergency function to handle stuck contracts
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_token != address(0), "Invalid token address");
        IERC20(_token).transfer(msg.sender, _amount);
    }
}

// Import statements for compatibility
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
