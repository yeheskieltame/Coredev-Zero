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


// File @openzeppelin/contracts/access/Ownable.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/interfaces/IERC165.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC165.sol)

pragma solidity ^0.8.20;


// File @openzeppelin/contracts/token/ERC721/IERC721.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.20;

/**
 * @dev Required interface of an ERC-721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC-721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or
     *   {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC-721
     * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
     * understand this adds an external call which potentially creates a reentrancy vulnerability.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}


// File @openzeppelin/contracts/interfaces/IERC721.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC721.sol)

pragma solidity ^0.8.20;


// File @openzeppelin/contracts/interfaces/IERC4906.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (interfaces/IERC4906.sol)

pragma solidity ^0.8.20;


/// @title ERC-721 Metadata Update Extension
interface IERC4906 is IERC165, IERC721 {
    /// @dev This event emits when the metadata of a token is changed.
    /// So that the third-party platforms such as NFT market could
    /// timely update the images and related attributes of the NFT.
    event MetadataUpdate(uint256 _tokenId);

    /// @dev This event emits when the metadata of a range of tokens is changed.
    /// So that the third-party platforms such as NFT market could
    /// timely update the images and related attributes of the NFTs.
    event BatchMetadataUpdate(uint256 _fromTokenId, uint256 _toTokenId);
}


// File @openzeppelin/contracts/interfaces/draft-IERC6093.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (interfaces/draft-IERC6093.sol)
pragma solidity ^0.8.20;

/**
 * @dev Standard ERC-20 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-20 tokens.
 */
interface IERC20Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC20InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC20InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `spender`’s `allowance`. Used in transfers.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     * @param allowance Amount of tokens a `spender` is allowed to operate with.
     * @param needed Minimum amount required to perform a transfer.
     */
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC20InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `spender` to be approved. Used in approvals.
     * @param spender Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC20InvalidSpender(address spender);
}

/**
 * @dev Standard ERC-721 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-721 tokens.
 */
interface IERC721Errors {
    /**
     * @dev Indicates that an address can't be an owner. For example, `address(0)` is a forbidden owner in ERC-20.
     * Used in balance queries.
     * @param owner Address of the current owner of a token.
     */
    error ERC721InvalidOwner(address owner);

    /**
     * @dev Indicates a `tokenId` whose `owner` is the zero address.
     * @param tokenId Identifier number of a token.
     */
    error ERC721NonexistentToken(uint256 tokenId);

    /**
     * @dev Indicates an error related to the ownership over a particular token. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param tokenId Identifier number of a token.
     * @param owner Address of the current owner of a token.
     */
    error ERC721IncorrectOwner(address sender, uint256 tokenId, address owner);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC721InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC721InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param tokenId Identifier number of a token.
     */
    error ERC721InsufficientApproval(address operator, uint256 tokenId);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC721InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC721InvalidOperator(address operator);
}

/**
 * @dev Standard ERC-1155 Errors
 * Interface of the https://eips.ethereum.org/EIPS/eip-6093[ERC-6093] custom errors for ERC-1155 tokens.
 */
interface IERC1155Errors {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param balance Current balance for the interacting account.
     * @param needed Minimum amount required to perform a transfer.
     * @param tokenId Identifier number of a token.
     */
    error ERC1155InsufficientBalance(address sender, uint256 balance, uint256 needed, uint256 tokenId);

    /**
     * @dev Indicates a failure with the token `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     */
    error ERC1155InvalidSender(address sender);

    /**
     * @dev Indicates a failure with the token `receiver`. Used in transfers.
     * @param receiver Address to which tokens are being transferred.
     */
    error ERC1155InvalidReceiver(address receiver);

    /**
     * @dev Indicates a failure with the `operator`’s approval. Used in transfers.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     * @param owner Address of the current owner of a token.
     */
    error ERC1155MissingApprovalForAll(address operator, address owner);

    /**
     * @dev Indicates a failure with the `approver` of a token to be approved. Used in approvals.
     * @param approver Address initiating an approval operation.
     */
    error ERC1155InvalidApprover(address approver);

    /**
     * @dev Indicates a failure with the `operator` to be approved. Used in approvals.
     * @param operator Address that may be allowed to operate on tokens without being their owner.
     */
    error ERC1155InvalidOperator(address operator);

    /**
     * @dev Indicates an array length mismatch between ids and values in a safeBatchTransferFrom operation.
     * Used in batch transfers.
     * @param idsLength Length of the array of token identifiers
     * @param valuesLength Length of the array of token amounts
     */
    error ERC1155InvalidArrayLength(uint256 idsLength, uint256 valuesLength);
}


// File @openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/extensions/IERC721Metadata.sol)

pragma solidity ^0.8.20;

/**
 * @title ERC-721 Non-Fungible Token Standard, optional metadata extension
 * @dev See https://eips.ethereum.org/EIPS/eip-721
 */
