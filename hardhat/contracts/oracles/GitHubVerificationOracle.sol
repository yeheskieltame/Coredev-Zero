// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "../profiles/DeveloperProfile.sol";

contract GitHubVerificationOracle is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct VerificationData {
        address developer;
        string githubHandle;
        uint256 publicRepos;
        uint256 followers;
        uint256 totalCommits;
        uint256 totalStars;
        uint256 accountAge;
        uint256 timestamp;
        uint256 nonce;
    }

    struct PendingVerification {
        bytes32 requestId;
        address developer;
        string githubHandle;
        uint256 timestamp;
        bool isActive;
    }

    DeveloperProfile public immutable developerProfile;
    
    mapping(address => bool) public authorizedSigners;
    mapping(bytes32 => bool) public usedSignatures;
    mapping(address => PendingVerification) public pendingVerifications;
    mapping(address => uint256) public verificationNonces;
    mapping(string => address) public githubHandleToAddress;
    
    uint256 public constant VERIFICATION_TIMEOUT = 24 hours;
    uint256 public constant MIN_ACCOUNT_AGE = 30 days;
    uint256 public constant MIN_REPOS = 3;
    
    event VerificationRequested(
        bytes32 indexed requestId,
        address indexed developer,
        string githubHandle
    );
    
    event VerificationCompleted(
        address indexed developer,
        string githubHandle,
        uint256 trustScore
    );
    
    event GitHubDataUpdated(
        address indexed developer,
        uint256 repos,
        uint256 followers,
        uint256 commits,
        uint256 stars
    );
    
    event SignerUpdated(address indexed signer, bool authorized);

    modifier onlyAuthorizedSigner() {
        require(authorizedSigners[msg.sender], "Not authorized signer");
        _;
    }

    constructor(address _developerProfile) Ownable(msg.sender) {
        developerProfile = DeveloperProfile(_developerProfile);
        authorizedSigners[msg.sender] = true;
    }

    function requestVerification(string memory githubHandle) external {
        require(bytes(githubHandle).length > 0, "GitHub handle required");
        require(githubHandleToAddress[githubHandle] == address(0), "GitHub handle already used");
        require(!pendingVerifications[msg.sender].isActive, "Verification already pending");

        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            githubHandle,
            block.timestamp,
            verificationNonces[msg.sender]
        ));

        pendingVerifications[msg.sender] = PendingVerification({
            requestId: requestId,
            developer: msg.sender,
            githubHandle: githubHandle,
            timestamp: block.timestamp,
            isActive: true
        });

        verificationNonces[msg.sender]++;

        emit VerificationRequested(requestId, msg.sender, githubHandle);
    }

    function verifyDeveloper(
        VerificationData memory data,
        bytes memory signature
    ) external onlyAuthorizedSigner {
        require(pendingVerifications[data.developer].isActive, "No pending verification");
        require(
            block.timestamp <= pendingVerifications[data.developer].timestamp + VERIFICATION_TIMEOUT,
            "Verification expired"
        );
        require(
            keccak256(bytes(data.githubHandle)) == 
            keccak256(bytes(pendingVerifications[data.developer].githubHandle)),
            "GitHub handle mismatch"
        );

        // Verify signature
        bytes32 messageHash = _getMessageHash(data);
        require(!usedSignatures[messageHash], "Signature already used");
        require(_verifySignature(messageHash, signature), "Invalid signature");

        // Validate GitHub data
        require(data.accountAge >= MIN_ACCOUNT_AGE, "Account too new");
        require(data.publicRepos >= MIN_REPOS, "Insufficient repositories");
        require(data.timestamp <= block.timestamp, "Future timestamp");
        require(data.timestamp >= block.timestamp - 1 hours, "Data too old");

        // Mark signature as used
        usedSignatures[messageHash] = true;

        // Update developer profile
        developerProfile.updateGitHubMetrics(
            data.developer,
            data.publicRepos,
            data.followers,
            data.totalCommits,
            data.totalStars,
            data.accountAge / 86400 // Convert to days
        );

        // Complete verification
        bytes memory proof = abi.encode(data, signature);
        developerProfile.verifyProfile(data.developer, proof);

        // Update mappings
        githubHandleToAddress[data.githubHandle] = data.developer;
        pendingVerifications[data.developer].isActive = false;

        emit VerificationCompleted(
            data.developer,
            data.githubHandle,
            developerProfile.calculateTrustScore(data.developer)
        );

        emit GitHubDataUpdated(
            data.developer,
            data.publicRepos,
            data.followers,
            data.totalCommits,
            data.totalStars
        );
    }

    function updateGitHubData(
        VerificationData memory data,
        bytes memory signature
    ) external onlyAuthorizedSigner {
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(data.developer);
        require(profile.isVerified, "Developer not verified");
        require(
            keccak256(bytes(data.githubHandle)) == 
            keccak256(bytes(profile.githubHandle)),
            "GitHub handle mismatch"
        );

        // Verify signature
        bytes32 messageHash = _getMessageHash(data);
        require(!usedSignatures[messageHash], "Signature already used");
        require(_verifySignature(messageHash, signature), "Invalid signature");

        // Validate data freshness
        require(data.timestamp <= block.timestamp, "Future timestamp");
        require(data.timestamp >= block.timestamp - 1 hours, "Data too old");

        // Mark signature as used
        usedSignatures[messageHash] = true;

        // Update GitHub metrics
        developerProfile.updateGitHubMetrics(
            data.developer,
            data.publicRepos,
            data.followers,
            data.totalCommits,
            data.totalStars,
            data.accountAge / 86400 // Convert to days
        );

        emit GitHubDataUpdated(
            data.developer,
            data.publicRepos,
            data.followers,
            data.totalCommits,
            data.totalStars
        );
    }

    function _getMessageHash(VerificationData memory data) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            data.developer,
            data.githubHandle,
            data.publicRepos,
            data.followers,
            data.totalCommits,
            data.totalStars,
            data.accountAge,
            data.timestamp,
            data.nonce
        ));
    }

    function _verifySignature(bytes32 messageHash, bytes memory signature) internal view returns (bool) {
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        return authorizedSigners[recoveredSigner];
    }

    function cancelVerification() external {
        require(pendingVerifications[msg.sender].isActive, "No pending verification");
        pendingVerifications[msg.sender].isActive = false;
    }

    function isVerificationExpired(address developer) external view returns (bool) {
        PendingVerification memory pending = pendingVerifications[developer];
        return pending.isActive && 
               block.timestamp > pending.timestamp + VERIFICATION_TIMEOUT;
    }

    function getPendingVerification(address developer) external view returns (PendingVerification memory) {
        return pendingVerifications[developer];
    }

    function isGitHubHandleAvailable(string memory githubHandle) external view returns (bool) {
        return githubHandleToAddress[githubHandle] == address(0);
    }

    function getDeveloperByGitHub(string memory githubHandle) external view returns (address) {
        return githubHandleToAddress[githubHandle];
    }

    // Admin functions
    function addAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigners[signer] = true;
        emit SignerUpdated(signer, true);
    }

    function removeAuthorizedSigner(address signer) external onlyOwner {
        authorizedSigners[signer] = false;
        emit SignerUpdated(signer, false);
    }

    function cleanupExpiredVerification(address developer) external onlyOwner {
        require(
            pendingVerifications[developer].isActive &&
            block.timestamp > pendingVerifications[developer].timestamp + VERIFICATION_TIMEOUT,
            "Verification not expired"
        );
        
        pendingVerifications[developer].isActive = false;
    }

    function emergencyRevokeVerification(address developer) external onlyOwner {
        DeveloperProfile.Profile memory profile = developerProfile.getDeveloperProfile(developer);
        if (bytes(profile.githubHandle).length > 0) {
            githubHandleToAddress[profile.githubHandle] = address(0);
        }
        // Note: This would require adding a revoke function to DeveloperProfile
    }
}
