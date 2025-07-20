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