interface IERC721Metadata is IERC721 {
    /**
     * @dev Returns the token collection name.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the token collection symbol.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);
}


// File @openzeppelin/contracts/token/ERC721/IERC721Receiver.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC721/IERC721Receiver.sol)

pragma solidity ^0.8.20;

/**
 * @title ERC-721 token receiver interface
 * @dev Interface for any contract that wants to support safeTransfers
 * from ERC-721 asset contracts.
 */
interface IERC721Receiver {
    /**
     * @dev Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
     * by `operator` from `from`, this function is called.
     *
     * It must return its Solidity selector to confirm the token transfer.
     * If any other value is returned or the interface is not implemented by the recipient, the transfer will be
     * reverted.
     *
     * The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}


// File @openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC721/utils/ERC721Utils.sol)

pragma solidity ^0.8.20;


/**
 * @dev Library that provide common ERC-721 utility functions.
 *
 * See https://eips.ethereum.org/EIPS/eip-721[ERC-721].
 *
 * _Available since v5.1._
 */
library ERC721Utils {
    /**
     * @dev Performs an acceptance check for the provided `operator` by calling {IERC721Receiver-onERC721Received}
     * on the `to` address. The `operator` is generally the address that initiated the token transfer (i.e. `msg.sender`).
     *
     * The acceptance call is not executed and treated as a no-op if the target address doesn't contain code (i.e. an EOA).
     * Otherwise, the recipient must implement {IERC721Receiver-onERC721Received} and return the acceptance magic value to accept
     * the transfer.
     */
    function checkOnERC721Received(
        address operator,
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(operator, from, tokenId, data) returns (bytes4 retval) {
                if (retval != IERC721Receiver.onERC721Received.selector) {
                    // Token rejected
                    revert IERC721Errors.ERC721InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    // non-IERC721Receiver implementer
                    revert IERC721Errors.ERC721InvalidReceiver(to);
                } else {
                    assembly ("memory-safe") {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }
}


// File @openzeppelin/contracts/utils/math/SafeCast.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/math/SafeCast.sol)
// This file was procedurally generated from scripts/generate/templates/SafeCast.js.

pragma solidity ^0.8.20;

/**
 * @dev Wrappers over Solidity's uintXX/intXX/bool casting operators with added overflow
 * checks.
 *
 * Downcasting from uint256/int256 in Solidity does not revert on overflow. This can
 * easily result in undesired exploitation or bugs, since developers usually
 * assume that overflows raise errors. `SafeCast` restores this intuition by
 * reverting the transaction when such an operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeCast {
    /**
     * @dev Value doesn't fit in an uint of `bits` size.
     */
    error SafeCastOverflowedUintDowncast(uint8 bits, uint256 value);

    /**
     * @dev An int value doesn't fit in an uint of `bits` size.
     */
    error SafeCastOverflowedIntToUint(int256 value);

    /**
     * @dev Value doesn't fit in an int of `bits` size.
     */
    error SafeCastOverflowedIntDowncast(uint8 bits, int256 value);

    /**
     * @dev An uint value doesn't fit in an int of `bits` size.
     */
    error SafeCastOverflowedUintToInt(uint256 value);

    /**
     * @dev Returns the downcasted uint248 from uint256, reverting on
     * overflow (when the input is greater than largest uint248).
     *
     * Counterpart to Solidity's `uint248` operator.
     *
     * Requirements:
     *
     * - input must fit into 248 bits
     */
    function toUint248(uint256 value) internal pure returns (uint248) {
        if (value > type(uint248).max) {
            revert SafeCastOverflowedUintDowncast(248, value);
        }
        return uint248(value);
    }

    /**
     * @dev Returns the downcasted uint240 from uint256, reverting on
     * overflow (when the input is greater than largest uint240).
     *
     * Counterpart to Solidity's `uint240` operator.
     *
     * Requirements:
     *
     * - input must fit into 240 bits
     */
    function toUint240(uint256 value) internal pure returns (uint240) {
        if (value > type(uint240).max) {
            revert SafeCastOverflowedUintDowncast(240, value);
        }
        return uint240(value);
    }

    /**
     * @dev Returns the downcasted uint232 from uint256, reverting on
     * overflow (when the input is greater than largest uint232).
     *
     * Counterpart to Solidity's `uint232` operator.
     *
     * Requirements:
     *
     * - input must fit into 232 bits
     */
    function toUint232(uint256 value) internal pure returns (uint232) {
        if (value > type(uint232).max) {
            revert SafeCastOverflowedUintDowncast(232, value);
        }
        return uint232(value);
    }

    /**
     * @dev Returns the downcasted uint224 from uint256, reverting on
     * overflow (when the input is greater than largest uint224).
     *
     * Counterpart to Solidity's `uint224` operator.
     *
     * Requirements:
     *
     * - input must fit into 224 bits
     */
    function toUint224(uint256 value) internal pure returns (uint224) {
        if (value > type(uint224).max) {
            revert SafeCastOverflowedUintDowncast(224, value);
        }
        return uint224(value);
    }

    /**
     * @dev Returns the downcasted uint216 from uint256, reverting on
     * overflow (when the input is greater than largest uint216).
     *
     * Counterpart to Solidity's `uint216` operator.
     *
     * Requirements:
     *
     * - input must fit into 216 bits
     */
    function toUint216(uint256 value) internal pure returns (uint216) {
        if (value > type(uint216).max) {
            revert SafeCastOverflowedUintDowncast(216, value);
        }
        return uint216(value);
    }

    /**
     * @dev Returns the downcasted uint208 from uint256, reverting on
     * overflow (when the input is greater than largest uint208).
     *
     * Counterpart to Solidity's `uint208` operator.
     *
     * Requirements:
     *
     * - input must fit into 208 bits
     */
    function toUint208(uint256 value) internal pure returns (uint208) {
        if (value > type(uint208).max) {
            revert SafeCastOverflowedUintDowncast(208, value);
        }
        return uint208(value);
    }

    /**
     * @dev Returns the downcasted uint200 from uint256, reverting on
     * overflow (when the input is greater than largest uint200).
     *
     * Counterpart to Solidity's `uint200` operator.
     *
     * Requirements:
     *
     * - input must fit into 200 bits
     */
    function toUint200(uint256 value) internal pure returns (uint200) {
        if (value > type(uint200).max) {
            revert SafeCastOverflowedUintDowncast(200, value);
        }
        return uint200(value);
    }

    /**
     * @dev Returns the downcasted uint192 from uint256, reverting on
     * overflow (when the input is greater than largest uint192).
     *
     * Counterpart to Solidity's `uint192` operator.
     *
     * Requirements:
     *
     * - input must fit into 192 bits
     */
    function toUint192(uint256 value) internal pure returns (uint192) {
        if (value > type(uint192).max) {
            revert SafeCastOverflowedUintDowncast(192, value);
        }
        return uint192(value);
    }

    /**
     * @dev Returns the downcasted uint184 from uint256, reverting on
     * overflow (when the input is greater than largest uint184).
     *
     * Counterpart to Solidity's `uint184` operator.
     *
     * Requirements:
     *
     * - input must fit into 184 bits
     */
    function toUint184(uint256 value) internal pure returns (uint184) {
        if (value > type(uint184).max) {
            revert SafeCastOverflowedUintDowncast(184, value);
        }
        return uint184(value);
    }

    /**
     * @dev Returns the downcasted uint176 from uint256, reverting on
     * overflow (when the input is greater than largest uint176).
     *
     * Counterpart to Solidity's `uint176` operator.
     *
     * Requirements:
     *
     * - input must fit into 176 bits
     */
    function toUint176(uint256 value) internal pure returns (uint176) {
        if (value > type(uint176).max) {
            revert SafeCastOverflowedUintDowncast(176, value);
        }
        return uint176(value);
    }

    /**
     * @dev Returns the downcasted uint168 from uint256, reverting on
     * overflow (when the input is greater than largest uint168).
     *
     * Counterpart to Solidity's `uint168` operator.
     *
     * Requirements:
     *
     * - input must fit into 168 bits
     */
    function toUint168(uint256 value) internal pure returns (uint168) {
        if (value > type(uint168).max) {
            revert SafeCastOverflowedUintDowncast(168, value);
        }
        return uint168(value);
    }

    /**
     * @dev Returns the downcasted uint160 from uint256, reverting on
     * overflow (when the input is greater than largest uint160).
     *
     * Counterpart to Solidity's `uint160` operator.
     *
     * Requirements:
     *
     * - input must fit into 160 bits
     */
    function toUint160(uint256 value) internal pure returns (uint160) {
        if (value > type(uint160).max) {
            revert SafeCastOverflowedUintDowncast(160, value);
        }
        return uint160(value);
    }

    /**
     * @dev Returns the downcasted uint152 from uint256, reverting on
     * overflow (when the input is greater than largest uint152).
     *
     * Counterpart to Solidity's `uint152` operator.
     *
     * Requirements:
     *
     * - input must fit into 152 bits
     */
    function toUint152(uint256 value) internal pure returns (uint152) {
        if (value > type(uint152).max) {
            revert SafeCastOverflowedUintDowncast(152, value);
        }
        return uint152(value);
    }

    /**
     * @dev Returns the downcasted uint144 from uint256, reverting on
     * overflow (when the input is greater than largest uint144).
     *
     * Counterpart to Solidity's `uint144` operator.
     *
     * Requirements:
     *
     * - input must fit into 144 bits
     */
    function toUint144(uint256 value) internal pure returns (uint144) {
        if (value > type(uint144).max) {
            revert SafeCastOverflowedUintDowncast(144, value);
        }
        return uint144(value);
    }

    /**
     * @dev Returns the downcasted uint136 from uint256, reverting on
     * overflow (when the input is greater than largest uint136).
     *
     * Counterpart to Solidity's `uint136` operator.
     *
     * Requirements:
     *
     * - input must fit into 136 bits
     */
    function toUint136(uint256 value) internal pure returns (uint136) {
        if (value > type(uint136).max) {
            revert SafeCastOverflowedUintDowncast(136, value);
        }
        return uint136(value);
    }

    /**
     * @dev Returns the downcasted uint128 from uint256, reverting on
     * overflow (when the input is greater than largest uint128).
     *
     * Counterpart to Solidity's `uint128` operator.
     *
     * Requirements:
     *
     * - input must fit into 128 bits
     */
    function toUint128(uint256 value) internal pure returns (uint128) {
        if (value > type(uint128).max) {
            revert SafeCastOverflowedUintDowncast(128, value);
        }
        return uint128(value);
    }

    /**
     * @dev Returns the downcasted uint120 from uint256, reverting on
     * overflow (when the input is greater than largest uint120).
     *
     * Counterpart to Solidity's `uint120` operator.
     *
     * Requirements:
     *
     * - input must fit into 120 bits
     */
    function toUint120(uint256 value) internal pure returns (uint120) {
        if (value > type(uint120).max) {
            revert SafeCastOverflowedUintDowncast(120, value);
        }
        return uint120(value);
    }

    /**
     * @dev Returns the downcasted uint112 from uint256, reverting on
     * overflow (when the input is greater than largest uint112).
     *
     * Counterpart to Solidity's `uint112` operator.
     *
     * Requirements:
     *
     * - input must fit into 112 bits
     */
    function toUint112(uint256 value) internal pure returns (uint112) {
        if (value > type(uint112).max) {
            revert SafeCastOverflowedUintDowncast(112, value);
        }
        return uint112(value);
    }

    /**
     * @dev Returns the downcasted uint104 from uint256, reverting on
     * overflow (when the input is greater than largest uint104).
     *
     * Counterpart to Solidity's `uint104` operator.
     *
     * Requirements:
     *
     * - input must fit into 104 bits
     */
    function toUint104(uint256 value) internal pure returns (uint104) {
        if (value > type(uint104).max) {
            revert SafeCastOverflowedUintDowncast(104, value);
        }
        return uint104(value);
    }

    /**
     * @dev Returns the downcasted uint96 from uint256, reverting on
     * overflow (when the input is greater than largest uint96).
     *
     * Counterpart to Solidity's `uint96` operator.
     *
     * Requirements:
     *
     * - input must fit into 96 bits
     */
    function toUint96(uint256 value) internal pure returns (uint96) {
        if (value > type(uint96).max) {
            revert SafeCastOverflowedUintDowncast(96, value);
        }
        return uint96(value);
    }

    /**
     * @dev Returns the downcasted uint88 from uint256, reverting on
     * overflow (when the input is greater than largest uint88).
     *
     * Counterpart to Solidity's `uint88` operator.
     *
     * Requirements:
     *
     * - input must fit into 88 bits
     */
    function toUint88(uint256 value) internal pure returns (uint88) {
        if (value > type(uint88).max) {
            revert SafeCastOverflowedUintDowncast(88, value);
        }
        return uint88(value);
    }

    /**
     * @dev Returns the downcasted uint80 from uint256, reverting on
     * overflow (when the input is greater than largest uint80).
     *
     * Counterpart to Solidity's `uint80` operator.
     *
     * Requirements:
     *
     * - input must fit into 80 bits
     */
    function toUint80(uint256 value) internal pure returns (uint80) {
        if (value > type(uint80).max) {
            revert SafeCastOverflowedUintDowncast(80, value);
        }
        return uint80(value);
    }

    /**
     * @dev Returns the downcasted uint72 from uint256, reverting on
     * overflow (when the input is greater than largest uint72).
     *
     * Counterpart to Solidity's `uint72` operator.
     *
     * Requirements:
     *
     * - input must fit into 72 bits
     */
    function toUint72(uint256 value) internal pure returns (uint72) {
        if (value > type(uint72).max) {
            revert SafeCastOverflowedUintDowncast(72, value);
        }
        return uint72(value);
    }

    /**
     * @dev Returns the downcasted uint64 from uint256, reverting on
     * overflow (when the input is greater than largest uint64).
     *
     * Counterpart to Solidity's `uint64` operator.
     *
     * Requirements:
     *
     * - input must fit into 64 bits
     */
    function toUint64(uint256 value) internal pure returns (uint64) {
        if (value > type(uint64).max) {
            revert SafeCastOverflowedUintDowncast(64, value);
        }
        return uint64(value);
    }

    /**
     * @dev Returns the downcasted uint56 from uint256, reverting on
     * overflow (when the input is greater than largest uint56).
     *
     * Counterpart to Solidity's `uint56` operator.
     *
     * Requirements:
     *
     * - input must fit into 56 bits
     */
    function toUint56(uint256 value) internal pure returns (uint56) {
        if (value > type(uint56).max) {
            revert SafeCastOverflowedUintDowncast(56, value);
        }
        return uint56(value);
    }

    /**
     * @dev Returns the downcasted uint48 from uint256, reverting on
     * overflow (when the input is greater than largest uint48).
     *
     * Counterpart to Solidity's `uint48` operator.
     *
     * Requirements:
     *
     * - input must fit into 48 bits
     */
    function toUint48(uint256 value) internal pure returns (uint48) {
        if (value > type(uint48).max) {
            revert SafeCastOverflowedUintDowncast(48, value);
        }
        return uint48(value);
    }

    /**
     * @dev Returns the downcasted uint40 from uint256, reverting on
     * overflow (when the input is greater than largest uint40).
     *
     * Counterpart to Solidity's `uint40` operator.
     *
     * Requirements:
     *
     * - input must fit into 40 bits
     */
    function toUint40(uint256 value) internal pure returns (uint40) {
        if (value > type(uint40).max) {
            revert SafeCastOverflowedUintDowncast(40, value);
        }
        return uint40(value);
    }

    /**
     * @dev Returns the downcasted uint32 from uint256, reverting on
     * overflow (when the input is greater than largest uint32).
     *
     * Counterpart to Solidity's `uint32` operator.
     *
     * Requirements:
     *
     * - input must fit into 32 bits
     */
    function toUint32(uint256 value) internal pure returns (uint32) {
        if (value > type(uint32).max) {
            revert SafeCastOverflowedUintDowncast(32, value);
        }
        return uint32(value);
    }

    /**
     * @dev Returns the downcasted uint24 from uint256, reverting on
     * overflow (when the input is greater than largest uint24).
     *
     * Counterpart to Solidity's `uint24` operator.
     *
     * Requirements:
     *
     * - input must fit into 24 bits
     */
    function toUint24(uint256 value) internal pure returns (uint24) {
        if (value > type(uint24).max) {
            revert SafeCastOverflowedUintDowncast(24, value);
        }
        return uint24(value);
    }

    /**
     * @dev Returns the downcasted uint16 from uint256, reverting on
     * overflow (when the input is greater than largest uint16).
     *
     * Counterpart to Solidity's `uint16` operator.
     *
     * Requirements:
     *
     * - input must fit into 16 bits
     */
    function toUint16(uint256 value) internal pure returns (uint16) {
        if (value > type(uint16).max) {
            revert SafeCastOverflowedUintDowncast(16, value);
        }
        return uint16(value);
    }

    /**
     * @dev Returns the downcasted uint8 from uint256, reverting on
     * overflow (when the input is greater than largest uint8).
     *
     * Counterpart to Solidity's `uint8` operator.
     *
     * Requirements:
     *
     * - input must fit into 8 bits
     */
    function toUint8(uint256 value) internal pure returns (uint8) {
        if (value > type(uint8).max) {
            revert SafeCastOverflowedUintDowncast(8, value);
        }
        return uint8(value);
    }

    /**
     * @dev Converts a signed int256 into an unsigned uint256.
     *
     * Requirements:
     *
     * - input must be greater than or equal to 0.
     */
    function toUint256(int256 value) internal pure returns (uint256) {
        if (value < 0) {
            revert SafeCastOverflowedIntToUint(value);
        }
        return uint256(value);
    }

    /**
     * @dev Returns the downcasted int248 from int256, reverting on
     * overflow (when the input is less than smallest int248 or
     * greater than largest int248).
     *
     * Counterpart to Solidity's `int248` operator.
     *
     * Requirements:
     *
     * - input must fit into 248 bits
     */
    function toInt248(int256 value) internal pure returns (int248 downcasted) {
        downcasted = int248(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(248, value);
        }
    }

    /**
     * @dev Returns the downcasted int240 from int256, reverting on
     * overflow (when the input is less than smallest int240 or
     * greater than largest int240).
     *
     * Counterpart to Solidity's `int240` operator.
     *
     * Requirements:
     *
     * - input must fit into 240 bits
     */
    function toInt240(int256 value) internal pure returns (int240 downcasted) {
        downcasted = int240(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(240, value);
        }
    }

    /**
     * @dev Returns the downcasted int232 from int256, reverting on
     * overflow (when the input is less than smallest int232 or
     * greater than largest int232).
     *
     * Counterpart to Solidity's `int232` operator.
     *
     * Requirements:
     *
     * - input must fit into 232 bits
     */
    function toInt232(int256 value) internal pure returns (int232 downcasted) {
        downcasted = int232(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(232, value);
        }
    }

    /**
     * @dev Returns the downcasted int224 from int256, reverting on
     * overflow (when the input is less than smallest int224 or
     * greater than largest int224).
     *
     * Counterpart to Solidity's `int224` operator.
     *
     * Requirements:
     *
     * - input must fit into 224 bits
     */
    function toInt224(int256 value) internal pure returns (int224 downcasted) {
        downcasted = int224(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(224, value);
        }
    }

    /**
     * @dev Returns the downcasted int216 from int256, reverting on
     * overflow (when the input is less than smallest int216 or
     * greater than largest int216).
     *
     * Counterpart to Solidity's `int216` operator.
     *
     * Requirements:
     *
     * - input must fit into 216 bits
     */
    function toInt216(int256 value) internal pure returns (int216 downcasted) {
        downcasted = int216(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(216, value);
        }
    }

    /**
     * @dev Returns the downcasted int208 from int256, reverting on
     * overflow (when the input is less than smallest int208 or
     * greater than largest int208).
     *
     * Counterpart to Solidity's `int208` operator.
     *
     * Requirements:
     *
     * - input must fit into 208 bits
     */
    function toInt208(int256 value) internal pure returns (int208 downcasted) {
        downcasted = int208(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(208, value);
        }
    }

    /**
     * @dev Returns the downcasted int200 from int256, reverting on
     * overflow (when the input is less than smallest int200 or
     * greater than largest int200).
     *
     * Counterpart to Solidity's `int200` operator.
     *
     * Requirements:
     *
     * - input must fit into 200 bits
     */
    function toInt200(int256 value) internal pure returns (int200 downcasted) {
        downcasted = int200(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(200, value);
        }
    }

    /**
     * @dev Returns the downcasted int192 from int256, reverting on
     * overflow (when the input is less than smallest int192 or
     * greater than largest int192).
     *
     * Counterpart to Solidity's `int192` operator.
     *
     * Requirements:
     *
     * - input must fit into 192 bits
     */
    function toInt192(int256 value) internal pure returns (int192 downcasted) {
        downcasted = int192(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(192, value);
        }
    }

    /**
     * @dev Returns the downcasted int184 from int256, reverting on
     * overflow (when the input is less than smallest int184 or
     * greater than largest int184).
     *
     * Counterpart to Solidity's `int184` operator.
     *
     * Requirements:
     *
     * - input must fit into 184 bits
     */
    function toInt184(int256 value) internal pure returns (int184 downcasted) {
        downcasted = int184(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(184, value);
        }
    }

    /**
     * @dev Returns the downcasted int176 from int256, reverting on
     * overflow (when the input is less than smallest int176 or
     * greater than largest int176).
     *
     * Counterpart to Solidity's `int176` operator.
     *
     * Requirements:
     *
     * - input must fit into 176 bits
     */
    function toInt176(int256 value) internal pure returns (int176 downcasted) {
        downcasted = int176(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(176, value);
        }
    }

    /**
     * @dev Returns the downcasted int168 from int256, reverting on
     * overflow (when the input is less than smallest int168 or
     * greater than largest int168).
     *
     * Counterpart to Solidity's `int168` operator.
     *
     * Requirements:
     *
     * - input must fit into 168 bits
     */
    function toInt168(int256 value) internal pure returns (int168 downcasted) {
        downcasted = int168(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(168, value);
        }
    }

    /**
     * @dev Returns the downcasted int160 from int256, reverting on
     * overflow (when the input is less than smallest int160 or
     * greater than largest int160).
     *
     * Counterpart to Solidity's `int160` operator.
     *
     * Requirements:
     *
     * - input must fit into 160 bits
     */
    function toInt160(int256 value) internal pure returns (int160 downcasted) {
        downcasted = int160(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(160, value);
        }
    }

    /**
     * @dev Returns the downcasted int152 from int256, reverting on
     * overflow (when the input is less than smallest int152 or
     * greater than largest int152).
     *
     * Counterpart to Solidity's `int152` operator.
     *
     * Requirements:
     *
     * - input must fit into 152 bits
     */
    function toInt152(int256 value) internal pure returns (int152 downcasted) {
        downcasted = int152(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(152, value);
        }
    }

    /**
     * @dev Returns the downcasted int144 from int256, reverting on
     * overflow (when the input is less than smallest int144 or
     * greater than largest int144).
     *
     * Counterpart to Solidity's `int144` operator.
     *
     * Requirements:
     *
     * - input must fit into 144 bits
     */
    function toInt144(int256 value) internal pure returns (int144 downcasted) {
        downcasted = int144(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(144, value);
        }
    }

    /**
     * @dev Returns the downcasted int136 from int256, reverting on
     * overflow (when the input is less than smallest int136 or
     * greater than largest int136).
     *
     * Counterpart to Solidity's `int136` operator.
     *
     * Requirements:
     *
     * - input must fit into 136 bits
     */
    function toInt136(int256 value) internal pure returns (int136 downcasted) {
        downcasted = int136(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(136, value);
        }
    }

    /**
     * @dev Returns the downcasted int128 from int256, reverting on
     * overflow (when the input is less than smallest int128 or
     * greater than largest int128).
     *
     * Counterpart to Solidity's `int128` operator.
     *
     * Requirements:
     *
     * - input must fit into 128 bits
     */
    function toInt128(int256 value) internal pure returns (int128 downcasted) {
        downcasted = int128(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(128, value);
        }
    }

    /**
     * @dev Returns the downcasted int120 from int256, reverting on
     * overflow (when the input is less than smallest int120 or
     * greater than largest int120).
     *
     * Counterpart to Solidity's `int120` operator.
     *
     * Requirements:
     *
     * - input must fit into 120 bits
     */
    function toInt120(int256 value) internal pure returns (int120 downcasted) {
        downcasted = int120(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(120, value);
        }
    }

    /**
     * @dev Returns the downcasted int112 from int256, reverting on
     * overflow (when the input is less than smallest int112 or
     * greater than largest int112).
     *
     * Counterpart to Solidity's `int112` operator.
     *
     * Requirements:
     *
     * - input must fit into 112 bits
     */
    function toInt112(int256 value) internal pure returns (int112 downcasted) {
        downcasted = int112(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(112, value);
        }
    }

    /**
     * @dev Returns the downcasted int104 from int256, reverting on
     * overflow (when the input is less than smallest int104 or
     * greater than largest int104).
     *
     * Counterpart to Solidity's `int104` operator.
     *
     * Requirements:
     *
     * - input must fit into 104 bits
     */
    function toInt104(int256 value) internal pure returns (int104 downcasted) {
        downcasted = int104(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(104, value);
        }
    }

    /**
     * @dev Returns the downcasted int96 from int256, reverting on
     * overflow (when the input is less than smallest int96 or
     * greater than largest int96).
     *
     * Counterpart to Solidity's `int96` operator.
     *
     * Requirements:
     *
     * - input must fit into 96 bits
     */
    function toInt96(int256 value) internal pure returns (int96 downcasted) {
        downcasted = int96(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(96, value);
        }
    }

    /**
     * @dev Returns the downcasted int88 from int256, reverting on
     * overflow (when the input is less than smallest int88 or
     * greater than largest int88).
     *
     * Counterpart to Solidity's `int88` operator.
     *
     * Requirements:
     *
     * - input must fit into 88 bits
     */
    function toInt88(int256 value) internal pure returns (int88 downcasted) {
        downcasted = int88(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(88, value);
        }
    }

    /**
     * @dev Returns the downcasted int80 from int256, reverting on
     * overflow (when the input is less than smallest int80 or
     * greater than largest int80).
     *
     * Counterpart to Solidity's `int80` operator.
     *
     * Requirements:
     *
     * - input must fit into 80 bits
     */
    function toInt80(int256 value) internal pure returns (int80 downcasted) {
        downcasted = int80(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(80, value);
        }
    }

    /**
     * @dev Returns the downcasted int72 from int256, reverting on
     * overflow (when the input is less than smallest int72 or
     * greater than largest int72).
     *
     * Counterpart to Solidity's `int72` operator.
     *
     * Requirements:
     *
     * - input must fit into 72 bits
     */
    function toInt72(int256 value) internal pure returns (int72 downcasted) {
        downcasted = int72(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(72, value);
        }
    }

    /**
     * @dev Returns the downcasted int64 from int256, reverting on
     * overflow (when the input is less than smallest int64 or
     * greater than largest int64).
     *
     * Counterpart to Solidity's `int64` operator.
     *
     * Requirements:
     *
     * - input must fit into 64 bits
     */
    function toInt64(int256 value) internal pure returns (int64 downcasted) {
        downcasted = int64(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(64, value);
        }
    }

    /**
     * @dev Returns the downcasted int56 from int256, reverting on
     * overflow (when the input is less than smallest int56 or
     * greater than largest int56).
     *
     * Counterpart to Solidity's `int56` operator.
     *
     * Requirements:
     *
     * - input must fit into 56 bits
     */
    function toInt56(int256 value) internal pure returns (int56 downcasted) {
        downcasted = int56(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(56, value);
        }
    }

    /**
     * @dev Returns the downcasted int48 from int256, reverting on
     * overflow (when the input is less than smallest int48 or
     * greater than largest int48).
     *
     * Counterpart to Solidity's `int48` operator.
     *
     * Requirements:
     *
     * - input must fit into 48 bits
     */
    function toInt48(int256 value) internal pure returns (int48 downcasted) {
        downcasted = int48(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(48, value);
        }
    }

    /**
     * @dev Returns the downcasted int40 from int256, reverting on
     * overflow (when the input is less than smallest int40 or
     * greater than largest int40).
     *
     * Counterpart to Solidity's `int40` operator.
     *
     * Requirements:
     *
     * - input must fit into 40 bits
     */
    function toInt40(int256 value) internal pure returns (int40 downcasted) {
        downcasted = int40(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(40, value);
        }
    }

    /**
     * @dev Returns the downcasted int32 from int256, reverting on
     * overflow (when the input is less than smallest int32 or
     * greater than largest int32).
     *
     * Counterpart to Solidity's `int32` operator.
     *
     * Requirements:
     *
     * - input must fit into 32 bits
     */
    function toInt32(int256 value) internal pure returns (int32 downcasted) {
        downcasted = int32(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(32, value);
        }
    }

    /**
     * @dev Returns the downcasted int24 from int256, reverting on
     * overflow (when the input is less than smallest int24 or
     * greater than largest int24).
     *
     * Counterpart to Solidity's `int24` operator.
     *
     * Requirements:
     *
     * - input must fit into 24 bits
     */
    function toInt24(int256 value) internal pure returns (int24 downcasted) {
        downcasted = int24(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(24, value);
        }
    }

    /**
     * @dev Returns the downcasted int16 from int256, reverting on
     * overflow (when the input is less than smallest int16 or
     * greater than largest int16).
     *
     * Counterpart to Solidity's `int16` operator.
     *
     * Requirements:
     *
     * - input must fit into 16 bits
     */
    function toInt16(int256 value) internal pure returns (int16 downcasted) {
        downcasted = int16(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(16, value);
        }
    }

    /**
     * @dev Returns the downcasted int8 from int256, reverting on
     * overflow (when the input is less than smallest int8 or
     * greater than largest int8).
     *
     * Counterpart to Solidity's `int8` operator.
     *
     * Requirements:
     *
     * - input must fit into 8 bits
     */
    function toInt8(int256 value) internal pure returns (int8 downcasted) {
        downcasted = int8(value);
        if (downcasted != value) {
            revert SafeCastOverflowedIntDowncast(8, value);
        }
    }

    /**
     * @dev Converts an unsigned uint256 into a signed int256.
     *
     * Requirements:
     *
     * - input must be less than or equal to maxInt256.
     */
    function toInt256(uint256 value) internal pure returns (int256) {
        // Note: Unsafe cast below is okay because `type(int256).max` is guaranteed to be positive
        if (value > uint256(type(int256).max)) {
            revert SafeCastOverflowedUintToInt(value);
        }
        return int256(value);
    }

    /**
     * @dev Cast a boolean (false or true) to a uint256 (0 or 1) with no jump.
     */
    function toUint(bool b) internal pure returns (uint256 u) {
        assembly ("memory-safe") {
            u := iszero(iszero(b))
        }
    }
}


// File @openzeppelin/contracts/utils/Panic.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/Panic.sol)

pragma solidity ^0.8.20;

/**
 * @dev Helper library for emitting standardized panic codes.
 *
 * ```solidity
 * contract Example {
 *      using Panic for uint256;
 *
 *      // Use any of the declared internal constants
 *      function foo() { Panic.GENERIC.panic(); }
 *
 *      // Alternatively
 *      function foo() { Panic.panic(Panic.GENERIC); }
 * }
 * ```
 *
 * Follows the list from https://github.com/ethereum/solidity/blob/v0.8.24/libsolutil/ErrorCodes.h[libsolutil].
 *
 * _Available since v5.1._
 */
// slither-disable-next-line unused-state
library Panic {
    /// @dev generic / unspecified error
    uint256 internal constant GENERIC = 0x00;
    /// @dev used by the assert() builtin
    uint256 internal constant ASSERT = 0x01;
    /// @dev arithmetic underflow or overflow
    uint256 internal constant UNDER_OVERFLOW = 0x11;
    /// @dev division or modulo by zero
    uint256 internal constant DIVISION_BY_ZERO = 0x12;
    /// @dev enum conversion error
    uint256 internal constant ENUM_CONVERSION_ERROR = 0x21;
    /// @dev invalid encoding in storage
    uint256 internal constant STORAGE_ENCODING_ERROR = 0x22;
    /// @dev empty array pop
    uint256 internal constant EMPTY_ARRAY_POP = 0x31;
    /// @dev array out of bounds access
    uint256 internal constant ARRAY_OUT_OF_BOUNDS = 0x32;
    /// @dev resource error (too large allocation or too large array)
    uint256 internal constant RESOURCE_ERROR = 0x41;
    /// @dev calling invalid internal function
    uint256 internal constant INVALID_INTERNAL_FUNCTION = 0x51;

    /// @dev Reverts with a panic code. Recommended to use with
    /// the internal constants with predefined codes.
    function panic(uint256 code) internal pure {
        assembly ("memory-safe") {
            mstore(0x00, 0x4e487b71)
            mstore(0x20, code)
            revert(0x1c, 0x24)
        }
    }
}


// File @openzeppelin/contracts/utils/math/Math.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (utils/math/Math.sol)

pragma solidity ^0.8.20;


/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    enum Rounding {
        Floor, // Toward negative infinity
        Ceil, // Toward positive infinity
        Trunc, // Toward zero
        Expand // Away from zero
    }

    /**
     * @dev Return the 512-bit addition of two uint256.
     *
     * The result is stored in two 256 variables such that sum = high * 2²⁵⁶ + low.
     */
    function add512(uint256 a, uint256 b) internal pure returns (uint256 high, uint256 low) {
        assembly ("memory-safe") {
            low := add(a, b)
            high := lt(low, a)
        }
    }

    /**
     * @dev Return the 512-bit multiplication of two uint256.
     *
     * The result is stored in two 256 variables such that product = high * 2²⁵⁶ + low.
     */
    function mul512(uint256 a, uint256 b) internal pure returns (uint256 high, uint256 low) {
        // 512-bit multiply [high low] = x * y. Compute the product mod 2²⁵⁶ and mod 2²⁵⁶ - 1, then use
        // the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
        // variables such that product = high * 2²⁵⁶ + low.
        assembly ("memory-safe") {
            let mm := mulmod(a, b, not(0))
            low := mul(a, b)
            high := sub(sub(mm, low), lt(mm, low))
        }
    }

    /**
     * @dev Returns the addition of two unsigned integers, with a success flag (no overflow).
     */
    function tryAdd(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            uint256 c = a + b;
            success = c >= a;
            result = c * SafeCast.toUint(success);
        }
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, with a success flag (no overflow).
     */
    function trySub(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            uint256 c = a - b;
            success = c <= a;
            result = c * SafeCast.toUint(success);
        }
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, with a success flag (no overflow).
     */
    function tryMul(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            uint256 c = a * b;
            assembly ("memory-safe") {
                // Only true when the multiplication doesn't overflow
                // (c / a == b) || (a == 0)
                success := or(eq(div(c, a), b), iszero(a))
            }
            // equivalent to: success ? c : 0
            result = c * SafeCast.toUint(success);
        }
    }

    /**
     * @dev Returns the division of two unsigned integers, with a success flag (no division by zero).
     */
    function tryDiv(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            success = b > 0;
            assembly ("memory-safe") {
                // The `DIV` opcode returns zero when the denominator is 0.
                result := div(a, b)
            }
        }
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers, with a success flag (no division by zero).
     */
    function tryMod(uint256 a, uint256 b) internal pure returns (bool success, uint256 result) {
        unchecked {
            success = b > 0;
            assembly ("memory-safe") {
                // The `MOD` opcode returns zero when the denominator is 0.
                result := mod(a, b)
            }
        }
    }

    /**
     * @dev Unsigned saturating addition, bounds to `2²⁵⁶ - 1` instead of overflowing.
     */
    function saturatingAdd(uint256 a, uint256 b) internal pure returns (uint256) {
        (bool success, uint256 result) = tryAdd(a, b);
        return ternary(success, result, type(uint256).max);
    }

    /**
     * @dev Unsigned saturating subtraction, bounds to zero instead of overflowing.
     */
    function saturatingSub(uint256 a, uint256 b) internal pure returns (uint256) {
        (, uint256 result) = trySub(a, b);
        return result;
    }

    /**
     * @dev Unsigned saturating multiplication, bounds to `2²⁵⁶ - 1` instead of overflowing.
     */
    function saturatingMul(uint256 a, uint256 b) internal pure returns (uint256) {
        (bool success, uint256 result) = tryMul(a, b);
        return ternary(success, result, type(uint256).max);
    }

    /**
     * @dev Branchless ternary evaluation for `a ? b : c`. Gas costs are constant.
     *
     * IMPORTANT: This function may reduce bytecode size and consume less gas when used standalone.
     * However, the compiler may optimize Solidity ternary operations (i.e. `a ? b : c`) to only compute
     * one branch when needed, making this function more expensive.
     */
    function ternary(bool condition, uint256 a, uint256 b) internal pure returns (uint256) {
        unchecked {
            // branchless ternary works because:
            // b ^ (a ^ b) == a
            // b ^ 0 == b
            return b ^ ((a ^ b) * SafeCast.toUint(condition));
        }
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return ternary(a > b, a, b);
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return ternary(a < b, a, b);
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds towards infinity instead
     * of rounding towards zero.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        if (b == 0) {
            // Guarantee the same behavior as in a regular Solidity division.
            Panic.panic(Panic.DIVISION_BY_ZERO);
        }

        // The following calculation ensures accurate ceiling division without overflow.
        // Since a is non-zero, (a - 1) / b will not overflow.
        // The largest possible result occurs when (a - 1) / b is type(uint256).max,
        // but the largest value we can obtain is type(uint256).max - 1, which happens
        // when a = type(uint256).max and b = 1.
        unchecked {
            return SafeCast.toUint(a > 0) * ((a - 1) / b + 1);
        }
    }

    /**
     * @dev Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or
     * denominator == 0.
     *
     * Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv) with further edits by
     * Uniswap Labs also under MIT license.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
        unchecked {
            (uint256 high, uint256 low) = mul512(x, y);

            // Handle non-overflow cases, 256 by 256 division.
            if (high == 0) {
                // Solidity will revert if denominator == 0, unlike the div opcode on its own.
                // The surrounding unchecked block does not change this fact.
                // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
                return low / denominator;
            }

            // Make sure the result is less than 2²⁵⁶. Also prevents denominator == 0.
            if (denominator <= high) {
                Panic.panic(ternary(denominator == 0, Panic.DIVISION_BY_ZERO, Panic.UNDER_OVERFLOW));
            }

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [high low].
            uint256 remainder;
            assembly ("memory-safe") {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                high := sub(high, gt(remainder, low))
                low := sub(low, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator.
            // Always >= 1. See https://cs.stackexchange.com/q/138556/92363.

            uint256 twos = denominator & (0 - denominator);
            assembly ("memory-safe") {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [high low] by twos.
                low := div(low, twos)

                // Flip twos such that it is 2²⁵⁶ / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from high into low.
            low |= high * twos;

            // Invert denominator mod 2²⁵⁶. Now that denominator is an odd number, it has an inverse modulo 2²⁵⁶ such
            // that denominator * inv ≡ 1 mod 2²⁵⁶. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv ≡ 1 mod 2⁴.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also
            // works in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2⁸
            inverse *= 2 - denominator * inverse; // inverse mod 2¹⁶
            inverse *= 2 - denominator * inverse; // inverse mod 2³²
            inverse *= 2 - denominator * inverse; // inverse mod 2⁶⁴
            inverse *= 2 - denominator * inverse; // inverse mod 2¹²⁸
            inverse *= 2 - denominator * inverse; // inverse mod 2²⁵⁶

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2²⁵⁶. Since the preconditions guarantee that the outcome is
            // less than 2²⁵⁶, this is the final result. We don't need to compute the high bits of the result and high
            // is no longer required.
            result = low * inverse;
            return result;
        }
    }

    /**
     * @dev Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
        return mulDiv(x, y, denominator) + SafeCast.toUint(unsignedRoundsUp(rounding) && mulmod(x, y, denominator) > 0);
    }

    /**
     * @dev Calculates floor(x * y >> n) with full precision. Throws if result overflows a uint256.
     */
    function mulShr(uint256 x, uint256 y, uint8 n) internal pure returns (uint256 result) {
        unchecked {
            (uint256 high, uint256 low) = mul512(x, y);
            if (high >= 1 << n) {
                Panic.panic(Panic.UNDER_OVERFLOW);
            }
            return (high << (256 - n)) | (low >> n);
        }
    }

    /**
     * @dev Calculates x * y >> n with full precision, following the selected rounding direction.
     */
    function mulShr(uint256 x, uint256 y, uint8 n, Rounding rounding) internal pure returns (uint256) {
        return mulShr(x, y, n) + SafeCast.toUint(unsignedRoundsUp(rounding) && mulmod(x, y, 1 << n) > 0);
    }

    /**
     * @dev Calculate the modular multiplicative inverse of a number in Z/nZ.
     *
     * If n is a prime, then Z/nZ is a field. In that case all elements are inversible, except 0.
     * If n is not a prime, then Z/nZ is not a field, and some elements might not be inversible.
     *
     * If the input value is not inversible, 0 is returned.
     *
     * NOTE: If you know for sure that n is (big) a prime, it may be cheaper to use Fermat's little theorem and get the
     * inverse using `Math.modExp(a, n - 2, n)`. See {invModPrime}.
     */
    function invMod(uint256 a, uint256 n) internal pure returns (uint256) {
        unchecked {
            if (n == 0) return 0;

            // The inverse modulo is calculated using the Extended Euclidean Algorithm (iterative version)
            // Used to compute integers x and y such that: ax + ny = gcd(a, n).
            // When the gcd is 1, then the inverse of a modulo n exists and it's x.
            // ax + ny = 1
            // ax = 1 + (-y)n
            // ax ≡ 1 (mod n) # x is the inverse of a modulo n

            // If the remainder is 0 the gcd is n right away.
            uint256 remainder = a % n;
            uint256 gcd = n;

            // Therefore the initial coefficients are:
            // ax + ny = gcd(a, n) = n
            // 0a + 1n = n
            int256 x = 0;
            int256 y = 1;

            while (remainder != 0) {
                uint256 quotient = gcd / remainder;

                (gcd, remainder) = (
                    // The old remainder is the next gcd to try.
                    remainder,
                    // Compute the next remainder.
                    // Can't overflow given that (a % gcd) * (gcd // (a % gcd)) <= gcd
                    // where gcd is at most n (capped to type(uint256).max)
                    gcd - remainder * quotient
                );

                (x, y) = (
                    // Increment the coefficient of a.
                    y,
                    // Decrement the coefficient of n.
                    // Can overflow, but the result is casted to uint256 so that the
                    // next value of y is "wrapped around" to a value between 0 and n - 1.
                    x - y * int256(quotient)
                );
            }

            if (gcd != 1) return 0; // No inverse exists.
            return ternary(x < 0, n - uint256(-x), uint256(x)); // Wrap the result if it's negative.
        }
    }

    /**
     * @dev Variant of {invMod}. More efficient, but only works if `p` is known to be a prime greater than `2`.
     *
     * From https://en.wikipedia.org/wiki/Fermat%27s_little_theorem[Fermat's little theorem], we know that if p is
     * prime, then `a**(p-1) ≡ 1 mod p`. As a consequence, we have `a * a**(p-2) ≡ 1 mod p`, which means that
     * `a**(p-2)` is the modular multiplicative inverse of a in Fp.
     *
     * NOTE: this function does NOT check that `p` is a prime greater than `2`.
     */
    function invModPrime(uint256 a, uint256 p) internal view returns (uint256) {
        unchecked {
            return Math.modExp(a, p - 2, p);
        }
    }

    /**
     * @dev Returns the modular exponentiation of the specified base, exponent and modulus (b ** e % m)
     *
     * Requirements:
     * - modulus can't be zero
     * - underlying staticcall to precompile must succeed
     *
     * IMPORTANT: The result is only valid if the underlying call succeeds. When using this function, make
     * sure the chain you're using it on supports the precompiled contract for modular exponentiation
     * at address 0x05 as specified in https://eips.ethereum.org/EIPS/eip-198[EIP-198]. Otherwise,
     * the underlying function will succeed given the lack of a revert, but the result may be incorrectly
     * interpreted as 0.
     */
    function modExp(uint256 b, uint256 e, uint256 m) internal view returns (uint256) {
        (bool success, uint256 result) = tryModExp(b, e, m);
        if (!success) {
            Panic.panic(Panic.DIVISION_BY_ZERO);
        }
        return result;
    }

    /**
     * @dev Returns the modular exponentiation of the specified base, exponent and modulus (b ** e % m).
     * It includes a success flag indicating if the operation succeeded. Operation will be marked as failed if trying
     * to operate modulo 0 or if the underlying precompile reverted.
     *
     * IMPORTANT: The result is only valid if the success flag is true. When using this function, make sure the chain
     * you're using it on supports the precompiled contract for modular exponentiation at address 0x05 as specified in
     * https://eips.ethereum.org/EIPS/eip-198[EIP-198]. Otherwise, the underlying function will succeed given the lack
     * of a revert, but the result may be incorrectly interpreted as 0.
     */
    function tryModExp(uint256 b, uint256 e, uint256 m) internal view returns (bool success, uint256 result) {
        if (m == 0) return (false, 0);
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            // | Offset    | Content    | Content (Hex)                                                      |
            // |-----------|------------|--------------------------------------------------------------------|
            // | 0x00:0x1f | size of b  | 0x0000000000000000000000000000000000000000000000000000000000000020 |
            // | 0x20:0x3f | size of e  | 0x0000000000000000000000000000000000000000000000000000000000000020 |
            // | 0x40:0x5f | size of m  | 0x0000000000000000000000000000000000000000000000000000000000000020 |
            // | 0x60:0x7f | value of b | 0x<.............................................................b> |
            // | 0x80:0x9f | value of e | 0x<.............................................................e> |
            // | 0xa0:0xbf | value of m | 0x<.............................................................m> |
            mstore(ptr, 0x20)
            mstore(add(ptr, 0x20), 0x20)
            mstore(add(ptr, 0x40), 0x20)
            mstore(add(ptr, 0x60), b)
            mstore(add(ptr, 0x80), e)
            mstore(add(ptr, 0xa0), m)

            // Given the result < m, it's guaranteed to fit in 32 bytes,
            // so we can use the memory scratch space located at offset 0.
            success := staticcall(gas(), 0x05, ptr, 0xc0, 0x00, 0x20)
            result := mload(0x00)
        }
    }

