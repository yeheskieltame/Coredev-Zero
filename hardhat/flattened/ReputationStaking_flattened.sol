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


// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/security/ReputationStaking.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;




/**
 * @title ReputationStaking
 * @dev Reputation & Identity On-Chain system for borrower trust assessment
 * @notice This contract manages reputation staking, GitHub verification, and achievement tracking
 */
contract ReputationStaking is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    struct GitHubProfile {
        string username;
        uint256 repositories;
        uint256 followers;
        uint256 following;
        uint256 publicGists;
        uint256 totalStars;
        uint256 totalForks;
        uint256 contributionScore;
        uint256 accountAge; // Account age in seconds
        bool isVerified;
        uint256 verificationTimestamp;
    }

    struct Achievement {
        string achievementType; // "hackathon", "grant", "poap", "gitcoin", etc.
        string description;
        string proofCID; // IPFS CID for proof
        uint256 value; // Numeric value/score for the achievement
        uint256 timestamp;
        address verifier;
        bool isVerified;
    }

    struct ReputationProfile {
        address owner;
        GitHubProfile github;
        Achievement[] achievements;
        uint256 totalStaked; // Total reputation tokens staked
        uint256 lockedStake; // Locked stake due to active loans
        uint256 totalLoans;
        uint256 successfulLoans;
        uint256 defaultedLoans;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 reputationScore;
        uint256 lastScoreUpdate;
        mapping(address => uint256) endorsements; // Peer endorsements
        address[] endorsers;
        bool isBlacklisted;
    }

    mapping(address => ReputationProfile) public profiles;
    mapping(string => address) public githubToAddress; // GitHub username to address mapping
    mapping(address => bool) public hasProfile;
    
    DefaultBlacklist public immutable defaultBlacklist;
    
    // Scoring weights (in basis points)
    uint256 public constant GITHUB_WEIGHT = 4000; // 40%
    uint256 public constant ACHIEVEMENT_WEIGHT = 2500; // 25%
    uint256 public constant LOAN_HISTORY_WEIGHT = 2000; // 20%
    uint256 public constant ENDORSEMENT_WEIGHT = 1500; // 15%
    
    // Minimum requirements
    uint256 public constant MIN_GITHUB_REPOS = 5;
    uint256 public constant MIN_ACCOUNT_AGE = 180 days;
    uint256 public constant MIN_CONTRIBUTION_SCORE = 100;
    
    // Reputation token (native token staking)
    uint256 public constant MIN_REPUTATION_STAKE = 0.1 ether;
    uint256 public constant MAX_REPUTATION_STAKE = 10 ether;
    
    address[] public allProfiles;
    uint256 public totalStaked;
    uint256 public totalProfiles;

    event ProfileCreated(address indexed user, string githubUsername);
    event GitHubVerified(address indexed user, string githubUsername, uint256 score);
    event AchievementAdded(address indexed user, string achievementType, uint256 value);
    event AchievementVerified(address indexed user, uint256 achievementIndex);
    event ReputationStaked(address indexed user, uint256 amount);
    event ReputationUnstaked(address indexed user, uint256 amount);
    event StakeLocked(address indexed user, uint256 amount);
    event StakeUnlocked(address indexed user, uint256 amount);
    event StakeSlashed(address indexed user, uint256 amount, string reason);
    event EndorsementGiven(address indexed endorser, address indexed endorsed, uint256 value);
    event ReputationScoreUpdated(address indexed user, uint256 newScore);

    constructor(address _defaultBlacklist) {
        require(_defaultBlacklist != address(0), "Invalid blacklist address");
        defaultBlacklist = DefaultBlacklist(_defaultBlacklist);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @dev Create a new reputation profile
     * @param _githubUsername GitHub username to link
     */
    function createProfile(string memory _githubUsername) external {
        require(!hasProfile[msg.sender], "Profile already exists");
        require(bytes(_githubUsername).length > 0, "GitHub username required");
        require(githubToAddress[_githubUsername] == address(0), "GitHub username already linked");
        require(!defaultBlacklist.isBlacklisted(msg.sender), "Address is blacklisted");

        ReputationProfile storage profile = profiles[msg.sender];
        profile.owner = msg.sender;
        profile.github.username = _githubUsername;
        profile.lastScoreUpdate = block.timestamp;
        
        githubToAddress[_githubUsername] = msg.sender;
        hasProfile[msg.sender] = true;
        allProfiles.push(msg.sender);
        totalProfiles++;

        emit ProfileCreated(msg.sender, _githubUsername);
    }

    /**
     * @dev Verify GitHub profile data (called by oracle)
     * @param _user User address
     * @param _repositories Number of repositories
     * @param _followers Number of followers
     * @param _following Number of following
     * @param _publicGists Number of public gists
     * @param _totalStars Total stars received
     * @param _totalForks Total forks received
     * @param _contributionScore Calculated contribution score
     * @param _accountAge Account age in seconds
     */
    function verifyGitHubProfile(
        address _user,
        uint256 _repositories,
        uint256 _followers,
        uint256 _following,
        uint256 _publicGists,
        uint256 _totalStars,
        uint256 _totalForks,
        uint256 _contributionScore,
        uint256 _accountAge
    ) external onlyRole(ORACLE_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        GitHubProfile storage github = profile.github;
        
        github.repositories = _repositories;
        github.followers = _followers;
        github.following = _following;
        github.publicGists = _publicGists;
        github.totalStars = _totalStars;
        github.totalForks = _totalForks;
        github.contributionScore = _contributionScore;
        github.accountAge = _accountAge;
        github.isVerified = true;
        github.verificationTimestamp = block.timestamp;
        
        // Update reputation score
        _updateReputationScore(_user);
        
        emit GitHubVerified(_user, github.username, github.contributionScore);
    }

    /**
     * @dev Add achievement to profile
     * @param _achievementType Type of achievement
     * @param _description Description of achievement
     * @param _proofCID IPFS CID for proof
     * @param _value Numeric value/score
     */
    function addAchievement(
        string memory _achievementType,
        string memory _description,
        string memory _proofCID,
        uint256 _value
    ) external {
        require(hasProfile[msg.sender], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[msg.sender];
        profile.achievements.push(Achievement({
            achievementType: _achievementType,
            description: _description,
            proofCID: _proofCID,
            value: _value,
            timestamp: block.timestamp,
            verifier: address(0),
            isVerified: false
        }));
        
        emit AchievementAdded(msg.sender, _achievementType, _value);
    }

    /**
     * @dev Verify achievement
     * @param _user User address
     * @param _achievementIndex Index of achievement to verify
     */
    function verifyAchievement(address _user, uint256 _achievementIndex) external onlyRole(VERIFIER_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(_achievementIndex < profile.achievements.length, "Invalid achievement index");
        
        Achievement storage achievement = profile.achievements[_achievementIndex];
        require(!achievement.isVerified, "Achievement already verified");
        
        achievement.isVerified = true;
        achievement.verifier = msg.sender;
        
        // Update reputation score
        _updateReputationScore(_user);
        
        emit AchievementVerified(_user, _achievementIndex);
    }

    /**
     * @dev Stake reputation (native token)
     */
    function stakeReputation() external payable {
        require(hasProfile[msg.sender], "Profile does not exist");
        require(msg.value >= MIN_REPUTATION_STAKE, "Minimum stake not met");
        require(!defaultBlacklist.isBlacklisted(msg.sender), "Address is blacklisted");
        
        ReputationProfile storage profile = profiles[msg.sender];
        require(profile.totalStaked + msg.value <= MAX_REPUTATION_STAKE, "Maximum stake exceeded");
        
        profile.totalStaked += msg.value;
        totalStaked += msg.value;
        
        // Update reputation score
        _updateReputationScore(msg.sender);
        
        emit ReputationStaked(msg.sender, msg.value);
    }

    /**
     * @dev Unstake reputation (if not locked)
     * @param _amount Amount to unstake
     */
    function unstakeReputation(uint256 _amount) external nonReentrant {
        require(hasProfile[msg.sender], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[msg.sender];
        require(_amount > 0, "Amount must be greater than 0");
        require(profile.totalStaked >= _amount, "Insufficient staked amount");
        require(profile.totalStaked - profile.lockedStake >= _amount, "Insufficient unlocked stake");
        
        profile.totalStaked -= _amount;
        totalStaked -= _amount;
        
        // Update reputation score
        _updateReputationScore(msg.sender);
        
        payable(msg.sender).transfer(_amount);
        
        emit ReputationUnstaked(msg.sender, _amount);
    }

    /**
     * @dev Lock stake for active loan
     * @param _user User address
     * @param _amount Amount to lock
     */
    function lockStake(address _user, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(profile.totalStaked >= profile.lockedStake + _amount, "Insufficient unlocked stake");
        
        profile.lockedStake += _amount;
        
        emit StakeLocked(_user, _amount);
    }

    /**
     * @dev Unlock stake after loan completion
     * @param _user User address
     * @param _amount Amount to unlock
     */
    function unlockStake(address _user, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(profile.lockedStake >= _amount, "Insufficient locked stake");
        
        profile.lockedStake -= _amount;
        
        emit StakeUnlocked(_user, _amount);
    }

    /**
     * @dev Slash stake for default
     * @param _user User address
     * @param _amount Amount to slash
     * @param _reason Reason for slashing
     */
    function slashStake(address _user, uint256 _amount, string memory _reason) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        require(profile.lockedStake >= _amount, "Insufficient locked stake");
        
        profile.lockedStake -= _amount;
        profile.totalStaked -= _amount;
        totalStaked -= _amount;
        
        // Update reputation score
        _updateReputationScore(_user);
        
        emit StakeSlashed(_user, _amount, _reason);
    }

    /**
     * @dev Give endorsement to another user
     * @param _endorsed User to endorse
     * @param _value Endorsement value
     */
    function giveEndorsement(address _endorsed, uint256 _value) external {
        require(hasProfile[msg.sender], "Endorser profile does not exist");
        require(hasProfile[_endorsed], "Endorsed profile does not exist");
        require(_endorsed != msg.sender, "Cannot endorse yourself");
        require(_value > 0, "Endorsement value must be greater than 0");
        
        ReputationProfile storage endorsedProfile = profiles[_endorsed];
        
        // If first endorsement from this user, add to endorsers list
        if (endorsedProfile.endorsements[msg.sender] == 0) {
            endorsedProfile.endorsers.push(msg.sender);
        }
        
        endorsedProfile.endorsements[msg.sender] = _value;
        
        // Update reputation score
        _updateReputationScore(_endorsed);
        
        emit EndorsementGiven(msg.sender, _endorsed, _value);
    }

    /**
     * @dev Update loan statistics
     * @param _user User address
     * @param _loanAmount Loan amount
     * @param _isSuccessful Whether loan was successful
     */
    function updateLoanStats(address _user, uint256 _loanAmount, bool _isSuccessful) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        profile.totalLoans++;
        profile.totalBorrowed += _loanAmount;
        
        if (_isSuccessful) {
            profile.successfulLoans++;
            profile.totalRepaid += _loanAmount;
        } else {
            profile.defaultedLoans++;
        }
        
        // Update reputation score
        _updateReputationScore(_user);
    }

    /**
     * @dev Calculate and update reputation score
     * @param _user User address
     */
    function _updateReputationScore(address _user) internal {
        ReputationProfile storage profile = profiles[_user];
        
        uint256 githubScore = _calculateGitHubScore(_user);
        uint256 achievementScore = _calculateAchievementScore(_user);
        uint256 loanHistoryScore = _calculateLoanHistoryScore(_user);
        uint256 endorsementScore = _calculateEndorsementScore(_user);
        
        uint256 totalScore = (githubScore * GITHUB_WEIGHT) / 10000 +
                           (achievementScore * ACHIEVEMENT_WEIGHT) / 10000 +
                           (loanHistoryScore * LOAN_HISTORY_WEIGHT) / 10000 +
                           (endorsementScore * ENDORSEMENT_WEIGHT) / 10000;
        
        profile.reputationScore = totalScore;
        profile.lastScoreUpdate = block.timestamp;
        
        emit ReputationScoreUpdated(_user, totalScore);
    }

    /**
     * @dev Calculate GitHub score
     * @param _user User address
     */
    function _calculateGitHubScore(address _user) internal view returns (uint256) {
        GitHubProfile storage github = profiles[_user].github;
        
        if (!github.isVerified) return 0;
        
        uint256 score = 0;
        
        // Repository count (0-200 points)
        score += github.repositories > 100 ? 200 : github.repositories * 2;
        
        // Stars and forks (0-300 points)
        uint256 starForkScore = (github.totalStars + github.totalForks) / 10;
        score += starForkScore > 300 ? 300 : starForkScore;
        
        // Contribution score (0-300 points)
        score += github.contributionScore > 300 ? 300 : github.contributionScore;
        
        // Account age bonus (0-100 points)
        uint256 ageBonus = github.accountAge / (365 days);
        score += ageBonus > 100 ? 100 : ageBonus;
        
        // Followers bonus (0-100 points)
        uint256 followerBonus = github.followers / 10;
        score += followerBonus > 100 ? 100 : followerBonus;
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Calculate achievement score
     * @param _user User address
     */
    function _calculateAchievementScore(address _user) internal view returns (uint256) {
        ReputationProfile storage profile = profiles[_user];
        
        uint256 score = 0;
        for (uint256 i = 0; i < profile.achievements.length; i++) {
            if (profile.achievements[i].isVerified) {
                score += profile.achievements[i].value;
            }
        }
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Calculate loan history score
     * @param _user User address
     */
    function _calculateLoanHistoryScore(address _user) internal view returns (uint256) {
        ReputationProfile storage profile = profiles[_user];
        
        if (profile.totalLoans == 0) return 500; // Neutral score for new users
        
        uint256 successRate = (profile.successfulLoans * 100) / profile.totalLoans;
        uint256 score = (successRate * 10); // 0-1000 points based on success rate
        
        // Bonus for loan volume
        uint256 volumeBonus = profile.totalRepaid / 1 ether; // 1 point per ETH repaid
        score += volumeBonus > 100 ? 100 : volumeBonus;
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Calculate endorsement score
     * @param _user User address
     */
    function _calculateEndorsementScore(address _user) internal view returns (uint256) {
        ReputationProfile storage profile = profiles[_user];
        
        uint256 score = 0;
        for (uint256 i = 0; i < profile.endorsers.length; i++) {
            address endorser = profile.endorsers[i];
            uint256 endorsementValue = profile.endorsements[endorser];
            
            // Weight endorsement by endorser's reputation
            uint256 endorserScore = profiles[endorser].reputationScore;
            uint256 weightedValue = (endorsementValue * endorserScore) / 1000;
            
            score += weightedValue;
        }
        
        return score > 1000 ? 1000 : score;
    }

    /**
     * @dev Get reputation profile info
     * @param _user User address
     */
    function getReputationProfile(address _user) external view returns (
        string memory githubUsername,
        uint256 reputationScore,
        uint256 userTotalStaked,
        uint256 lockedStake,
        uint256 totalLoans,
        uint256 successfulLoans,
        uint256 defaultedLoans,
        bool isVerified,
        bool isBlacklisted
    ) {
        require(hasProfile[_user], "Profile does not exist");
        
        ReputationProfile storage profile = profiles[_user];
        return (
            profile.github.username,
            profile.reputationScore,
            profile.totalStaked,
            profile.lockedStake,
            profile.totalLoans,
            profile.successfulLoans,
            profile.defaultedLoans,
            profile.github.isVerified,
            profile.isBlacklisted
        );
    }

    /**
     * @dev Get GitHub profile info
     * @param _user User address
     */
    function getGitHubProfile(address _user) external view returns (GitHubProfile memory) {
        require(hasProfile[_user], "Profile does not exist");
        return profiles[_user].github;
    }

    /**
     * @dev Get achievement info
     * @param _user User address
     * @param _index Achievement index
     */
    function getAchievement(address _user, uint256 _index) external view returns (Achievement memory) {
        require(hasProfile[_user], "Profile does not exist");
        require(_index < profiles[_user].achievements.length, "Invalid achievement index");
        return profiles[_user].achievements[_index];
    }

    /**
     * @dev Get total achievements count
     * @param _user User address
     */
    function getAchievementCount(address _user) external view returns (uint256) {
        require(hasProfile[_user], "Profile does not exist");
        return profiles[_user].achievements.length;
    }

    /**
     * @dev Get endorsement value
     * @param _endorsed Endorsed user
     * @param _endorser Endorser
     */
    function getEndorsement(address _endorsed, address _endorser) external view returns (uint256) {
        require(hasProfile[_endorsed], "Profile does not exist");
        return profiles[_endorsed].endorsements[_endorser];
    }

    /**
     * @dev Check if user meets minimum requirements
     * @param _user User address
     */
    function meetsMinimumRequirements(address _user) external view returns (bool) {
        if (!hasProfile[_user]) return false;
        
        ReputationProfile storage profile = profiles[_user];
        GitHubProfile storage github = profile.github;
        
        return github.isVerified &&
               github.repositories >= MIN_GITHUB_REPOS &&
               github.accountAge >= MIN_ACCOUNT_AGE &&
               github.contributionScore >= MIN_CONTRIBUTION_SCORE &&
               profile.totalStaked >= MIN_REPUTATION_STAKE &&
               !defaultBlacklist.isBlacklisted(_user);
    }

    /**
     * @dev Get all profiles
     */
    function getAllProfiles() external view returns (address[] memory) {
        return allProfiles;
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