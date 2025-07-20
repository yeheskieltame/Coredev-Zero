// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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