    /**
     * @dev Variant of {modExp} that supports inputs of arbitrary length.
     */
    function modExp(bytes memory b, bytes memory e, bytes memory m) internal view returns (bytes memory) {
        (bool success, bytes memory result) = tryModExp(b, e, m);
        if (!success) {
            Panic.panic(Panic.DIVISION_BY_ZERO);
        }
        return result;
    }

    /**
     * @dev Variant of {tryModExp} that supports inputs of arbitrary length.
     */
    function tryModExp(
        bytes memory b,
        bytes memory e,
        bytes memory m
    ) internal view returns (bool success, bytes memory result) {
        if (_zeroBytes(m)) return (false, new bytes(0));

        uint256 mLen = m.length;

        // Encode call args in result and move the free memory pointer
        result = abi.encodePacked(b.length, e.length, mLen, b, e, m);

        assembly ("memory-safe") {
            let dataPtr := add(result, 0x20)
            // Write result on top of args to avoid allocating extra memory.
            success := staticcall(gas(), 0x05, dataPtr, mload(result), dataPtr, mLen)
            // Overwrite the length.
            // result.length > returndatasize() is guaranteed because returndatasize() == m.length
            mstore(result, mLen)
            // Set the memory pointer after the returned data.
            mstore(0x40, add(dataPtr, mLen))
        }
    }

