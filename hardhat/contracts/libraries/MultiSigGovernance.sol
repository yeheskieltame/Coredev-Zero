// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigGovernance
 * @dev Library for multi-signature governance functionality
 * @notice Provides secure governance mechanisms for protocol parameter updates
 */
library MultiSigGovernance {
    /// @dev Governance proposal structure
    struct Proposal {
        address target;              // Target contract for execution
        bytes data;                  // Encoded function call data
        uint256 confirmations;       // Number of confirmations received
        uint256 deadline;            // Deadline for proposal execution
        bool executed;               // Whether proposal has been executed
        mapping(address => bool) confirmed; // Governor confirmation status
    }

    /// @dev Governance configuration
    struct GovernanceConfig {
        uint256 requiredConfirmations; // Required confirmations for execution
        uint256 proposalDuration;      // Duration for proposal voting
        mapping(address => bool) governors; // Authorized governors
        uint256 governorCount;          // Total number of governors
    }

    /// @dev Events for governance actions
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, address target);
    event ProposalConfirmed(uint256 indexed proposalId, address indexed governor);
    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
    event GovernorAdded(address indexed governor);
    event GovernorRemoved(address indexed governor);

    /**
     * @notice Create a new governance proposal
     * @param config Governance configuration
     * @param proposals Mapping of proposals
     * @param proposalCount Current proposal count
     * @param target Target contract address
     * @param data Encoded function call data
     * @return proposalId New proposal ID
     */
    function createProposal(
        GovernanceConfig storage config,
        mapping(uint256 => Proposal) storage proposals,
        uint256 proposalCount,
        address target,
        bytes calldata data
    ) external returns (uint256 proposalId) {
        require(config.governors[msg.sender], "Not a governor");
        
        proposalId = proposalCount;
        Proposal storage proposal = proposals[proposalId];
        proposal.target = target;
        proposal.data = data;
        proposal.deadline = block.timestamp + config.proposalDuration;
        
        emit ProposalCreated(proposalId, msg.sender, target);
        return proposalId;
    }

    /**
     * @notice Confirm a governance proposal
     * @param config Governance configuration
     * @param proposals Mapping of proposals
     * @param proposalId ID of the proposal to confirm
     */
    function confirmProposal(
        GovernanceConfig storage config,
        mapping(uint256 => Proposal) storage proposals,
        uint256 proposalId
    ) external {
        require(config.governors[msg.sender], "Not a governor");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp <= proposal.deadline, "Proposal expired");
        require(!proposal.executed, "Already executed");
        require(!proposal.confirmed[msg.sender], "Already confirmed");
        
        proposal.confirmed[msg.sender] = true;
        proposal.confirmations++;
        
        emit ProposalConfirmed(proposalId, msg.sender);
    }

    /**
     * @notice Execute a confirmed governance proposal
     * @param config Governance configuration
     * @param proposals Mapping of proposals
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(
        GovernanceConfig storage config,
        mapping(uint256 => Proposal) storage proposals,
        uint256 proposalId
    ) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.confirmations >= config.requiredConfirmations, "Insufficient confirmations");
        require(block.timestamp <= proposal.deadline, "Proposal expired");
        require(!proposal.executed, "Already executed");
        
        proposal.executed = true;
        
        (bool success, ) = proposal.target.call(proposal.data);
        require(success, "Execution failed");
        
        emit ProposalExecuted(proposalId, msg.sender);
    }

    /**
     * @notice Add a new governor
     * @param config Governance configuration
     * @param governor Address of the new governor
     */
    function addGovernor(
        GovernanceConfig storage config,
        address governor
    ) external {
        require(!config.governors[governor], "Already a governor");
        
        config.governors[governor] = true;
        config.governorCount++;
        
        emit GovernorAdded(governor);
    }

    /**
     * @notice Remove a governor
     * @param config Governance configuration
     * @param governor Address of the governor to remove
     */
    function removeGovernor(
        GovernanceConfig storage config,
        address governor
    ) external {
        require(config.governors[governor], "Not a governor");
        require(config.governorCount > config.requiredConfirmations, "Cannot remove: too few governors");
        
        config.governors[governor] = false;
        config.governorCount--;
        
        emit GovernorRemoved(governor);
    }
}
