// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title DefaultBlacklist
 * @dev On-chain credit history and blacklist management
 * @notice This contract manages defaulted borrowers and provides credit history tracking
 */
contract DefaultBlacklist is AccessControl, Pausable {
    bytes32 public constant BLACKLIST_MANAGER_ROLE = keccak256("BLACKLIST_MANAGER_ROLE");
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");

    enum DefaultReason {
        MissedPayment,
        MissedMilestone,
        Fraud,
        Abandonment,
        Other
    }

    enum AppealStatus {
        None,
        Pending,
        Approved,
        Rejected
    }

    struct DefaultRecord {
        address borrower;
        address reporter; // Contract or address that reported the default
        uint256 loanAmount;
        uint256 outstandingAmount;
        DefaultReason reason;
        string description;
        uint256 timestamp;
        uint256 blockNumber;
        string evidenceCID; // IPFS CID for evidence
        bool isResolved;
        uint256 resolvedTimestamp;
        string resolutionNotes;
    }

    struct AppealRecord {
        uint256 defaultId;
        address appellant;
        string appealReason;
        string evidenceCID;
        uint256 submissionTime;
        AppealStatus status;
        address reviewer;
        string reviewNotes;
        uint256 reviewTime;
    }

    struct CreditProfile {
        address borrower;
        uint256 totalLoans;
        uint256 totalBorrowed;
        uint256 totalDefaults;
        uint256 totalDefaultAmount;
        uint256 totalResolved;
        uint256 totalResolvedAmount;
        uint256 creditScore; // 0-1000 score
        uint256 lastActivity;
        bool isBlacklisted;
        uint256 blacklistTimestamp;
        string blacklistReason;
    }

    mapping(address => bool) public isBlacklisted;
    mapping(address => CreditProfile) public creditProfiles;
    mapping(address => uint256[]) public defaultsByAddress;
    mapping(uint256 => DefaultRecord) public defaultRecords;
    mapping(uint256 => AppealRecord) public appealRecords;
    mapping(address => uint256[]) public appealsByAddress;
    
    uint256 public nextDefaultId = 1;
    uint256 public nextAppealId = 1;
    uint256 public totalDefaults;
    uint256 public totalResolvedDefaults;
    uint256 public totalBlacklisted;
    
    // Configuration
    uint256 public constant APPEAL_PERIOD = 30 days;
    uint256 public constant MIN_CREDIT_SCORE = 100;
    uint256 public constant MAX_CREDIT_SCORE = 1000;
    uint256 public constant DEFAULT_CREDIT_SCORE = 600;
    
    address[] public allDefaulters;
    address[] public allBlacklisted;

    event DefaultRecorded(
        uint256 indexed defaultId,
        address indexed borrower,
        address indexed reporter,
        uint256 amount,
        DefaultReason reason
    );
    event DefaultResolved(
        uint256 indexed defaultId,
        address indexed borrower,
        string resolutionNotes
    );
    event BlacklistAdded(address indexed borrower, string reason);
    event BlacklistRemoved(address indexed borrower, string reason);
    event AppealSubmitted(
        uint256 indexed appealId,
        uint256 indexed defaultId,
        address indexed appellant
    );
    event AppealReviewed(
        uint256 indexed appealId,
        AppealStatus status,
        address indexed reviewer
    );
    event CreditScoreUpdated(address indexed borrower, uint256 newScore);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BLACKLIST_MANAGER_ROLE, msg.sender);
        _grantRole(REPORTER_ROLE, msg.sender);
    }

    /**
     * @dev Record a default
     * @param _borrower Borrower address
     * @param _loanAmount Total loan amount
     * @param _outstandingAmount Outstanding amount
     * @param _reason Reason for default
     * @param _description Description of the default
     * @param _evidenceCID IPFS CID for evidence
     */
    function recordDefault(
        address _borrower,
        uint256 _loanAmount,
        uint256 _outstandingAmount,
        DefaultReason _reason,
        string memory _description,
        string memory _evidenceCID
    ) external onlyRole(REPORTER_ROLE) returns (uint256) {
        require(_borrower != address(0), "Invalid borrower address");
        require(_loanAmount > 0, "Loan amount must be greater than 0");
        require(_outstandingAmount > 0, "Outstanding amount must be greater than 0");
        require(_outstandingAmount <= _loanAmount, "Outstanding amount cannot exceed loan amount");
        
        uint256 defaultId = nextDefaultId++;
        
        DefaultRecord storage defaultRecord = defaultRecords[defaultId];
        defaultRecord.borrower = _borrower;
        defaultRecord.reporter = msg.sender;
        defaultRecord.loanAmount = _loanAmount;
        defaultRecord.outstandingAmount = _outstandingAmount;
        defaultRecord.reason = _reason;
        defaultRecord.description = _description;
        defaultRecord.timestamp = block.timestamp;
        defaultRecord.blockNumber = block.number;
        defaultRecord.evidenceCID = _evidenceCID;
        defaultRecord.isResolved = false;
        
        // Update credit profile
        CreditProfile storage profile = creditProfiles[_borrower];
        if (profile.borrower == address(0)) {
            profile.borrower = _borrower;
            profile.creditScore = DEFAULT_CREDIT_SCORE;
            allDefaulters.push(_borrower);
        }
        
        profile.totalDefaults++;
        profile.totalDefaultAmount += _outstandingAmount;
        profile.lastActivity = block.timestamp;
        
        // Add to borrower's default list
        defaultsByAddress[_borrower].push(defaultId);
        
        totalDefaults++;
        
        // Update credit score
        _updateCreditScore(_borrower);
        
        emit DefaultRecorded(defaultId, _borrower, msg.sender, _loanAmount, _reason);
        
        return defaultId;
    }

    /**
     * @dev Add address to blacklist
     * @param _borrower Borrower address
     * @param _reason Reason for blacklisting
     */
    function addToBlacklist(address _borrower, string memory _reason) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        require(_borrower != address(0), "Invalid borrower address");
        require(!isBlacklisted[_borrower], "Address already blacklisted");
        
        isBlacklisted[_borrower] = true;
        
        CreditProfile storage profile = creditProfiles[_borrower];
        if (profile.borrower == address(0)) {
            profile.borrower = _borrower;
            profile.creditScore = DEFAULT_CREDIT_SCORE;
            allDefaulters.push(_borrower);
        }
        
        profile.isBlacklisted = true;
        profile.blacklistTimestamp = block.timestamp;
        profile.blacklistReason = _reason;
        profile.creditScore = MIN_CREDIT_SCORE; // Set to minimum score
        
        allBlacklisted.push(_borrower);
        totalBlacklisted++;
        
        emit BlacklistAdded(_borrower, _reason);
        emit CreditScoreUpdated(_borrower, MIN_CREDIT_SCORE);
    }

    /**
     * @dev Remove address from blacklist
     * @param _borrower Borrower address
     * @param _reason Reason for removal
     */
    function removeFromBlacklist(address _borrower, string memory _reason) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        require(_borrower != address(0), "Invalid borrower address");
        require(isBlacklisted[_borrower], "Address not blacklisted");
        
        isBlacklisted[_borrower] = false;
        
        CreditProfile storage profile = creditProfiles[_borrower];
        profile.isBlacklisted = false;
        profile.blacklistReason = "";
        
        // Remove from blacklisted list
        for (uint256 i = 0; i < allBlacklisted.length; i++) {
            if (allBlacklisted[i] == _borrower) {
                allBlacklisted[i] = allBlacklisted[allBlacklisted.length - 1];
                allBlacklisted.pop();
                break;
            }
        }
        
        totalBlacklisted--;
        
        // Recalculate credit score
        _updateCreditScore(_borrower);
        
        emit BlacklistRemoved(_borrower, _reason);
    }

    /**
     * @dev Internal function to resolve a default
     * @param _defaultId Default ID
     * @param _resolutionNotes Resolution notes
     */
    function _resolveDefault(uint256 _defaultId, string memory _resolutionNotes) internal {
        require(_defaultId < nextDefaultId, "Invalid default ID");
        
        DefaultRecord storage defaultRecord = defaultRecords[_defaultId];
        require(!defaultRecord.isResolved, "Default already resolved");
        
        defaultRecord.isResolved = true;
        defaultRecord.resolvedTimestamp = block.timestamp;
        defaultRecord.resolutionNotes = _resolutionNotes;
        
        // Update credit profile
        CreditProfile storage profile = creditProfiles[defaultRecord.borrower];
        profile.totalResolved++;
        profile.totalResolvedAmount += defaultRecord.outstandingAmount;
        profile.lastActivity = block.timestamp;
        
        totalResolvedDefaults++;
        
        // Update credit score
        _updateCreditScore(defaultRecord.borrower);
        
        emit DefaultResolved(_defaultId, defaultRecord.borrower, _resolutionNotes);
    }

    /**
     * @dev Resolve a default (public function)
     * @param _defaultId Default ID
     * @param _resolutionNotes Resolution notes
     */
    function resolveDefault(uint256 _defaultId, string memory _resolutionNotes) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        _resolveDefault(_defaultId, _resolutionNotes);
    }

    /**
     * @dev Submit appeal for a default
     * @param _defaultId Default ID
     * @param _appealReason Reason for appeal
     * @param _evidenceCID IPFS CID for evidence
     */
    function submitAppeal(
        uint256 _defaultId,
        string memory _appealReason,
        string memory _evidenceCID
    ) external returns (uint256) {
        require(_defaultId < nextDefaultId, "Invalid default ID");
        
        DefaultRecord storage defaultRecord = defaultRecords[_defaultId];
        require(defaultRecord.borrower == msg.sender, "Only borrower can appeal");
        require(!defaultRecord.isResolved, "Default already resolved");
        require(
            block.timestamp <= defaultRecord.timestamp + APPEAL_PERIOD,
            "Appeal period expired"
        );
        
        uint256 appealId = nextAppealId++;
        
        AppealRecord storage appeal = appealRecords[appealId];
        appeal.defaultId = _defaultId;
        appeal.appellant = msg.sender;
        appeal.appealReason = _appealReason;
        appeal.evidenceCID = _evidenceCID;
        appeal.submissionTime = block.timestamp;
        appeal.status = AppealStatus.Pending;
        
        appealsByAddress[msg.sender].push(appealId);
        
        emit AppealSubmitted(appealId, _defaultId, msg.sender);
        
        return appealId;
    }

    /**
     * @dev Review appeal
     * @param _appealId Appeal ID
     * @param _approved Whether appeal is approved
     * @param _reviewNotes Review notes
     */
    function reviewAppeal(
        uint256 _appealId,
        bool _approved,
        string memory _reviewNotes
    ) external onlyRole(BLACKLIST_MANAGER_ROLE) {
        require(_appealId < nextAppealId, "Invalid appeal ID");
        
        AppealRecord storage appeal = appealRecords[_appealId];
        require(appeal.status == AppealStatus.Pending, "Appeal not pending");
        
        appeal.status = _approved ? AppealStatus.Approved : AppealStatus.Rejected;
        appeal.reviewer = msg.sender;
        appeal.reviewNotes = _reviewNotes;
        appeal.reviewTime = block.timestamp;
        
        if (_approved) {
            // Resolve the default
            _resolveDefault(appeal.defaultId, _reviewNotes);
        }
        
        emit AppealReviewed(_appealId, appeal.status, msg.sender);
    }

    /**
     * @dev Update loan statistics for credit score calculation
     * @param _borrower Borrower address
     * @param _loanAmount Loan amount
     * @param _totalBorrowed Total amount borrowed
     */
    function updateLoanStats(
        address _borrower,
        uint256 _loanAmount,
        uint256 _totalBorrowed
    ) external onlyRole(REPORTER_ROLE) {
        require(_borrower != address(0), "Invalid borrower address");
        
        CreditProfile storage profile = creditProfiles[_borrower];
        if (profile.borrower == address(0)) {
            profile.borrower = _borrower;
            profile.creditScore = DEFAULT_CREDIT_SCORE;
            allDefaulters.push(_borrower);
        }
        
        profile.totalLoans++;
        profile.totalBorrowed = _totalBorrowed;
        profile.lastActivity = block.timestamp;
        
        // Update credit score
        _updateCreditScore(_borrower);
    }

    /**
     * @dev Calculate and update credit score
     * @param _borrower Borrower address
     */
    function _updateCreditScore(address _borrower) internal {
        CreditProfile storage profile = creditProfiles[_borrower];
        
        if (profile.isBlacklisted) {
            profile.creditScore = MIN_CREDIT_SCORE;
            emit CreditScoreUpdated(_borrower, MIN_CREDIT_SCORE);
            return;
        }
        
        uint256 score = DEFAULT_CREDIT_SCORE;
        
        // Positive factors
        if (profile.totalLoans > 0) {
            // Successful loan completion rate
            uint256 successfulLoans = profile.totalLoans - profile.totalDefaults;
            uint256 successRate = (successfulLoans * 100) / profile.totalLoans;
            score += (successRate * 2); // Up to 200 points for 100% success rate
            
            // Loan volume bonus
            uint256 volumeBonus = profile.totalBorrowed / 1 ether; // 1 point per ETH
            score += volumeBonus > 100 ? 100 : volumeBonus;
        }
        
        // Negative factors
        if (profile.totalDefaults > 0) {
            // Default rate penalty
            uint256 defaultRate = (profile.totalDefaults * 100) / profile.totalLoans;
            score -= (defaultRate * 5); // Up to 500 points penalty for 100% default rate
            
            // Outstanding amount penalty
            uint256 outstandingRatio = (profile.totalDefaultAmount * 100) / profile.totalBorrowed;
            score -= (outstandingRatio * 2); // Up to 200 points penalty
        }
        
        // Resolution bonus
        if (profile.totalDefaults > 0 && profile.totalResolved > 0) {
            uint256 resolutionRate = (profile.totalResolved * 100) / profile.totalDefaults;
            score += (resolutionRate * 1); // Up to 100 points for resolving defaults
        }
        
        // Ensure score is within bounds
        if (score < MIN_CREDIT_SCORE) {
            score = MIN_CREDIT_SCORE;
        } else if (score > MAX_CREDIT_SCORE) {
            score = MAX_CREDIT_SCORE;
        }
        
        profile.creditScore = score;
        
        emit CreditScoreUpdated(_borrower, score);
    }

    /**
     * @dev Get default record
     * @param _defaultId Default ID
     */
    function getDefaultRecord(uint256 _defaultId) external view returns (
        address borrower,
        address reporter,
        uint256 loanAmount,
        uint256 outstandingAmount,
        DefaultReason reason,
        string memory description,
        uint256 timestamp,
        bool isResolved
    ) {
        require(_defaultId < nextDefaultId, "Invalid default ID");
        
        DefaultRecord storage record = defaultRecords[_defaultId];
        return (
            record.borrower,
            record.reporter,
            record.loanAmount,
            record.outstandingAmount,
            record.reason,
            record.description,
            record.timestamp,
            record.isResolved
        );
    }

    /**
     * @dev Get credit profile
     * @param _borrower Borrower address
     */
    function getCreditProfile(address _borrower) external view returns (
        uint256 totalLoansCount,
        uint256 totalBorrowedAmount,
        uint256 totalDefaultsCount,
        uint256 totalDefaultAmountValue,
        uint256 totalResolvedCount,
        uint256 creditScore,
        bool blacklistStatus,
        string memory blacklistReason
    ) {
        CreditProfile storage profile = creditProfiles[_borrower];
        return (
            profile.totalLoans,
            profile.totalBorrowed,
            profile.totalDefaults,
            profile.totalDefaultAmount,
            profile.totalResolved,
            profile.creditScore,
            profile.isBlacklisted,
            profile.blacklistReason
        );
    }

    /**
     * @dev Get defaults by address
     * @param _borrower Borrower address
     */
    function getDefaultsByAddress(address _borrower) external view returns (uint256[] memory) {
        return defaultsByAddress[_borrower];
    }

    /**
     * @dev Get appeals by address
     * @param _borrower Borrower address
     */
    function getAppealsByAddress(address _borrower) external view returns (uint256[] memory) {
        return appealsByAddress[_borrower];
    }

    /**
     * @dev Get appeal record
     * @param _appealId Appeal ID
     */
    function getAppealRecord(uint256 _appealId) external view returns (
        uint256 defaultId,
        address appellant,
        string memory appealReason,
        AppealStatus status,
        address reviewer,
        string memory reviewNotes
    ) {
        require(_appealId < nextAppealId, "Invalid appeal ID");
        
        AppealRecord storage appeal = appealRecords[_appealId];
        return (
            appeal.defaultId,
            appeal.appellant,
            appeal.appealReason,
            appeal.status,
            appeal.reviewer,
            appeal.reviewNotes
        );
    }

    /**
     * @dev Check if address is blacklisted
     * @param _borrower Borrower address
     */
    function isAddressBlacklisted(address _borrower) external view returns (bool) {
        return isBlacklisted[_borrower];
    }

    /**
     * @dev Get all blacklisted addresses
     */
    function getAllBlacklisted() external view returns (address[] memory) {
        return allBlacklisted;
    }

    /**
     * @dev Get all defaulters
     */
    function getAllDefaulters() external view returns (address[] memory) {
        return allDefaulters;
    }

    /**
     * @dev Get platform statistics
     */
    function getPlatformStats() external view returns (
        uint256 totalDefaultsCount,
        uint256 totalResolvedCount,
        uint256 totalBlacklistedCount,
        uint256 totalDefaultersCount
    ) {
        return (
            totalDefaults,
            totalResolvedDefaults,
            totalBlacklisted,
            allDefaulters.length
        );
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