    /**
     * @dev Returns whether the provided byte array is zero.
     */
    function _zeroBytes(bytes memory byteArray) private pure returns (bool) {
        for (uint256 i = 0; i < byteArray.length; ++i) {
            if (byteArray[i] != 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded
     * towards zero.
     *
     * This method is based on Newton's method for computing square roots; the algorithm is restricted to only
     * using integer operations.
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        unchecked {
            // Take care of easy edge cases when a == 0 or a == 1
            if (a <= 1) {
                return a;
            }

            // In this function, we use Newton's method to get a root of `f(x) := x² - a`. It involves building a
            // sequence x_n that converges toward sqrt(a). For each iteration x_n, we also define the error between
            // the current value as `ε_n = | x_n - sqrt(a) |`.
            //
            // For our first estimation, we consider `e` the smallest power of 2 which is bigger than the square root
            // of the target. (i.e. `2**(e-1) ≤ sqrt(a) < 2**e`). We know that `e ≤ 128` because `(2¹²⁸)² = 2²⁵⁶` is
            // bigger than any uint256.
            //
            // By noticing that
            // `2**(e-1) ≤ sqrt(a) < 2**e → (2**(e-1))² ≤ a < (2**e)² → 2**(2*e-2) ≤ a < 2**(2*e)`
            // we can deduce that `e - 1` is `log2(a) / 2`. We can thus compute `x_n = 2**(e-1)` using a method similar
            // to the msb function.
            uint256 aa = a;
            uint256 xn = 1;

            if (aa >= (1 << 128)) {
                aa >>= 128;
                xn <<= 64;
            }
            if (aa >= (1 << 64)) {
                aa >>= 64;
                xn <<= 32;
            }
            if (aa >= (1 << 32)) {
                aa >>= 32;
                xn <<= 16;
            }
            if (aa >= (1 << 16)) {
                aa >>= 16;
                xn <<= 8;
            }
            if (aa >= (1 << 8)) {
                aa >>= 8;
                xn <<= 4;
            }
            if (aa >= (1 << 4)) {
                aa >>= 4;
                xn <<= 2;
            }
            if (aa >= (1 << 2)) {
                xn <<= 1;
            }

            // We now have x_n such that `x_n = 2**(e-1) ≤ sqrt(a) < 2**e = 2 * x_n`. This implies ε_n ≤ 2**(e-1).
            //
            // We can refine our estimation by noticing that the middle of that interval minimizes the error.
            // If we move x_n to equal 2**(e-1) + 2**(e-2), then we reduce the error to ε_n ≤ 2**(e-2).
            // This is going to be our x_0 (and ε_0)
            xn = (3 * xn) >> 1; // ε_0 := | x_0 - sqrt(a) | ≤ 2**(e-2)

            // From here, Newton's method give us:
            // x_{n+1} = (x_n + a / x_n) / 2
            //
            // One should note that:
            // x_{n+1}² - a = ((x_n + a / x_n) / 2)² - a
            //              = ((x_n² + a) / (2 * x_n))² - a
            //              = (x_n⁴ + 2 * a * x_n² + a²) / (4 * x_n²) - a
            //              = (x_n⁴ + 2 * a * x_n² + a² - 4 * a * x_n²) / (4 * x_n²)
            //              = (x_n⁴ - 2 * a * x_n² + a²) / (4 * x_n²)
            //              = (x_n² - a)² / (2 * x_n)²
            //              = ((x_n² - a) / (2 * x_n))²
            //              ≥ 0
            // Which proves that for all n ≥ 1, sqrt(a) ≤ x_n
            //
            // This gives us the proof of quadratic convergence of the sequence:
            // ε_{n+1} = | x_{n+1} - sqrt(a) |
            //         = | (x_n + a / x_n) / 2 - sqrt(a) |
            //         = | (x_n² + a - 2*x_n*sqrt(a)) / (2 * x_n) |
            //         = | (x_n - sqrt(a))² / (2 * x_n) |
            //         = | ε_n² / (2 * x_n) |
            //         = ε_n² / | (2 * x_n) |
            //
            // For the first iteration, we have a special case where x_0 is known:
            // ε_1 = ε_0² / | (2 * x_0) |
            //     ≤ (2**(e-2))² / (2 * (2**(e-1) + 2**(e-2)))
            //     ≤ 2**(2*e-4) / (3 * 2**(e-1))
            //     ≤ 2**(e-3) / 3
            //     ≤ 2**(e-3-log2(3))
            //     ≤ 2**(e-4.5)
            //
            // For the following iterations, we use the fact that, 2**(e-1) ≤ sqrt(a) ≤ x_n:
            // ε_{n+1} = ε_n² / | (2 * x_n) |
            //         ≤ (2**(e-k))² / (2 * 2**(e-1))
            //         ≤ 2**(2*e-2*k) / 2**e
            //         ≤ 2**(e-2*k)
            xn = (xn + a / xn) >> 1; // ε_1 := | x_1 - sqrt(a) | ≤ 2**(e-4.5)  -- special case, see above
            xn = (xn + a / xn) >> 1; // ε_2 := | x_2 - sqrt(a) | ≤ 2**(e-9)    -- general case with k = 4.5
            xn = (xn + a / xn) >> 1; // ε_3 := | x_3 - sqrt(a) | ≤ 2**(e-18)   -- general case with k = 9
            xn = (xn + a / xn) >> 1; // ε_4 := | x_4 - sqrt(a) | ≤ 2**(e-36)   -- general case with k = 18
            xn = (xn + a / xn) >> 1; // ε_5 := | x_5 - sqrt(a) | ≤ 2**(e-72)   -- general case with k = 36
            xn = (xn + a / xn) >> 1; // ε_6 := | x_6 - sqrt(a) | ≤ 2**(e-144)  -- general case with k = 72

            // Because e ≤ 128 (as discussed during the first estimation phase), we know have reached a precision
            // ε_6 ≤ 2**(e-144) < 1. Given we're operating on integers, then we can ensure that xn is now either
            // sqrt(a) or sqrt(a) + 1.
            return xn - SafeCast.toUint(xn > a / xn);
        }
    }

    /**
     * @dev Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + SafeCast.toUint(unsignedRoundsUp(rounding) && result * result < a);
        }
    }

    /**
     * @dev Return the log in base 2 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     */
    function log2(uint256 x) internal pure returns (uint256 r) {
        // If value has upper 128 bits set, log2 result is at least 128
        r = SafeCast.toUint(x > 0xffffffffffffffffffffffffffffffff) << 7;
        // If upper 64 bits of 128-bit half set, add 64 to result
        r |= SafeCast.toUint((x >> r) > 0xffffffffffffffff) << 6;
        // If upper 32 bits of 64-bit half set, add 32 to result
        r |= SafeCast.toUint((x >> r) > 0xffffffff) << 5;
        // If upper 16 bits of 32-bit half set, add 16 to result
        r |= SafeCast.toUint((x >> r) > 0xffff) << 4;
        // If upper 8 bits of 16-bit half set, add 8 to result
        r |= SafeCast.toUint((x >> r) > 0xff) << 3;
        // If upper 4 bits of 8-bit half set, add 4 to result
        r |= SafeCast.toUint((x >> r) > 0xf) << 2;

        // Shifts value right by the current result and use it as an index into this lookup table:
        //
        // | x (4 bits) |  index  | table[index] = MSB position |
        // |------------|---------|-----------------------------|
        // |    0000    |    0    |        table[0] = 0         |
        // |    0001    |    1    |        table[1] = 0         |
        // |    0010    |    2    |        table[2] = 1         |
        // |    0011    |    3    |        table[3] = 1         |
        // |    0100    |    4    |        table[4] = 2         |
        // |    0101    |    5    |        table[5] = 2         |
        // |    0110    |    6    |        table[6] = 2         |
        // |    0111    |    7    |        table[7] = 2         |
        // |    1000    |    8    |        table[8] = 3         |
        // |    1001    |    9    |        table[9] = 3         |
        // |    1010    |   10    |        table[10] = 3        |
        // |    1011    |   11    |        table[11] = 3        |
        // |    1100    |   12    |        table[12] = 3        |
        // |    1101    |   13    |        table[13] = 3        |
        // |    1110    |   14    |        table[14] = 3        |
        // |    1111    |   15    |        table[15] = 3        |
        //
        // The lookup table is represented as a 32-byte value with the MSB positions for 0-15 in the last 16 bytes.
        assembly ("memory-safe") {
            r := or(r, byte(shr(r, x), 0x0000010102020202030303030303030300000000000000000000000000000000))
        }
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + SafeCast.toUint(unsignedRoundsUp(rounding) && 1 << result < value);
        }
    }

    /**
     * @dev Return the log in base 10 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + SafeCast.toUint(unsignedRoundsUp(rounding) && 10 ** result < value);
        }
    }

    /**
     * @dev Return the log in base 256 of a positive value rounded towards zero.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 x) internal pure returns (uint256 r) {
        // If value has upper 128 bits set, log2 result is at least 128
        r = SafeCast.toUint(x > 0xffffffffffffffffffffffffffffffff) << 7;
        // If upper 64 bits of 128-bit half set, add 64 to result
        r |= SafeCast.toUint((x >> r) > 0xffffffffffffffff) << 6;
        // If upper 32 bits of 64-bit half set, add 32 to result
        r |= SafeCast.toUint((x >> r) > 0xffffffff) << 5;
        // If upper 16 bits of 32-bit half set, add 16 to result
        r |= SafeCast.toUint((x >> r) > 0xffff) << 4;
        // Add 1 if upper 8 bits of 16-bit half set, and divide accumulated result by 8
        return (r >> 3) | SafeCast.toUint((x >> r) > 0xff);
    }

    /**
     * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + SafeCast.toUint(unsignedRoundsUp(rounding) && 1 << (result << 3) < value);
        }
    }

    /**
     * @dev Returns whether a provided rounding mode is considered rounding up for unsigned integers.
     */
    function unsignedRoundsUp(Rounding rounding) internal pure returns (bool) {
        return uint8(rounding) % 2 == 1;
    }
}


// File @openzeppelin/contracts/utils/math/SignedMath.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/math/SignedMath.sol)

pragma solidity ^0.8.20;

/**
 * @dev Standard signed math utilities missing in the Solidity language.
 */
library SignedMath {
    /**
     * @dev Branchless ternary evaluation for `a ? b : c`. Gas costs are constant.
     *
     * IMPORTANT: This function may reduce bytecode size and consume less gas when used standalone.
     * However, the compiler may optimize Solidity ternary operations (i.e. `a ? b : c`) to only compute
     * one branch when needed, making this function more expensive.
     */
    function ternary(bool condition, int256 a, int256 b) internal pure returns (int256) {
        unchecked {
            // branchless ternary works because:
            // b ^ (a ^ b) == a
            // b ^ 0 == b
            return b ^ ((a ^ b) * int256(SafeCast.toUint(condition)));
        }
    }

    /**
     * @dev Returns the largest of two signed numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return ternary(a > b, a, b);
    }

    /**
     * @dev Returns the smallest of two signed numbers.
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return ternary(a < b, a, b);
    }

    /**
     * @dev Returns the average of two signed numbers without overflow.
     * The result is rounded towards zero.
     */
    function average(int256 a, int256 b) internal pure returns (int256) {
        // Formula from the book "Hacker's Delight"
        int256 x = (a & b) + ((a ^ b) >> 1);
        return x + (int256(uint256(x) >> 255) & (a ^ b));
    }

    /**
     * @dev Returns the absolute unsigned value of a signed value.
     */
    function abs(int256 n) internal pure returns (uint256) {
        unchecked {
            // Formula from the "Bit Twiddling Hacks" by Sean Eron Anderson.
            // Since `n` is a signed integer, the generated bytecode will use the SAR opcode to perform the right shift,
            // taking advantage of the most significant (or "sign" bit) in two's complement representation.
            // This opcode adds new most significant bits set to the value of the previous most significant bit. As a result,
            // the mask will either be `bytes32(0)` (if n is positive) or `~bytes32(0)` (if n is negative).
            int256 mask = n >> 255;

            // A `bytes32(0)` mask leaves the input unchanged, while a `~bytes32(0)` mask complements it.
            return uint256((n + mask) ^ mask);
        }
    }
}


// File @openzeppelin/contracts/utils/Strings.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (utils/Strings.sol)

pragma solidity ^0.8.20;



/**
 * @dev String operations.
 */
library Strings {
    using SafeCast for *;

    bytes16 private constant HEX_DIGITS = "0123456789abcdef";
    uint8 private constant ADDRESS_LENGTH = 20;
    uint256 private constant SPECIAL_CHARS_LOOKUP =
        (1 << 0x08) | // backspace
            (1 << 0x09) | // tab
            (1 << 0x0a) | // newline
            (1 << 0x0c) | // form feed
            (1 << 0x0d) | // carriage return
            (1 << 0x22) | // double quote
            (1 << 0x5c); // backslash

    /**
     * @dev The `value` string doesn't fit in the specified `length`.
     */
    error StringsInsufficientHexLength(uint256 value, uint256 length);

    /**
     * @dev The string being parsed contains characters that are not in scope of the given base.
     */
    error StringsInvalidChar();

    /**
     * @dev The string being parsed is not a properly formatted address.
     */
    error StringsInvalidAddressFormat();

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            assembly ("memory-safe") {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                assembly ("memory-safe") {
                    mstore8(ptr, byte(mod(value, 10), HEX_DIGITS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `int256` to its ASCII `string` decimal representation.
     */
    function toStringSigned(int256 value) internal pure returns (string memory) {
        return string.concat(value < 0 ? "-" : "", toString(SignedMath.abs(value)));
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        unchecked {
            return toHexString(value, Math.log256(value) + 1);
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        uint256 localValue = value;
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = HEX_DIGITS[localValue & 0xf];
            localValue >>= 4;
        }
        if (localValue != 0) {
            revert StringsInsufficientHexLength(value, length);
        }
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal
     * representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), ADDRESS_LENGTH);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its checksummed ASCII `string` hexadecimal
     * representation, according to EIP-55.
     */
    function toChecksumHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = bytes(toHexString(addr));

        // hash the hex part of buffer (skip length + 2 bytes, length 40)
        uint256 hashValue;
        assembly ("memory-safe") {
            hashValue := shr(96, keccak256(add(buffer, 0x22), 40))
        }

        for (uint256 i = 41; i > 1; --i) {
            // possible values for buffer[i] are 48 (0) to 57 (9) and 97 (a) to 102 (f)
            if (hashValue & 0xf > 7 && uint8(buffer[i]) > 96) {
                // case shift by xoring with 0x20
                buffer[i] ^= 0x20;
            }
            hashValue >>= 4;
        }
        return string(buffer);
    }

    /**
     * @dev Returns true if the two strings are equal.
     */
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return bytes(a).length == bytes(b).length && keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /**
     * @dev Parse a decimal string and returns the value as a `uint256`.
     *
     * Requirements:
     * - The string must be formatted as `[0-9]*`
     * - The result must fit into an `uint256` type
     */
    function parseUint(string memory input) internal pure returns (uint256) {
        return parseUint(input, 0, bytes(input).length);
    }

    /**
     * @dev Variant of {parseUint-string} that parses a substring of `input` located between position `begin` (included) and
     * `end` (excluded).
     *
     * Requirements:
     * - The substring must be formatted as `[0-9]*`
     * - The result must fit into an `uint256` type
     */
    function parseUint(string memory input, uint256 begin, uint256 end) internal pure returns (uint256) {
        (bool success, uint256 value) = tryParseUint(input, begin, end);
        if (!success) revert StringsInvalidChar();
        return value;
    }

    /**
     * @dev Variant of {parseUint-string} that returns false if the parsing fails because of an invalid character.
     *
     * NOTE: This function will revert if the result does not fit in a `uint256`.
     */
    function tryParseUint(string memory input) internal pure returns (bool success, uint256 value) {
        return _tryParseUintUncheckedBounds(input, 0, bytes(input).length);
    }

    /**
     * @dev Variant of {parseUint-string-uint256-uint256} that returns false if the parsing fails because of an invalid
     * character.
     *
     * NOTE: This function will revert if the result does not fit in a `uint256`.
     */
    function tryParseUint(
        string memory input,
        uint256 begin,
        uint256 end
    ) internal pure returns (bool success, uint256 value) {
        if (end > bytes(input).length || begin > end) return (false, 0);
        return _tryParseUintUncheckedBounds(input, begin, end);
    }

    /**
     * @dev Implementation of {tryParseUint-string-uint256-uint256} that does not check bounds. Caller should make sure that
     * `begin <= end <= input.length`. Other inputs would result in undefined behavior.
     */
    function _tryParseUintUncheckedBounds(
        string memory input,
        uint256 begin,
        uint256 end
    ) private pure returns (bool success, uint256 value) {
        bytes memory buffer = bytes(input);

        uint256 result = 0;
        for (uint256 i = begin; i < end; ++i) {
            uint8 chr = _tryParseChr(bytes1(_unsafeReadBytesOffset(buffer, i)));
            if (chr > 9) return (false, 0);
            result *= 10;
            result += chr;
        }
        return (true, result);
    }

    /**
     * @dev Parse a decimal string and returns the value as a `int256`.
     *
     * Requirements:
     * - The string must be formatted as `[-+]?[0-9]*`
     * - The result must fit in an `int256` type.
     */
    function parseInt(string memory input) internal pure returns (int256) {
        return parseInt(input, 0, bytes(input).length);
    }

    /**
     * @dev Variant of {parseInt-string} that parses a substring of `input` located between position `begin` (included) and
     * `end` (excluded).
     *
     * Requirements:
     * - The substring must be formatted as `[-+]?[0-9]*`
     * - The result must fit in an `int256` type.
     */
    function parseInt(string memory input, uint256 begin, uint256 end) internal pure returns (int256) {
        (bool success, int256 value) = tryParseInt(input, begin, end);
        if (!success) revert StringsInvalidChar();
        return value;
    }

    /**
     * @dev Variant of {parseInt-string} that returns false if the parsing fails because of an invalid character or if
     * the result does not fit in a `int256`.
     *
     * NOTE: This function will revert if the absolute value of the result does not fit in a `uint256`.
     */
    function tryParseInt(string memory input) internal pure returns (bool success, int256 value) {
        return _tryParseIntUncheckedBounds(input, 0, bytes(input).length);
    }

    uint256 private constant ABS_MIN_INT256 = 2 ** 255;

    /**
     * @dev Variant of {parseInt-string-uint256-uint256} that returns false if the parsing fails because of an invalid
     * character or if the result does not fit in a `int256`.
     *
     * NOTE: This function will revert if the absolute value of the result does not fit in a `uint256`.
     */
    function tryParseInt(
        string memory input,
        uint256 begin,
        uint256 end
    ) internal pure returns (bool success, int256 value) {
        if (end > bytes(input).length || begin > end) return (false, 0);
        return _tryParseIntUncheckedBounds(input, begin, end);
    }

    /**
     * @dev Implementation of {tryParseInt-string-uint256-uint256} that does not check bounds. Caller should make sure that
     * `begin <= end <= input.length`. Other inputs would result in undefined behavior.
     */
    function _tryParseIntUncheckedBounds(
        string memory input,
        uint256 begin,
        uint256 end
    ) private pure returns (bool success, int256 value) {
        bytes memory buffer = bytes(input);

        // Check presence of a negative sign.
        bytes1 sign = begin == end ? bytes1(0) : bytes1(_unsafeReadBytesOffset(buffer, begin)); // don't do out-of-bound (possibly unsafe) read if sub-string is empty
        bool positiveSign = sign == bytes1("+");
        bool negativeSign = sign == bytes1("-");
        uint256 offset = (positiveSign || negativeSign).toUint();

        (bool absSuccess, uint256 absValue) = tryParseUint(input, begin + offset, end);

        if (absSuccess && absValue < ABS_MIN_INT256) {
            return (true, negativeSign ? -int256(absValue) : int256(absValue));
        } else if (absSuccess && negativeSign && absValue == ABS_MIN_INT256) {
            return (true, type(int256).min);
        } else return (false, 0);
    }

    /**
     * @dev Parse a hexadecimal string (with or without "0x" prefix), and returns the value as a `uint256`.
     *
     * Requirements:
     * - The string must be formatted as `(0x)?[0-9a-fA-F]*`
     * - The result must fit in an `uint256` type.
     */
    function parseHexUint(string memory input) internal pure returns (uint256) {
        return parseHexUint(input, 0, bytes(input).length);
    }

    /**
     * @dev Variant of {parseHexUint-string} that parses a substring of `input` located between position `begin` (included) and
     * `end` (excluded).
     *
     * Requirements:
     * - The substring must be formatted as `(0x)?[0-9a-fA-F]*`
     * - The result must fit in an `uint256` type.
     */
    function parseHexUint(string memory input, uint256 begin, uint256 end) internal pure returns (uint256) {
        (bool success, uint256 value) = tryParseHexUint(input, begin, end);
        if (!success) revert StringsInvalidChar();
        return value;
    }

    /**
     * @dev Variant of {parseHexUint-string} that returns false if the parsing fails because of an invalid character.
     *
     * NOTE: This function will revert if the result does not fit in a `uint256`.
     */
    function tryParseHexUint(string memory input) internal pure returns (bool success, uint256 value) {
        return _tryParseHexUintUncheckedBounds(input, 0, bytes(input).length);
    }

    /**
     * @dev Variant of {parseHexUint-string-uint256-uint256} that returns false if the parsing fails because of an
     * invalid character.
     *
     * NOTE: This function will revert if the result does not fit in a `uint256`.
     */
    function tryParseHexUint(
        string memory input,
        uint256 begin,
        uint256 end
    ) internal pure returns (bool success, uint256 value) {
        if (end > bytes(input).length || begin > end) return (false, 0);
        return _tryParseHexUintUncheckedBounds(input, begin, end);
    }

    /**
     * @dev Implementation of {tryParseHexUint-string-uint256-uint256} that does not check bounds. Caller should make sure that
     * `begin <= end <= input.length`. Other inputs would result in undefined behavior.
     */
    function _tryParseHexUintUncheckedBounds(
        string memory input,
        uint256 begin,
        uint256 end
    ) private pure returns (bool success, uint256 value) {
        bytes memory buffer = bytes(input);

        // skip 0x prefix if present
        bool hasPrefix = (end > begin + 1) && bytes2(_unsafeReadBytesOffset(buffer, begin)) == bytes2("0x"); // don't do out-of-bound (possibly unsafe) read if sub-string is empty
        uint256 offset = hasPrefix.toUint() * 2;

        uint256 result = 0;
        for (uint256 i = begin + offset; i < end; ++i) {
            uint8 chr = _tryParseChr(bytes1(_unsafeReadBytesOffset(buffer, i)));
            if (chr > 15) return (false, 0);
            result *= 16;
            unchecked {
                // Multiplying by 16 is equivalent to a shift of 4 bits (with additional overflow check).
                // This guarantees that adding a value < 16 will not cause an overflow, hence the unchecked.
                result += chr;
            }
        }
        return (true, result);
    }

    /**
     * @dev Parse a hexadecimal string (with or without "0x" prefix), and returns the value as an `address`.
     *
     * Requirements:
     * - The string must be formatted as `(0x)?[0-9a-fA-F]{40}`
     */
    function parseAddress(string memory input) internal pure returns (address) {
        return parseAddress(input, 0, bytes(input).length);
    }

    /**
     * @dev Variant of {parseAddress-string} that parses a substring of `input` located between position `begin` (included) and
     * `end` (excluded).
     *
     * Requirements:
     * - The substring must be formatted as `(0x)?[0-9a-fA-F]{40}`
     */
    function parseAddress(string memory input, uint256 begin, uint256 end) internal pure returns (address) {
        (bool success, address value) = tryParseAddress(input, begin, end);
        if (!success) revert StringsInvalidAddressFormat();
        return value;
    }

    /**
     * @dev Variant of {parseAddress-string} that returns false if the parsing fails because the input is not a properly
     * formatted address. See {parseAddress-string} requirements.
     */
    function tryParseAddress(string memory input) internal pure returns (bool success, address value) {
        return tryParseAddress(input, 0, bytes(input).length);
    }

    /**
     * @dev Variant of {parseAddress-string-uint256-uint256} that returns false if the parsing fails because input is not a properly
     * formatted address. See {parseAddress-string-uint256-uint256} requirements.
     */
    function tryParseAddress(
        string memory input,
        uint256 begin,
        uint256 end
    ) internal pure returns (bool success, address value) {
        if (end > bytes(input).length || begin > end) return (false, address(0));

        bool hasPrefix = (end > begin + 1) && bytes2(_unsafeReadBytesOffset(bytes(input), begin)) == bytes2("0x"); // don't do out-of-bound (possibly unsafe) read if sub-string is empty
        uint256 expectedLength = 40 + hasPrefix.toUint() * 2;

        // check that input is the correct length
        if (end - begin == expectedLength) {
            // length guarantees that this does not overflow, and value is at most type(uint160).max
            (bool s, uint256 v) = _tryParseHexUintUncheckedBounds(input, begin, end);
            return (s, address(uint160(v)));
        } else {
            return (false, address(0));
        }
    }

    function _tryParseChr(bytes1 chr) private pure returns (uint8) {
        uint8 value = uint8(chr);

        // Try to parse `chr`:
        // - Case 1: [0-9]
        // - Case 2: [a-f]
        // - Case 3: [A-F]
        // - otherwise not supported
        unchecked {
            if (value > 47 && value < 58) value -= 48;
            else if (value > 96 && value < 103) value -= 87;
            else if (value > 64 && value < 71) value -= 55;
            else return type(uint8).max;
        }

        return value;
    }

    /**
     * @dev Escape special characters in JSON strings. This can be useful to prevent JSON injection in NFT metadata.
     *
     * WARNING: This function should only be used in double quoted JSON strings. Single quotes are not escaped.
     *
     * NOTE: This function escapes all unicode characters, and not just the ones in ranges defined in section 2.5 of
     * RFC-4627 (U+0000 to U+001F, U+0022 and U+005C). ECMAScript's `JSON.parse` does recover escaped unicode
     * characters that are not in this range, but other tooling may provide different results.
     */
    function escapeJSON(string memory input) internal pure returns (string memory) {
        bytes memory buffer = bytes(input);
        bytes memory output = new bytes(2 * buffer.length); // worst case scenario
        uint256 outputLength = 0;

        for (uint256 i; i < buffer.length; ++i) {
            bytes1 char = bytes1(_unsafeReadBytesOffset(buffer, i));
            if (((SPECIAL_CHARS_LOOKUP & (1 << uint8(char))) != 0)) {
                output[outputLength++] = "\\";
                if (char == 0x08) output[outputLength++] = "b";
                else if (char == 0x09) output[outputLength++] = "t";
                else if (char == 0x0a) output[outputLength++] = "n";
                else if (char == 0x0c) output[outputLength++] = "f";
                else if (char == 0x0d) output[outputLength++] = "r";
                else if (char == 0x5c) output[outputLength++] = "\\";
                else if (char == 0x22) {
                    // solhint-disable-next-line quotes
                    output[outputLength++] = '"';
                }
            } else {
                output[outputLength++] = char;
            }
        }
        // write the actual length and deallocate unused memory
        assembly ("memory-safe") {
            mstore(output, outputLength)
            mstore(0x40, add(output, shl(5, shr(5, add(outputLength, 63)))))
        }

        return string(output);
    }

    /**
     * @dev Reads a bytes32 from a bytes array without bounds checking.
     *
     * NOTE: making this function internal would mean it could be used with memory unsafe offset, and marking the
     * assembly block as such would prevent some optimizations.
     */
    function _unsafeReadBytesOffset(bytes memory buffer, uint256 offset) private pure returns (bytes32 value) {
        // This is not memory safe in the general case, but all calls to this private function are within bounds.
        assembly ("memory-safe") {
            value := mload(add(buffer, add(0x20, offset)))
        }
    }
}


// File @openzeppelin/contracts/token/ERC721/ERC721.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.20;







/**
 * @dev Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC-721] Non-Fungible Token Standard, including
 * the Metadata extension, but not including the Enumerable extension, which is available separately as
 * {ERC721Enumerable}.
 */
abstract contract ERC721 is Context, ERC165, IERC721, IERC721Metadata, IERC721Errors {
    using Strings for uint256;

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    mapping(uint256 tokenId => address) private _owners;

    mapping(address owner => uint256) private _balances;

    mapping(uint256 tokenId => address) private _tokenApprovals;

    mapping(address owner => mapping(address operator => bool)) private _operatorApprovals;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) {
            revert ERC721InvalidOwner(address(0));
        }
        return _balances[owner];
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        return _requireOwned(tokenId);
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string.concat(baseURI, tokenId.toString()) : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual {
        _approve(to, tokenId, _msgSender());
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual returns (address) {
        _requireOwned(tokenId);

        return _getApproved(tokenId);
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(address from, address to, uint256 tokenId) public virtual {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        address previousOwner = _update(to, tokenId, _msgSender());
        if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual {
        transferFrom(from, to, tokenId);
        ERC721Utils.checkOnERC721Received(_msgSender(), from, to, tokenId, data);
    }

    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     *
     * IMPORTANT: Any overrides to this function that add ownership of tokens not tracked by the
     * core ERC-721 logic MUST be matched with the use of {_increaseBalance} to keep balances
     * consistent with ownership. The invariant to preserve is that for any address `a` the value returned by
     * `balanceOf(a)` must be equal to the number of tokens such that `_ownerOf(tokenId)` is `a`.
     */
    function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
        return _owners[tokenId];
    }

    /**
     * @dev Returns the approved address for `tokenId`. Returns 0 if `tokenId` is not minted.
     */
    function _getApproved(uint256 tokenId) internal view virtual returns (address) {
        return _tokenApprovals[tokenId];
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `owner`'s tokens, or `tokenId` in
     * particular (ignoring whether it is owned by `owner`).
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _isAuthorized(address owner, address spender, uint256 tokenId) internal view virtual returns (bool) {
        return
            spender != address(0) &&
            (owner == spender || isApprovedForAll(owner, spender) || _getApproved(tokenId) == spender);
    }

    /**
     * @dev Checks if `spender` can operate on `tokenId`, assuming the provided `owner` is the actual owner.
     * Reverts if:
     * - `spender` does not have approval from `owner` for `tokenId`.
     * - `spender` does not have approval to manage all of `owner`'s assets.
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _checkAuthorized(address owner, address spender, uint256 tokenId) internal view virtual {
        if (!_isAuthorized(owner, spender, tokenId)) {
            if (owner == address(0)) {
                revert ERC721NonexistentToken(tokenId);
            } else {
                revert ERC721InsufficientApproval(spender, tokenId);
            }
        }
    }

    /**
     * @dev Unsafe write access to the balances, used by extensions that "mint" tokens using an {ownerOf} override.
     *
     * NOTE: the value is limited to type(uint128).max. This protect against _balance overflow. It is unrealistic that
     * a uint256 would ever overflow from increments when these increments are bounded to uint128 values.
     *
     * WARNING: Increasing an account's balance using this function tends to be paired with an override of the
     * {_ownerOf} function to resolve the ownership of the corresponding tokens so that balances and ownership
     * remain consistent with one another.
     */
    function _increaseBalance(address account, uint128 value) internal virtual {
        unchecked {
            _balances[account] += value;
        }
    }

    /**
     * @dev Transfers `tokenId` from its current owner to `to`, or alternatively mints (or burns) if the current owner
     * (or `to`) is the zero address. Returns the owner of the `tokenId` before the update.
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that
     * `auth` is either the owner of the token, or approved to operate on the token (by the owner).
     *
     * Emits a {Transfer} event.
     *
     * NOTE: If overriding this function in a way that tracks balances, see also {_increaseBalance}.
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual returns (address) {
        address from = _ownerOf(tokenId);

        // Perform (optional) operator check
        if (auth != address(0)) {
            _checkAuthorized(from, auth, tokenId);
        }

        // Execute the update
        if (from != address(0)) {
            // Clear approval. No need to re-authorize or emit the Approval event
            _approve(address(0), tokenId, address(0), false);

            unchecked {
                _balances[from] -= 1;
            }
        }

        if (to != address(0)) {
            unchecked {
                _balances[to] += 1;
            }
        }

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        return from;
    }

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner != address(0)) {
            revert ERC721InvalidSender(address(0));
        }
    }

    /**
     * @dev Mints `tokenId`, transfers it to `to` and checks for `to` acceptance.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(address to, uint256 tokenId, bytes memory data) internal virtual {
        _mint(to, tokenId);
        ERC721Utils.checkOnERC721Received(_msgSender(), address(0), to, tokenId, data);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     * This is an internal function that does not check if the sender is authorized to operate on the token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        } else if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking that contract recipients
     * are aware of the ERC-721 standard to prevent tokens from being forever locked.
     *
     * `data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is like {safeTransferFrom} in the sense that it invokes
     * {IERC721Receiver-onERC721Received} on the receiver, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `tokenId` token must exist and be owned by `from`.
     * - `to` cannot be the zero address.
     * - `from` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(address from, address to, uint256 tokenId) internal {
        _safeTransfer(from, to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeTransfer-address-address-uint256-}[`_safeTransfer`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal virtual {
        _transfer(from, to, tokenId);
        ERC721Utils.checkOnERC721Received(_msgSender(), from, to, tokenId, data);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that `auth` is
     * either the owner of the token, or approved to operate on all tokens held by this owner.
     *
     * Emits an {Approval} event.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address to, uint256 tokenId, address auth) internal {
        _approve(to, tokenId, auth, true);
    }

    /**
     * @dev Variant of `_approve` with an optional flag to enable or disable the {Approval} event. The event is not
     * emitted in the context of transfers.
     */
    function _approve(address to, uint256 tokenId, address auth, bool emitEvent) internal virtual {
        // Avoid reading the owner unless necessary
        if (emitEvent || auth != address(0)) {
            address owner = _requireOwned(tokenId);

            // We do not use _isAuthorized because single-token approvals should not be able to call approve
            if (auth != address(0) && owner != auth && !isApprovedForAll(owner, auth)) {
                revert ERC721InvalidApprover(auth);
            }

            if (emitEvent) {
                emit Approval(owner, to, tokenId);
            }
        }

        _tokenApprovals[tokenId] = to;
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Requirements:
     * - operator can't be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        if (operator == address(0)) {
            revert ERC721InvalidOperator(operator);
        }
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
     * Returns the owner.
     *
     * Overrides to ownership logic should be done to {_ownerOf}.
     */
    function _requireOwned(uint256 tokenId) internal view returns (address) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        return owner;
    }
}


// File @openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC721/extensions/ERC721URIStorage.sol)

pragma solidity ^0.8.20;




/**
 * @dev ERC-721 token with storage based token URI management.
 */
abstract contract ERC721URIStorage is IERC4906, ERC721 {
    using Strings for uint256;

    // Interface ID as defined in ERC-4906. This does not correspond to a traditional interface ID as ERC-4906 only
    // defines events and does not include any external function.
    bytes4 private constant ERC4906_INTERFACE_ID = bytes4(0x49064906);

    // Optional mapping for token URIs
    mapping(uint256 tokenId => string) private _tokenURIs;

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
        return interfaceId == ERC4906_INTERFACE_ID || super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via string.concat).
        if (bytes(_tokenURI).length > 0) {
            return string.concat(base, _tokenURI);
        }

        return super.tokenURI(tokenId);
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Emits {IERC4906-MetadataUpdate}.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenId] = _tokenURI;
        emit MetadataUpdate(tokenId);
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


// File contracts/Market.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;

contract Market {
    enum State { Funding, Active, Repaid, Defaulted }
    
    State public currentState;
    address public immutable borrower;
    IERC20 public immutable asset;
    uint256 public immutable loanAmount;
    uint256 public immutable interestRateBps;
    uint256 public immutable tenorSeconds;
    string public projectDataCID;
    uint256 public totalDeposited;
    uint256 public fundingDeadline;
    uint256 public loanStartTime;
    mapping(address => uint256) public depositsOf;
    
    event Deposited(address indexed lender, uint256 amount);
    event Claimed(address indexed lender, uint256 amount);
    event LoanStarted(uint256 startTime, uint256 fundingAmount);
    event LoanRepaid(uint256 totalAmount);
    event MarkedAsDefaulted();

    constructor(
        address _asset,
        address _borrower,
        uint256 _loanAmount,
        uint256 _interestRateBps,
        uint256 _tenorSeconds,
        string memory _projectDataCID
    ) {
        asset = IERC20(_asset);
        borrower = _borrower;
        loanAmount = _loanAmount;
        interestRateBps = _interestRateBps;
        tenorSeconds = _tenorSeconds;
        projectDataCID = _projectDataCID;
        currentState = State.Funding;
        fundingDeadline = block.timestamp + 30 days;
    }

    function deposit(uint256 _amount) external {
        require(currentState == State.Funding, "Not in funding state");
        uint256 amountToDeposit = totalDeposited + _amount > loanAmount ? loanAmount - totalDeposited : _amount;
        require(amountToDeposit > 0, "Market is fully funded");
        totalDeposited += amountToDeposit;
        depositsOf[msg.sender] += amountToDeposit;
        asset.transferFrom(msg.sender, address(this), amountToDeposit);
        emit Deposited(msg.sender, amountToDeposit);
    }

    function startAndBorrow() external {
        require(msg.sender == borrower, "Only borrower");
        require(currentState == State.Funding, "Loan not in funding state");
        require(totalDeposited == loanAmount, "Funding not complete");
        currentState = State.Active;
        loanStartTime = block.timestamp;
        asset.transfer(borrower, loanAmount);
        emit LoanStarted(loanStartTime, loanAmount);
    }

    function repay() external {
        require(currentState == State.Active, "Loan is not active");
        require(msg.sender == borrower, "Only borrower can repay");
        
        // Calculate actual time elapsed since loan start
        uint256 timeElapsed = block.timestamp - loanStartTime;
        
        // Cap at tenor seconds to prevent over-calculation
        uint256 actualTime = timeElapsed > tenorSeconds ? tenorSeconds : timeElapsed;
        
        // Interest calculation based on actual time elapsed
        uint256 interest = (loanAmount * interestRateBps * actualTime) / (10000 * 365 days);
        uint256 totalOwed = loanAmount + interest;
        
        currentState = State.Repaid;
        asset.transferFrom(msg.sender, address(this), totalOwed);
        emit LoanRepaid(totalOwed);
    }

    function claim() external {
        require(currentState == State.Repaid || currentState == State.Defaulted, "Loan not finished");
        uint256 principal = depositsOf[msg.sender];
        require(principal > 0, "No deposit to claim");
        uint256 amountToClaim = principal;
        
        if (currentState == State.Repaid) {
            // Calculate interest based on actual time elapsed (same as repay function)
            uint256 timeElapsed = block.timestamp - loanStartTime;
            uint256 actualTime = timeElapsed > tenorSeconds ? tenorSeconds : timeElapsed;
            uint256 totalInterest = (loanAmount * interestRateBps * actualTime) / (10000 * 365 days);
            uint256 myInterest = (principal * totalInterest) / loanAmount;
            amountToClaim += myInterest;
        } else if (currentState == State.Defaulted) {
            // In default state, lenders get partial recovery based on available funds
            uint256 contractBalance = asset.balanceOf(address(this));
            uint256 recoveryRate = 70; // 70% recovery rate if funds available
            uint256 idealRecovery = (principal * recoveryRate) / 100;
            
            // Calculate proportional recovery based on available funds
            if (contractBalance >= totalDeposited * recoveryRate / 100) {
                amountToClaim = idealRecovery;
            } else {
                // Pro-rata recovery based on available balance
                amountToClaim = (principal * contractBalance) / totalDeposited;
            }
        }
        
        depositsOf[msg.sender] = 0;
        asset.transfer(msg.sender, amountToClaim);
        emit Claimed(msg.sender, amountToClaim);
    }

    function markAsDefaulted() external {
        require(currentState == State.Active, "Loan is not active");
        require(block.timestamp > loanStartTime + tenorSeconds, "Loan term not over yet");
        currentState = State.Defaulted;
        emit MarkedAsDefaulted();
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


// File contracts/profiles/DeveloperProfile.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


contract DeveloperProfile is Ownable, ReentrancyGuard {
    struct Profile {
        string githubHandle;
        string profileDataCID;
        uint256 trustScore;
        uint256 completedProjects;
        uint256 successfulLoans;
        uint256 defaultedLoans;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        bool isVerified;
        bool isActive;
        uint256 verificationTimestamp;
        uint256 lastActivityTimestamp;
    }

    struct GitHubMetrics {
        uint256 publicRepos;
        uint256 followers;
        uint256 totalCommits;
        uint256 totalStars;
        uint256 accountAge; // in days
        uint256 lastUpdated;
    }

    struct TrustScoreFactors {
        uint256 baseScore;
        uint256 githubBonus;
        uint256 loanHistoryBonus;
        uint256 projectBonus;
        uint256 timeBonus;
        uint256 verificationBonus;
    }

    mapping(address => Profile) public profiles;
    mapping(address => GitHubMetrics) public githubMetrics;
    mapping(address => TrustScoreFactors) public trustFactors;
    
    // Trust score weights (out of 100)
    uint256 public constant GITHUB_WEIGHT = 30;
    uint256 public constant LOAN_HISTORY_WEIGHT = 40;
    uint256 public constant PROJECT_WEIGHT = 20;
    uint256 public constant TIME_WEIGHT = 10;
    
    // Verification roles
    mapping(address => bool) public verifiers;
    mapping(address => bool) public oracles;
    
    address public riskAssessmentOracle;
    
    event ProfileCreated(address indexed developer, string githubHandle);
    event ProfileVerified(address indexed developer, address indexed verifier);
    event TrustScoreUpdated(address indexed developer, uint256 oldScore, uint256 newScore);
    event GitHubMetricsUpdated(address indexed developer, uint256 timestamp);
    event LoanMetricsUpdated(address indexed developer, bool isSuccessful, uint256 amount);

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || owner() == msg.sender, "Not authorized verifier");
        _;
    }

    modifier onlyOracle() {
        require(oracles[msg.sender] || owner() == msg.sender, "Not authorized oracle");
        _;
    }

    modifier onlyProfileOwner(address developer) {
        require(developer == msg.sender, "Not profile owner");
        _;
    }

    constructor() Ownable(msg.sender) {
        verifiers[msg.sender] = true;
        oracles[msg.sender] = true;
    }

    function createProfile(
        string memory _githubHandle,
        string memory _profileDataCID
    ) external {
        require(bytes(profiles[msg.sender].githubHandle).length == 0, "Profile already exists");
        require(bytes(_githubHandle).length > 0, "GitHub handle required");

        profiles[msg.sender] = Profile({
            githubHandle: _githubHandle,
            profileDataCID: _profileDataCID,
            trustScore: 100, // Base trust score
            completedProjects: 0,
            successfulLoans: 0,
            defaultedLoans: 0,
            totalBorrowed: 0,
            totalRepaid: 0,
            isVerified: false,
            isActive: true,
            verificationTimestamp: 0,
            lastActivityTimestamp: block.timestamp
        });

        emit ProfileCreated(msg.sender, _githubHandle);
    }

    function createProfileFor(
        address developer,
        string memory _githubHandle,
        string memory _profileDataCID
    ) external onlyOwner {
        require(bytes(profiles[developer].githubHandle).length == 0, "Profile already exists");
        require(bytes(_githubHandle).length > 0, "GitHub handle required");

        profiles[developer] = Profile({
            githubHandle: _githubHandle,
            profileDataCID: _profileDataCID,
            trustScore: 100, // Base trust score
            completedProjects: 0,
            successfulLoans: 0,
            defaultedLoans: 0,
            totalBorrowed: 0,
            totalRepaid: 0,
            isVerified: false,
            isActive: true,
            verificationTimestamp: 0,
            lastActivityTimestamp: block.timestamp
        });

        emit ProfileCreated(developer, _githubHandle);
    }
    
    function updateGitHubMetrics(
        address developer,
        uint256 _publicRepos,
        uint256 _followers,
        uint256 _totalCommits,
        uint256 _totalStars,
        uint256 _accountAge
    ) external onlyOracle {
        githubMetrics[developer] = GitHubMetrics({
            publicRepos: _publicRepos,
            followers: _followers,
            totalCommits: _totalCommits,
            totalStars: _totalStars,
            accountAge: _accountAge,
            lastUpdated: block.timestamp
        });

        _updateTrustScore(developer);
        emit GitHubMetricsUpdated(developer, block.timestamp);
    }

    function verifyProfile(address developer, bytes calldata proof) external onlyVerifier {
        require(profiles[developer].isActive, "Profile not active");
        require(!profiles[developer].isVerified, "Already verified");

        // In production, verify proof against GitHub API signature
        // For now, we trust the verifier
        
        profiles[developer].isVerified = true;
        profiles[developer].verificationTimestamp = block.timestamp;
        
        _updateTrustScore(developer);
        emit ProfileVerified(developer, msg.sender);
    }

    function updateLoanMetrics(
        address developer,
        bool isSuccessful,
        uint256 amount,
        bool isRepayment
    ) external onlyOracle {
        Profile storage profile = profiles[developer];
        require(profile.isActive, "Profile not active");

        if (isRepayment) {
            profile.totalRepaid += amount;
            if (isSuccessful) {
                profile.successfulLoans++;
            }
        } else {
            profile.totalBorrowed += amount;
            if (!isSuccessful) {
                profile.defaultedLoans++;
            }
        }

        profile.lastActivityTimestamp = block.timestamp;
        _updateTrustScore(developer);
        
        emit LoanMetricsUpdated(developer, isSuccessful, amount);
    }

    function updateProjectCount(address developer, uint256 projectCount) external onlyOracle {
        profiles[developer].completedProjects = projectCount;
        _updateTrustScore(developer);
    }

    function _updateTrustScore(address developer) internal {
        Profile storage profile = profiles[developer];
        uint256 oldScore = profile.trustScore;
        
        TrustScoreFactors memory factors = _calculateTrustFactors(developer);
        trustFactors[developer] = factors;
        
        uint256 newScore = factors.baseScore + (
            (factors.githubBonus * GITHUB_WEIGHT) +
            (factors.loanHistoryBonus * LOAN_HISTORY_WEIGHT) +
            (factors.projectBonus * PROJECT_WEIGHT) +
            (factors.timeBonus * TIME_WEIGHT)
        ) / 100;
        
        // Add verification bonus
        if (profile.isVerified) {
            newScore += factors.verificationBonus;
        }
        
        // Cap at 1000 max score
        profile.trustScore = newScore > 1000 ? 1000 : newScore;
        
        emit TrustScoreUpdated(developer, oldScore, profile.trustScore);
    }

    function _calculateTrustFactors(address developer) internal view returns (TrustScoreFactors memory) {
        Profile memory profile = profiles[developer];
        GitHubMetrics memory github = githubMetrics[developer];
        
        // Base score
        uint256 baseScore = 100;
        
        // GitHub metrics bonus (0-200 points)
        uint256 githubBonus = 0;
        if (github.lastUpdated > 0) {
            githubBonus = (github.publicRepos * 2) + 
                         (github.followers / 10) + 
                         (github.totalCommits / 100) + 
                         (github.totalStars / 10) +
                         (github.accountAge / 30); // Bonus for account age in months
            githubBonus = githubBonus > 200 ? 200 : githubBonus;
        }
        
        // Loan history bonus (0-300 points)
        uint256 loanHistoryBonus = 0;
        if (profile.successfulLoans > 0) {
            uint256 successRate = (profile.successfulLoans * 100) / 
                                 (profile.successfulLoans + profile.defaultedLoans);
            loanHistoryBonus = (successRate * 3) + (profile.successfulLoans * 10);
            loanHistoryBonus = loanHistoryBonus > 300 ? 300 : loanHistoryBonus;
        }
        
        // Project completion bonus (0-200 points)
        uint256 projectBonus = profile.completedProjects * 20;
        projectBonus = projectBonus > 200 ? 200 : projectBonus;
        
        // Time bonus - account age (0-100 points)
        uint256 timeBonus = 0;
        if (profile.verificationTimestamp > 0) {
            uint256 daysSinceVerification = (block.timestamp - profile.verificationTimestamp) / 86400;
            timeBonus = daysSinceVerification / 3; // 1 point per 3 days
            timeBonus = timeBonus > 100 ? 100 : timeBonus;
        }
        
        // Verification bonus (100 points)
        uint256 verificationBonus = profile.isVerified ? 100 : 0;
        
        return TrustScoreFactors({
            baseScore: baseScore,
            githubBonus: githubBonus,
            loanHistoryBonus: loanHistoryBonus,
            projectBonus: projectBonus,
            timeBonus: timeBonus,
            verificationBonus: verificationBonus
        });
    }

    function calculateTrustScore(address developer) external view returns (uint256) {
        return profiles[developer].trustScore;
    }

    function getDeveloperProfile(address developer) external view returns (Profile memory) {
        return profiles[developer];
    }

    function getGitHubMetrics(address developer) external view returns (GitHubMetrics memory) {
        return githubMetrics[developer];
    }

    function getTrustFactors(address developer) external view returns (TrustScoreFactors memory) {
        return trustFactors[developer];
    }

    // Admin functions
    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
    }

    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
    }

    function addOracle(address oracle) external onlyOwner {
        oracles[oracle] = true;
    }

    function removeOracle(address oracle) external onlyOwner {
        oracles[oracle] = false;
    }

    function setRiskAssessmentOracle(address _oracle) external onlyOwner {
        riskAssessmentOracle = _oracle;
    }

    function markVerifiedForTesting(address developer) external onlyOwner {
        require(profiles[developer].isActive, "Profile not active");
        profiles[developer].isVerified = true;
        profiles[developer].verificationTimestamp = block.timestamp;
        emit ProfileVerified(developer, msg.sender);
    }
    
    // TEST MODE FUNCTIONS - Only for development/testing
    function setTrustScoreForTesting(address developer, uint256 score) external onlyOwner {
        require(profiles[developer].isActive, "Profile not active");
        uint256 oldScore = profiles[developer].trustScore;
        profiles[developer].trustScore = score > 1000 ? 1000 : score;
        emit TrustScoreUpdated(developer, oldScore, profiles[developer].trustScore);
    }

    function deactivateProfile(address developer) external onlyOwner {
        profiles[developer].isActive = false;
    }

    function reactivateProfile(address developer) external onlyOwner {
        profiles[developer].isActive = true;
    }
}


// File contracts/oracles/RiskAssessmentOracle.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;



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


// File contracts/security/CommunityVerification.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


/**
 * @title CommunityVerification
 * @dev DAO curation system for loan proposal verification
 * @notice This contract manages community-driven proposal approval and verification
 */
contract CommunityVerification is AccessControl, Pausable {
    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    enum ProposalStatus { Pending, UnderReview, Approved, Rejected, Expired }
    enum VoteType { For, Against, Abstain }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string projectCID; // IPFS CID for detailed project info
        uint256 loanAmount;
        uint256 duration;
        uint256 submissionTime;
        uint256 reviewDeadline;
        uint256 votingDeadline;
        ProposalStatus status;
        
        // Technical review
        address[] assignedCurators;
        mapping(address => bool) curatorApprovals;
        uint256 curatorApprovalsCount;
        string technicalReviewCID; // IPFS CID for technical review
        
        // Community voting
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 totalVotes;
        mapping(address => bool) hasVoted;
        mapping(address => VoteType) votes;
        
        // Requirements
        uint256 minimumCuratorApprovals;
        uint256 minimumVoteThreshold;
        uint256 approvalQuorum; // Minimum percentage of votes needed
        
        // Metadata
        string[] milestones;
        uint256[] milestonePercentages;
        uint256[] milestoneDeadlines;
        string rejectionReason;
    }

