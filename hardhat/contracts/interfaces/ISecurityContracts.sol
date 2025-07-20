// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMilestoneEscrowVault
 * @dev Interface for MilestoneEscrowVault contract
 */
interface IMilestoneEscrowVault {
    enum MilestoneStatus { Pending, Submitted, Verified, Rejected }
    enum VaultStatus { Funding, Active, Completed, Defaulted }

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
    ) external returns (uint256);

    function depositFunds(uint256 _vaultId, uint256 _amount) external;
    
    function submitMilestoneProof(
        uint256 _vaultId,
        uint256 _milestoneIndex,
        string memory _proofCID
    ) external;
    
    function verifyMilestone(
        uint256 _vaultId,
        uint256 _milestoneIndex,
        bool _approved,
        string memory _rejectionReason
    ) external;
    
    function markAsDefaulted(uint256 _vaultId) external;
    
    function getVaultInfo(uint256 _vaultId) external view returns (
        address borrower,
        address asset,
        uint256 totalAmount,
        uint256 totalReleased,
        uint256 totalDeposited,
        VaultStatus status,
        string memory projectCID,
        uint256 milestoneCount
    );
    
    function getMilestoneInfo(uint256 _vaultId, uint256 _milestoneIndex) external view returns (
        string memory description,
        uint256 releasePercentage,
        uint256 deadline,
        string memory proofCID,
        MilestoneStatus status,
        string memory rejectionReason
    );
}

/**
 * @title IReputationStaking
 * @dev Interface for ReputationStaking contract
 */
interface IReputationStaking {
    struct GitHubProfile {
        string username;
        uint256 repositories;
        uint256 followers;
        uint256 following;
        uint256 publicGists;
        uint256 totalStars;
        uint256 totalForks;
        uint256 contributionScore;
        uint256 accountAge;
        bool isVerified;
        uint256 verificationTimestamp;
    }

    function createProfile(string memory _githubUsername) external;
    
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
    ) external;
    
    function addAchievement(
        string memory _achievementType,
        string memory _description,
        string memory _proofCID,
        uint256 _value
    ) external;
    
    function verifyAchievement(address _user, uint256 _achievementIndex) external;
    
    function stakeReputation() external payable;
    
    function unstakeReputation(uint256 _amount) external;
    
    function lockStake(address _user, uint256 _amount) external;
    
    function unlockStake(address _user, uint256 _amount) external;
    
    function slashStake(address _user, uint256 _amount, string memory _reason) external;
    
    function updateLoanStats(address _user, uint256 _loanAmount, bool _isSuccessful) external;
    
    function getReputationProfile(address _user) external view returns (
        string memory githubUsername,
        uint256 reputationScore,
        uint256 totalStaked,
        uint256 lockedStake,
        uint256 totalLoans,
        uint256 successfulLoans,
        uint256 defaultedLoans,
        bool isVerified,
        bool isBlacklisted
    );
    
    function hasProfile(address _user) external view returns (bool);
    
    function meetsMinimumRequirements(address _user) external view returns (bool);
}

/**
 * @title ICommunityVerification
 * @dev Interface for CommunityVerification contract
 */
interface ICommunityVerification {
    enum ProposalStatus { Pending, UnderReview, Approved, Rejected, Expired }
    enum VoteType { For, Against, Abstain }

    function submitProposal(
        string memory _title,
        string memory _description,
        string memory _projectCID,
        uint256 _loanAmount,
        uint256 _duration,
        string[] memory _milestones,
        uint256[] memory _milestonePercentages,
        uint256[] memory _milestoneDeadlines
    ) external returns (uint256);
    
    function assignCurators(uint256 _proposalId, address[] memory _curators) external;
    
    function submitTechnicalReview(
        uint256 _proposalId,
        bool _approved,
        string memory _reviewCID
    ) external;
    
    function castVote(uint256 _proposalId, VoteType _voteType) external;
    
    function finalizeProposal(uint256 _proposalId) external;
    
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
    );
    
    function getProposalMilestones(uint256 _proposalId) external view returns (
        string[] memory milestones,
        uint256[] memory percentages,
        uint256[] memory deadlines
    );
}

/**
 * @title IDefaultBlacklist
 * @dev Interface for DefaultBlacklist contract
 */
interface IDefaultBlacklist {
    enum DefaultReason { MissedPayment, MissedMilestone, Fraud, Abandonment, Other }
    enum AppealStatus { None, Pending, Approved, Rejected }

    function recordDefault(
        address _borrower,
        uint256 _loanAmount,
        uint256 _outstandingAmount,
        DefaultReason _reason,
        string memory _description,
        string memory _evidenceCID
    ) external returns (uint256);
    
    function addToBlacklist(address _borrower, string memory _reason) external;
    
    function removeFromBlacklist(address _borrower, string memory _reason) external;
    
    function resolveDefault(uint256 _defaultId, string memory _resolutionNotes) external;
    
    function submitAppeal(
        uint256 _defaultId,
        string memory _appealReason,
        string memory _evidenceCID
    ) external returns (uint256);
    
    function reviewAppeal(
        uint256 _appealId,
        bool _approved,
        string memory _reviewNotes
    ) external;
    
    function updateLoanStats(
        address _borrower,
        uint256 _loanAmount,
        uint256 _totalBorrowed
    ) external;
    
    function isBlacklisted(address _borrower) external view returns (bool);
    
    function getCreditProfile(address _borrower) external view returns (
        uint256 totalLoans,
        uint256 totalBorrowed,
        uint256 totalDefaults,
        uint256 totalDefaultAmount,
        uint256 totalResolved,
        uint256 creditScore,
        bool isBlacklisted,
        string memory blacklistReason
    );
}
