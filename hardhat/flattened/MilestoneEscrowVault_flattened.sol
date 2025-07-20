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


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
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


// File contracts/security/MilestoneEscrowVault.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;




/**
 * @title MilestoneEscrowVault
 * @dev Milestone-based lending system where funds are released progressively
 * @notice This contract holds loan funds in escrow and releases them based on milestone completion
 */
contract MilestoneEscrowVault is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant BORROWER_ROLE = keccak256("BORROWER_ROLE");
    bytes32 public constant LENDER_ROLE = keccak256("LENDER_ROLE");

    enum MilestoneStatus { Pending, Submitted, Verified, Rejected }
    enum VaultStatus { Funding, Active, Completed, Defaulted }

    struct Milestone {
        string description;
        uint256 releasePercentage; // Percentage of total funds to release (in basis points)
        uint256 deadline;
        string proofCID; // IPFS CID for proof submission
        MilestoneStatus status;
        uint256 verificationDeadline;
        address verifier;
        string rejectionReason;
    }

    struct Vault {
        address borrower;
        IERC20 asset;
        uint256 totalAmount;
        uint256 totalReleased;
        uint256 interestRate; // Annual interest rate in basis points
        uint256 tenor; // Loan duration in seconds
        uint256 createdAt;
        uint256 fundingDeadline;
        VaultStatus status;
        string projectCID;
        uint256 totalDeposited;
        mapping(address => uint256) lenderDeposits;
        address[] lenders;
    }

    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => Milestone[]) public vaultMilestones;
    mapping(uint256 => mapping(address => uint256)) public lenderDeposits;
    
    uint256 public nextVaultId;
    uint256 public constant VERIFICATION_PERIOD = 7 days;
    uint256 public constant FUNDING_PERIOD = 30 days;
    uint256 public constant MAX_MILESTONES = 10;

    event VaultCreated(
        uint256 indexed vaultId,
        address indexed borrower,
        uint256 amount,
        uint256 milestoneCount
    );
    event FundsDeposited(uint256 indexed vaultId, address indexed lender, uint256 amount);
    event MilestoneSubmitted(uint256 indexed vaultId, uint256 milestoneIndex, string proofCID);
    event MilestoneVerified(uint256 indexed vaultId, uint256 milestoneIndex);
    event MilestoneRejected(uint256 indexed vaultId, uint256 milestoneIndex, string reason);
    event FundsReleased(uint256 indexed vaultId, uint256 milestoneIndex, uint256 amount);
    event VaultCompleted(uint256 indexed vaultId);
    event VaultDefaulted(uint256 indexed vaultId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Create a new milestone-based escrow vault
     * @param _borrower Address of the borrower
     * @param _asset ERC20 token address
     * @param _amount Total loan amount
     * @param _interestRate Annual interest rate in basis points
     * @param _tenor Loan duration in seconds
     * @param _projectCID IPFS CID for project details
     * @param _milestoneDescriptions Array of milestone descriptions
     * @param _releasePercentages Array of release percentages for each milestone
     * @param _milestoneDeadlines Array of deadlines for each milestone
     */
    function createVault(
        address _borrower,
        address _asset,
        uint256 _amount,
        uint256 _interestRate,
        uint256 _tenor,
        string memory _projectCID,
        string[] memory _milestoneDescriptions,
        uint256[] memory _releasePercentages,
        uint256[] memory _milestoneDeadlines
    ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(_borrower != address(0), "Invalid borrower address");
        require(_asset != address(0), "Invalid asset address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_milestoneDescriptions.length > 0, "Must have at least one milestone");
        require(_milestoneDescriptions.length <= MAX_MILESTONES, "Too many milestones");
        require(
            _milestoneDescriptions.length == _releasePercentages.length &&
            _milestoneDescriptions.length == _milestoneDeadlines.length,
            "Arrays length mismatch"
        );

        // Validate release percentages sum to 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _releasePercentages.length; i++) {
            require(_releasePercentages[i] > 0, "Release percentage must be greater than 0");
            totalPercentage += _releasePercentages[i];
        }
        require(totalPercentage == 10000, "Total release percentage must equal 100%");

        uint256 vaultId = nextVaultId++;
        Vault storage vault = vaults[vaultId];
        
        vault.borrower = _borrower;
        vault.asset = IERC20(_asset);
        vault.totalAmount = _amount;
        vault.interestRate = _interestRate;
        vault.tenor = _tenor;
        vault.createdAt = block.timestamp;
        vault.fundingDeadline = block.timestamp + FUNDING_PERIOD;
        vault.status = VaultStatus.Funding;
        vault.projectCID = _projectCID;

        // Create milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            vaultMilestones[vaultId].push(Milestone({
                description: _milestoneDescriptions[i],
                releasePercentage: _releasePercentages[i],
                deadline: _milestoneDeadlines[i],
                proofCID: "",
                status: MilestoneStatus.Pending,
                verificationDeadline: 0,
                verifier: address(0),
                rejectionReason: ""
            }));
        }

        _grantRole(BORROWER_ROLE, _borrower);
        
        emit VaultCreated(vaultId, _borrower, _amount, _milestoneDescriptions.length);
        return vaultId;
    }

    /**
     * @dev Deposit funds into a vault during funding phase
     * @param _vaultId Vault identifier
     * @param _amount Amount to deposit
     */
    function depositFunds(uint256 _vaultId, uint256 _amount) external nonReentrant {
        Vault storage vault = vaults[_vaultId];
        require(vault.status == VaultStatus.Funding, "Vault not in funding phase");
        require(block.timestamp <= vault.fundingDeadline, "Funding deadline passed");
        require(_amount > 0, "Amount must be greater than 0");

        uint256 remainingAmount = vault.totalAmount - vault.totalDeposited;
        uint256 depositAmount = _amount > remainingAmount ? remainingAmount : _amount;
        
        require(depositAmount > 0, "Vault fully funded");

        vault.asset.transferFrom(msg.sender, address(this), depositAmount);
        
        if (lenderDeposits[_vaultId][msg.sender] == 0) {
            vault.lenders.push(msg.sender);
        }
        
        lenderDeposits[_vaultId][msg.sender] += depositAmount;
        vault.totalDeposited += depositAmount;

        if (vault.totalDeposited == vault.totalAmount) {
            vault.status = VaultStatus.Active;
        }

        emit FundsDeposited(_vaultId, msg.sender, depositAmount);
    }

    /**
     * @dev Submit proof for milestone completion
     * @param _vaultId Vault identifier
     * @param _milestoneIndex Index of the milestone
     * @param _proofCID IPFS CID for proof submission
     */
    function submitMilestoneProof(
        uint256 _vaultId,
        uint256 _milestoneIndex,
        string memory _proofCID
    ) external {
        Vault storage vault = vaults[_vaultId];
        require(vault.status == VaultStatus.Active, "Vault not active");
        require(msg.sender == vault.borrower, "Only borrower can submit proof");
        require(_milestoneIndex < vaultMilestones[_vaultId].length, "Invalid milestone index");

        Milestone storage milestone = vaultMilestones[_vaultId][_milestoneIndex];
        require(milestone.status == MilestoneStatus.Pending, "Milestone already submitted");
        require(block.timestamp <= milestone.deadline, "Milestone deadline passed");

        // Check if previous milestones are completed
        if (_milestoneIndex > 0) {
            require(
                vaultMilestones[_vaultId][_milestoneIndex - 1].status == MilestoneStatus.Verified,
                "Previous milestone not completed"
            );
        }

        milestone.proofCID = _proofCID;
        milestone.status = MilestoneStatus.Submitted;
        milestone.verificationDeadline = block.timestamp + VERIFICATION_PERIOD;

        emit MilestoneSubmitted(_vaultId, _milestoneIndex, _proofCID);
    }

    /**
     * @dev Verify milestone completion and release funds
     * @param _vaultId Vault identifier
     * @param _milestoneIndex Index of the milestone
     * @param _approved Whether the milestone is approved
     * @param _rejectionReason Reason for rejection (if not approved)
     */
    function verifyMilestone(
        uint256 _vaultId,
        uint256 _milestoneIndex,
        bool _approved,
        string memory _rejectionReason
    ) external onlyRole(VERIFIER_ROLE) {
        Vault storage vault = vaults[_vaultId];
        require(vault.status == VaultStatus.Active, "Vault not active");
        require(_milestoneIndex < vaultMilestones[_vaultId].length, "Invalid milestone index");

        Milestone storage milestone = vaultMilestones[_vaultId][_milestoneIndex];
        require(milestone.status == MilestoneStatus.Submitted, "Milestone not submitted");

        milestone.verifier = msg.sender;

        if (_approved) {
            milestone.status = MilestoneStatus.Verified;
            
            // Release funds
            uint256 releaseAmount = (vault.totalAmount * milestone.releasePercentage) / 10000;
            vault.totalReleased += releaseAmount;
            
            vault.asset.transfer(vault.borrower, releaseAmount);
            
            emit MilestoneVerified(_vaultId, _milestoneIndex);
            emit FundsReleased(_vaultId, _milestoneIndex, releaseAmount);

            // Check if all milestones are completed
            if (_milestoneIndex == vaultMilestones[_vaultId].length - 1) {
                vault.status = VaultStatus.Completed;
                emit VaultCompleted(_vaultId);
            }
        } else {
            milestone.status = MilestoneStatus.Rejected;
            milestone.rejectionReason = _rejectionReason;
            emit MilestoneRejected(_vaultId, _milestoneIndex, _rejectionReason);
        }
    }

    /**
     * @dev Mark vault as defaulted if milestone deadlines are missed
     * @param _vaultId Vault identifier
     */
    function markAsDefaulted(uint256 _vaultId) external onlyRole(VERIFIER_ROLE) {
        Vault storage vault = vaults[_vaultId];
        require(vault.status == VaultStatus.Active, "Vault not active");

        // Check if any milestone deadline is missed
        bool hasOverdueMilestone = false;
        for (uint256 i = 0; i < vaultMilestones[_vaultId].length; i++) {
            Milestone storage milestone = vaultMilestones[_vaultId][i];
            if (milestone.status == MilestoneStatus.Pending && block.timestamp > milestone.deadline) {
                hasOverdueMilestone = true;
                break;
            }
        }

        require(hasOverdueMilestone, "No overdue milestones");

        vault.status = VaultStatus.Defaulted;
        emit VaultDefaulted(_vaultId);
    }

    /**
     * @dev Get vault information
     * @param _vaultId Vault identifier
     */
    function getVaultInfo(uint256 _vaultId) external view returns (
        address borrower,
        address asset,
        uint256 totalAmount,
        uint256 totalReleased,
        uint256 totalDeposited,
        VaultStatus status,
        string memory projectCID,
        uint256 milestoneCount
    ) {
        Vault storage vault = vaults[_vaultId];
        return (
            vault.borrower,
            address(vault.asset),
            vault.totalAmount,
            vault.totalReleased,
            vault.totalDeposited,
            vault.status,
            vault.projectCID,
            vaultMilestones[_vaultId].length
        );
    }

    /**
     * @dev Get milestone information
     * @param _vaultId Vault identifier
     * @param _milestoneIndex Milestone index
     */
    function getMilestoneInfo(uint256 _vaultId, uint256 _milestoneIndex) external view returns (
        string memory description,
        uint256 releasePercentage,
        uint256 deadline,
        string memory proofCID,
        MilestoneStatus status,
        string memory rejectionReason
    ) {
        require(_milestoneIndex < vaultMilestones[_vaultId].length, "Invalid milestone index");
        Milestone storage milestone = vaultMilestones[_vaultId][_milestoneIndex];
        return (
            milestone.description,
            milestone.releasePercentage,
            milestone.deadline,
            milestone.proofCID,
            milestone.status,
            milestone.rejectionReason
        );
    }

    /**
     * @dev Get lender deposit amount
     * @param _vaultId Vault identifier
     * @param _lender Lender address
     */
    function getLenderDeposit(uint256 _vaultId, address _lender) external view returns (uint256) {
        return lenderDeposits[_vaultId][_lender];
    }

    /**
     * @dev Get all lenders for a vault
     * @param _vaultId Vault identifier
     */
    function getVaultLenders(uint256 _vaultId) external view returns (address[] memory) {
        return vaults[_vaultId].lenders;
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