    struct CuratorInfo {
        address curator;
        string expertise; // e.g., "Smart Contracts", "DeFi", "Frontend", etc.
        uint256 totalReviews;
        uint256 approvedReviews;
        uint256 rejectedReviews;
        uint256 stakingRequirement;
        bool isActive;
    }

    struct VoterInfo {
        address voter;
        uint256 votingPower;
        uint256 totalVotes;
        uint256 reputationScore;
        bool isActive;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => CuratorInfo) public curators;
    mapping(address => VoterInfo) public voters;
    mapping(address => uint256[]) public proposalsByUser;
    
    uint256 public nextProposalId = 1;
    uint256 public totalProposals;
    uint256 public totalCurators;
    uint256 public totalVoters;
    
    // Configuration parameters
    uint256 public constant REVIEW_PERIOD = 7 days;
    uint256 public constant VOTING_PERIOD = 5 days;
    uint256 public constant MIN_CURATOR_APPROVALS = 3;
    uint256 public constant MIN_APPROVAL_QUORUM = 5000; // 50% in basis points
    uint256 public constant MIN_VOTE_THRESHOLD = 10; // Minimum votes needed
    uint256 public constant CURATOR_STAKE_REQUIREMENT = 1 ether;
    
    address[] public allProposals;
    address[] public activeCurators;
    address[] public activeVoters;

