// Sources flattened with hardhat v2.26.0 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/access/IAccessControl.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (access/IAccessControl.sol)

pragma solidity ^0.8.20;

/**
 * @dev External interface of AccessControl declared to support ERC-165 detection.
 */
interface IAccessControl {
    /**
     * @dev The `account` is missing a role.
     */
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

    /**
     * @dev The caller of a function is not the expected one.
     *
     * NOTE: Don't confuse with {AccessControlUnauthorizedAccount}.
     */
    error AccessControlBadConfirmation();

    /**
     * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
     *
     * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
     * {RoleAdminChanged} not being emitted to signal this.
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call. This account bears the admin role (for the granted role).
     * Expected in cases where the role was granted using the internal {AccessControl-_grantRole}.
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) external view returns (bool);

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {AccessControl-_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been granted `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `callerConfirmation`.
     */
    function renounceRole(bytes32 role, address callerConfirmation) external;
}


// File @openzeppelin/contracts/utils/Context.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

pragma solidity ^0.8.20;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}


// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/introspection/IERC165.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/utils/introspection/ERC165.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/introspection/ERC165.sol)

pragma solidity ^0.8.20;

/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC-165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 */
abstract contract ERC165 is IERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}


// File @openzeppelin/contracts/access/AccessControl.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (access/AccessControl.sol)

pragma solidity ^0.8.20;



/**
 * @dev Contract module that allows children to implement role-based access
 * control mechanisms. This is a lightweight version that doesn't allow enumerating role
 * members except through off-chain means by accessing the contract event logs. Some
 * applications may benefit from on-chain enumerability, for those cases see
 * {AccessControlEnumerable}.
 *
 * Roles are referred to by their `bytes32` identifier. These should be exposed
 * in the external API and be unique. The best way to achieve this is by
 * using `public constant` hash digests:
 *
 * ```solidity
 * bytes32 public constant MY_ROLE = keccak256("MY_ROLE");
 * ```
 *
 * Roles can be used to represent a set of permissions. To restrict access to a
 * function call, use {hasRole}:
 *
 * ```solidity
 * function foo() public {
 *     require(hasRole(MY_ROLE, msg.sender));
 *     ...
 * }
 * ```
 *
 * Roles can be granted and revoked dynamically via the {grantRole} and
 * {revokeRole} functions. Each role has an associated admin role, and only
 * accounts that have a role's admin role can call {grantRole} and {revokeRole}.
 *
 * By default, the admin role for all roles is `DEFAULT_ADMIN_ROLE`, which means
 * that only accounts with this role will be able to grant or revoke other
 * roles. More complex role relationships can be created by using
 * {_setRoleAdmin}.
 *
 * WARNING: The `DEFAULT_ADMIN_ROLE` is also its own admin: it has permission to
 * grant and revoke this role. Extra precautions should be taken to secure
 * accounts that have been granted it. We recommend using {AccessControlDefaultAdminRules}
 * to enforce additional security measures for this role.
 */
abstract contract AccessControl is Context, IAccessControl, ERC165 {
    struct RoleData {
        mapping(address account => bool) hasRole;
        bytes32 adminRole;
    }

    mapping(bytes32 role => RoleData) private _roles;

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    /**
     * @dev Modifier that checks that an account has a specific role. Reverts
     * with an {AccessControlUnauthorizedAccount} error including the required role.
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(bytes32 role, address account) public view virtual returns (bool) {
        return _roles[role].hasRole[account];
    }

    /**
     * @dev Reverts with an {AccessControlUnauthorizedAccount} error if `_msgSender()`
     * is missing `role`. Overriding this function changes the behavior of the {onlyRole} modifier.
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, _msgSender());
    }

    /**
     * @dev Reverts with an {AccessControlUnauthorizedAccount} error if `account`
     * is missing `role`.
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roles[role].adminRole;
    }

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleGranted} event.
     */
    function grantRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     *
     * May emit a {RoleRevoked} event.
     */
    function revokeRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been revoked `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `callerConfirmation`.
     *
     * May emit a {RoleRevoked} event.
     */
    function renounceRole(bytes32 role, address callerConfirmation) public virtual {
        if (callerConfirmation != _msgSender()) {
            revert AccessControlBadConfirmation();
        }

        _revokeRole(role, callerConfirmation);
    }

    /**
     * @dev Sets `adminRole` as ``role``'s admin role.
     *
     * Emits a {RoleAdminChanged} event.
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Attempts to grant `role` to `account` and returns a boolean indicating if `role` was granted.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleGranted} event.
     */
    function _grantRole(bytes32 role, address account) internal virtual returns (bool) {
        if (!hasRole(role, account)) {
            _roles[role].hasRole[account] = true;
            emit RoleGranted(role, account, _msgSender());
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Attempts to revoke `role` from `account` and returns a boolean indicating if `role` was revoked.
     *
     * Internal function without access restriction.
     *
     * May emit a {RoleRevoked} event.
     */
    function _revokeRole(bytes32 role, address account) internal virtual returns (bool) {
        if (hasRole(role, account)) {
            _roles[role].hasRole[account] = false;
            emit RoleRevoked(role, account, _msgSender());
            return true;
        } else {
            return false;
        }
    }
}


// File @openzeppelin/contracts/utils/Pausable.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}


// File contracts/security/DefaultBlacklist.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


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