    event ProposalSubmitted(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        uint256 loanAmount
    );
    event ProposalAssigned(uint256 indexed proposalId, address[] curators);
    event TechnicalReviewSubmitted(
        uint256 indexed proposalId,
        address indexed curator,
        bool approved,
        string reviewCID
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType voteType,
        uint256 votingPower
    );
    event ProposalApproved(uint256 indexed proposalId);
    event ProposalRejected(uint256 indexed proposalId, string reason);
    event ProposalExpired(uint256 indexed proposalId);
    event CuratorAdded(address indexed curator, string expertise);
    event CuratorRemoved(address indexed curator);
    event VoterAdded(address indexed voter, uint256 votingPower);
    event VoterRemoved(address indexed voter);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CURATOR_ROLE, msg.sender);
        _grantRole(VOTER_ROLE, msg.sender);
    }

    /**
     * @dev Submit a new proposal for review
     * @param _title Proposal title
     * @param _description Proposal description
     * @param _projectCID IPFS CID for detailed project info
     * @param _loanAmount Requested loan amount
     * @param _duration Loan duration in seconds
     * @param _milestones Array of milestone descriptions
     * @param _milestonePercentages Array of milestone release percentages
     * @param _milestoneDeadlines Array of milestone deadlines
     */
    function submitProposal(
        string memory _title,
        string memory _description,
        string memory _projectCID,
        uint256 _loanAmount,
        uint256 _duration,
        string[] memory _milestones,
        uint256[] memory _milestonePercentages,
        uint256[] memory _milestoneDeadlines
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_projectCID).length > 0, "Project CID required");
        require(_loanAmount > 0, "Loan amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(
            _milestones.length == _milestonePercentages.length &&
            _milestones.length == _milestoneDeadlines.length,
            "Milestone arrays length mismatch"
        );
        require(_milestones.length > 0, "At least one milestone required");

        // Validate milestone percentages sum to 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _milestonePercentages.length; i++) {
            require(_milestonePercentages[i] > 0, "Milestone percentage must be greater than 0");
            totalPercentage += _milestonePercentages[i];
        }
        require(totalPercentage == 10000, "Total milestone percentage must equal 100%");

        uint256 proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = _title;
        proposal.description = _description;
        proposal.projectCID = _projectCID;
        proposal.loanAmount = _loanAmount;
        proposal.duration = _duration;
        proposal.submissionTime = block.timestamp;
        proposal.reviewDeadline = block.timestamp + REVIEW_PERIOD;
        proposal.votingDeadline = block.timestamp + REVIEW_PERIOD + VOTING_PERIOD;
        proposal.status = ProposalStatus.Pending;
        proposal.minimumCuratorApprovals = MIN_CURATOR_APPROVALS;
        proposal.minimumVoteThreshold = MIN_VOTE_THRESHOLD;
        proposal.approvalQuorum = MIN_APPROVAL_QUORUM;
        
        // Store milestones
        for (uint256 i = 0; i < _milestones.length; i++) {
            proposal.milestones.push(_milestones[i]);
            proposal.milestonePercentages.push(_milestonePercentages[i]);
            proposal.milestoneDeadlines.push(_milestoneDeadlines[i]);
        }

        proposalsByUser[msg.sender].push(proposalId);
        allProposals.push(msg.sender); // Store proposer for indexing
        totalProposals++;

        emit ProposalSubmitted(proposalId, msg.sender, _title, _loanAmount);
        
        // Auto-assign curators if available
        _autoAssignCurators(proposalId);

        return proposalId;
    }

    /**
     * @dev Assign curators to review a proposal
     * @param _proposalId Proposal ID
     * @param _curators Array of curator addresses
     */
    function assignCurators(uint256 _proposalId, address[] memory _curators) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        require(_curators.length > 0, "At least one curator required");
        
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.Pending, "Proposal not pending");
        
        // Validate all assigned curators are active
        for (uint256 i = 0; i < _curators.length; i++) {
            require(curators[_curators[i]].isActive, "Curator not active");
        }
        
        proposal.assignedCurators = _curators;
        proposal.status = ProposalStatus.UnderReview;
        
        emit ProposalAssigned(_proposalId, _curators);
    }

    /**
     * @dev Submit technical review for a proposal
     * @param _proposalId Proposal ID
     * @param _approved Whether the proposal is approved
     * @param _reviewCID IPFS CID for detailed review
     */
    function submitTechnicalReview(
        uint256 _proposalId,
        bool _approved,
        string memory _reviewCID
    ) external onlyRole(CURATOR_ROLE) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.UnderReview, "Proposal not under review");
        require(block.timestamp <= proposal.reviewDeadline, "Review deadline passed");
        require(!proposal.curatorApprovals[msg.sender], "Already reviewed by this curator");
        
        // Verify curator is assigned to this proposal
        bool isAssigned = false;
        for (uint256 i = 0; i < proposal.assignedCurators.length; i++) {
            if (proposal.assignedCurators[i] == msg.sender) {
                isAssigned = true;
                break;
            }
        }
        require(isAssigned, "Curator not assigned to this proposal");
        
        proposal.curatorApprovals[msg.sender] = _approved;
        if (_approved) {
            proposal.curatorApprovalsCount++;
        }
        
        // Update curator stats
        CuratorInfo storage curator = curators[msg.sender];
        curator.totalReviews++;
        if (_approved) {
            curator.approvedReviews++;
        } else {
            curator.rejectedReviews++;
        }
        
        proposal.technicalReviewCID = _reviewCID;
        
        emit TechnicalReviewSubmitted(_proposalId, msg.sender, _approved, _reviewCID);
        
        // Check if minimum approvals reached
        if (proposal.curatorApprovalsCount >= proposal.minimumCuratorApprovals) {
            _startVoting(_proposalId);
        }
    }

    /**
     * @dev Cast vote on a proposal
     * @param _proposalId Proposal ID
     * @param _voteType Vote type (For, Against, Abstain)
     */
    function castVote(uint256 _proposalId, VoteType _voteType) external onlyRole(VOTER_ROLE) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.UnderReview, "Proposal not in voting phase");
        require(block.timestamp <= proposal.votingDeadline, "Voting deadline passed");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        VoterInfo storage voter = voters[msg.sender];
        require(voter.isActive, "Voter not active");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votes[msg.sender] = _voteType;
        proposal.totalVotes++;
        
        uint256 votingPower = voter.votingPower;
        
        if (_voteType == VoteType.For) {
            proposal.votesFor += votingPower;
        } else if (_voteType == VoteType.Against) {
            proposal.votesAgainst += votingPower;
        } else {
            proposal.votesAbstain += votingPower;
        }
        
        voter.totalVotes++;
        
        emit VoteCast(_proposalId, msg.sender, _voteType, votingPower);
        
        // Check if voting concluded
        _checkVotingConclusion(_proposalId);
    }

    /**
     * @dev Finalize proposal after voting deadline
     * @param _proposalId Proposal ID
     */
    function finalizeProposal(uint256 _proposalId) external {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.UnderReview, "Proposal not in voting phase");
        require(block.timestamp > proposal.votingDeadline, "Voting still active");
        
        _finalizeProposal(_proposalId);
    }

    /**
     * @dev Add curator
     * @param _curator Curator address
     * @param _expertise Curator expertise
     */
    function addCurator(address _curator, string memory _expertise) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_curator != address(0), "Invalid curator address");
        require(bytes(_expertise).length > 0, "Expertise required");
        require(!curators[_curator].isActive, "Curator already active");
        
        curators[_curator] = CuratorInfo({
            curator: _curator,
            expertise: _expertise,
            totalReviews: 0,
            approvedReviews: 0,
            rejectedReviews: 0,
            stakingRequirement: CURATOR_STAKE_REQUIREMENT,
            isActive: true
        });
        
        activeCurators.push(_curator);
        totalCurators++;
        
        _grantRole(CURATOR_ROLE, _curator);
        
        emit CuratorAdded(_curator, _expertise);
    }

    /**
     * @dev Remove curator
     * @param _curator Curator address
     */
    function removeCurator(address _curator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(curators[_curator].isActive, "Curator not active");
        
        curators[_curator].isActive = false;
        totalCurators--;
        
        // Remove from active curators list
        for (uint256 i = 0; i < activeCurators.length; i++) {
            if (activeCurators[i] == _curator) {
                activeCurators[i] = activeCurators[activeCurators.length - 1];
                activeCurators.pop();
                break;
            }
        }
        
        _revokeRole(CURATOR_ROLE, _curator);
        
        emit CuratorRemoved(_curator);
    }

    /**
     * @dev Add voter
     * @param _voter Voter address
     * @param _votingPower Voting power
     */
    function addVoter(address _voter, uint256 _votingPower) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_voter != address(0), "Invalid voter address");
        require(_votingPower > 0, "Voting power must be greater than 0");
        require(!voters[_voter].isActive, "Voter already active");
        
        voters[_voter] = VoterInfo({
            voter: _voter,
            votingPower: _votingPower,
            totalVotes: 0,
            reputationScore: 0,
            isActive: true
        });
        
        activeVoters.push(_voter);
        totalVoters++;
        
        _grantRole(VOTER_ROLE, _voter);
        
        emit VoterAdded(_voter, _votingPower);
    }

    /**
     * @dev Remove voter
     * @param _voter Voter address
     */
    function removeVoter(address _voter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(voters[_voter].isActive, "Voter not active");
        
        voters[_voter].isActive = false;
        totalVoters--;
        
        // Remove from active voters list
        for (uint256 i = 0; i < activeVoters.length; i++) {
            if (activeVoters[i] == _voter) {
                activeVoters[i] = activeVoters[activeVoters.length - 1];
                activeVoters.pop();
                break;
            }
        }
        
        _revokeRole(VOTER_ROLE, _voter);
        
        emit VoterRemoved(_voter);
    }

    /**
     * @dev Auto-assign curators to a proposal
     * @param _proposalId Proposal ID
     */
    function _autoAssignCurators(uint256 _proposalId) internal {
        if (activeCurators.length >= MIN_CURATOR_APPROVALS) {
            address[] memory assigned = new address[](MIN_CURATOR_APPROVALS);
            
            // Simple round-robin assignment (can be improved with expertise matching)
            for (uint256 i = 0; i < MIN_CURATOR_APPROVALS; i++) {
                assigned[i] = activeCurators[i % activeCurators.length];
            }
            
            proposals[_proposalId].assignedCurators = assigned;
            proposals[_proposalId].status = ProposalStatus.UnderReview;
            
            emit ProposalAssigned(_proposalId, assigned);
        }
    }

    /**
     * @dev Start voting phase for a proposal
     * @param _proposalId Proposal ID
     */
    function _startVoting(uint256 _proposalId) internal {
        // Voting already starts when proposal is under review
        // This function can be extended for additional voting logic
    }

    /**
     * @dev Check if voting should be concluded
     * @param _proposalId Proposal ID
     */
    function _checkVotingConclusion(uint256 _proposalId) internal {
        Proposal storage proposal = proposals[_proposalId];
        
        // Check if minimum threshold reached
        if (proposal.totalVotes >= proposal.minimumVoteThreshold) {
            uint256 totalVotingPower = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
            uint256 forPercentage = (proposal.votesFor * 10000) / totalVotingPower;
            
            if (forPercentage >= proposal.approvalQuorum) {
                _finalizeProposal(_proposalId);
            }
        }
    }

    /**
     * @dev Finalize proposal based on voting results
     * @param _proposalId Proposal ID
     */
    function _finalizeProposal(uint256 _proposalId) internal {
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.totalVotes < proposal.minimumVoteThreshold) {
            proposal.status = ProposalStatus.Rejected;
            proposal.rejectionReason = "Insufficient votes";
            emit ProposalRejected(_proposalId, "Insufficient votes");
            return;
        }
        
        uint256 totalVotingPower = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
        uint256 forPercentage = (proposal.votesFor * 10000) / totalVotingPower;
        
        if (forPercentage >= proposal.approvalQuorum) {
            proposal.status = ProposalStatus.Approved;
            emit ProposalApproved(_proposalId);
        } else {
            proposal.status = ProposalStatus.Rejected;
            proposal.rejectionReason = "Insufficient approval votes";
            emit ProposalRejected(_proposalId, "Insufficient approval votes");
        }
    }

    /**
     * @dev Get proposal info
     * @param _proposalId Proposal ID
     */
    function getProposalInfo(uint256 _proposalId) external view returns (
        address proposer,
        string memory title,
        string memory description,
        uint256 loanAmount,
        uint256 duration,
        ProposalStatus status,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 totalVotes
    ) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.loanAmount,
            proposal.duration,
            proposal.status,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.totalVotes
        );
    }

    /**
     * @dev Get proposal milestones
     * @param _proposalId Proposal ID
     */
    function getProposalMilestones(uint256 _proposalId) external view returns (
        string[] memory milestones,
        uint256[] memory percentages,
        uint256[] memory deadlines
    ) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.milestones,
            proposal.milestonePercentages,
            proposal.milestoneDeadlines
        );
    }

    /**
     * @dev Get assigned curators for a proposal
     * @param _proposalId Proposal ID
     */
    function getAssignedCurators(uint256 _proposalId) external view returns (address[] memory) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        return proposals[_proposalId].assignedCurators;
    }

    /**
     * @dev Get curator approval for a proposal
     * @param _proposalId Proposal ID
     * @param _curator Curator address
     */
    function getCuratorApproval(uint256 _proposalId, address _curator) external view returns (bool) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        return proposals[_proposalId].curatorApprovals[_curator];
    }

    /**
     * @dev Get user's vote for a proposal
     * @param _proposalId Proposal ID
     * @param _voter Voter address
     */
    function getUserVote(uint256 _proposalId, address _voter) external view returns (VoteType) {
        require(_proposalId < nextProposalId, "Invalid proposal ID");
        require(proposals[_proposalId].hasVoted[_voter], "User has not voted");
        return proposals[_proposalId].votes[_voter];
    }

    /**
     * @dev Get proposals by user
     * @param _user User address
     */
    function getProposalsByUser(address _user) external view returns (uint256[] memory) {
        return proposalsByUser[_user];
    }

    /**
     * @dev Get active curators
     */
    function getActiveCurators() external view returns (address[] memory) {
        return activeCurators;
    }

    /**
     * @dev Get active voters
     */
    function getActiveVoters() external view returns (address[] memory) {
        return activeVoters;
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


// File contracts/staking/StakingVault.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


contract StakingVault is Ownable, ReentrancyGuard {
    mapping(address => uint256) public stakesOf;
    mapping(address => uint256) public lockedStakes; // Locked stakes for active loans
    mapping(address => uint256) public activeLoanCount; // Number of active loans per developer
    
    uint256 public totalStakedInVault;
    uint256 public constant MINIMUM_STAKE_PER_LOAN = 1 * 10**18; // 1 tCORE per loan
    uint256 public constant LOCK_DURATION = 7 days; // Grace period after loan completion
    
    mapping(address => uint256) public lastLoanEndTime; // Track when last loan ended
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event StakeLocked(address indexed user, uint256 amount, uint256 loanCount);
    event StakeUnlocked(address indexed user, uint256 amount, uint256 loanCount);

    mapping(address => bool) public authorizedContracts;

    modifier onlyAuthorizedContract() {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Amount must be > 0");
        stakesOf[msg.sender] += msg.value;
        totalStakedInVault += msg.value;
        emit Staked(msg.sender, msg.value);
    }
    
    function unstake(uint256 _amount) external nonReentrant {
        require(stakesOf[msg.sender] >= _amount, "Insufficient stake");
        require(getAvailableStake(msg.sender) >= _amount, "Cannot unstake locked funds");
        
        // Check grace period for recent loan completions
        if (lastLoanEndTime[msg.sender] > 0) {
            require(
                block.timestamp >= lastLoanEndTime[msg.sender] + LOCK_DURATION,
                "Grace period not ended"
            );
        }
        
        stakesOf[msg.sender] -= _amount;
        totalStakedInVault -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Unstaked(msg.sender, _amount);
    }
    
    function lockStakeForLoan(address developer, uint256 loanAmount) external onlyAuthorizedContract {
        require(stakesOf[developer] >= MINIMUM_STAKE_PER_LOAN, "Insufficient stake for loan");
        require(getAvailableStake(developer) >= MINIMUM_STAKE_PER_LOAN, "Not enough available stake");
        
        lockedStakes[developer] += MINIMUM_STAKE_PER_LOAN;
        activeLoanCount[developer] += 1;
        
        emit StakeLocked(developer, MINIMUM_STAKE_PER_LOAN, activeLoanCount[developer]);
    }
    
    function unlockStakeForLoan(address developer, bool isSuccessful) external onlyAuthorizedContract {
        require(activeLoanCount[developer] > 0, "No active loans");
        require(lockedStakes[developer] >= MINIMUM_STAKE_PER_LOAN, "No locked stake");
        
        if (isSuccessful) {
            // Successful loan - unlock stake
            lockedStakes[developer] -= MINIMUM_STAKE_PER_LOAN;
        } else {
            // Failed loan - slash stake
            uint256 slashAmount = MINIMUM_STAKE_PER_LOAN / 2; // 50% slash
            lockedStakes[developer] -= MINIMUM_STAKE_PER_LOAN;
            stakesOf[developer] -= slashAmount;
            totalStakedInVault -= slashAmount;
            // Slashed amount goes to insurance fund (could be sent to treasury)
        }
        
        activeLoanCount[developer] -= 1;
        lastLoanEndTime[developer] = block.timestamp;
        
        emit StakeUnlocked(developer, MINIMUM_STAKE_PER_LOAN, activeLoanCount[developer]);
    }
    
    function getAvailableStake(address developer) public view returns (uint256) {
        return stakesOf[developer] - lockedStakes[developer];
    }
    
    function canCreateLoan(address developer) external view returns (bool) {
        return getAvailableStake(developer) >= MINIMUM_STAKE_PER_LOAN;
    }
    
    function getStakeInfo(address developer) external view returns (
        uint256 totalStake,
        uint256 lockedStake,
        uint256 availableStake,
        uint256 activeLoans,
        uint256 lastLoanEnd
    ) {
        totalStake = stakesOf[developer];
        lockedStake = lockedStakes[developer];
        availableStake = getAvailableStake(developer);
        activeLoans = activeLoanCount[developer];
        lastLoanEnd = lastLoanEndTime[developer];
    }
    
    // Admin functions
    function setMinimumStake(uint256 _minimumStake) external onlyOwner {
        // In production, this should be immutable or governed by DAO
    }
    
    function emergencyUnlockStake(address developer) external onlyOwner {
        lockedStakes[developer] = 0;
        activeLoanCount[developer] = 0;
    }
    
    function authorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = true;
    }
    
    function unauthorizeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }
}


// File contracts/tokens/ReputationSBT.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;


contract ReputationSBT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner) ERC721("Devs Reputation", "dREP") Ownable(initialOwner) {}

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "SBT: non-transferable");
        return super._update(to, tokenId, auth);
    }

    function mintAchievement(address developer, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(developer, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
}


// File contracts/MarketFactoryEnhanced.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.20;











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