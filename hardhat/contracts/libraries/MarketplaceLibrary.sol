// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../tokens/LoanPositionNFT.sol";

/**
 * @title MarketplaceLibrary
 * @dev Library for marketplace calculations and validations
 * @notice Contains utility functions for loan position marketplace operations
 */
library MarketplaceLibrary {
    /// @dev Fee configuration for marketplace operations
    struct FeeConfig {
        uint256 platformFeeRate;    // Platform fee rate (basis points)
        uint256 minListingDuration; // Minimum listing duration
        uint256 maxListingDuration; // Maximum listing duration
        uint256 minAuctionDuration; // Minimum auction duration
        uint256 maxAuctionDuration; // Maximum auction duration
        uint256 bidIncrement;       // Minimum bid increment (basis points)
    }

    /// @dev Constants for marketplace operations
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_PLATFORM_FEE = 500; // 5% maximum platform fee
    uint256 public constant MIN_BID_INCREMENT = 100; // 1% minimum bid increment
    uint256 public constant DEFAULT_LISTING_DURATION = 7 days;
    uint256 public constant DEFAULT_AUCTION_DURATION = 3 days;

    /**
     * @notice Calculate platform fee for a transaction
     * @param amount Transaction amount
     * @param feeRate Fee rate in basis points
     * @return Platform fee amount
     */
    function calculatePlatformFee(uint256 amount, uint256 feeRate) internal pure returns (uint256) {
        return (amount * feeRate) / BASIS_POINTS;
    }

    /**
     * @notice Calculate seller proceeds after platform fee
     * @param amount Transaction amount
     * @param feeRate Fee rate in basis points
     * @return Seller proceeds
     */
    function calculateSellerProceeds(uint256 amount, uint256 feeRate) internal pure returns (uint256) {
        uint256 fee = calculatePlatformFee(amount, feeRate);
        return amount - fee;
    }

    /**
     * @notice Validate listing parameters
     * @param price Listing price
     * @param duration Listing duration
     * @param config Fee configuration
     * @return bool Whether parameters are valid
     */
    function validateListingParams(
        uint256 price,
        uint256 duration,
        FeeConfig memory config
    ) internal pure returns (bool) {
        return (
            price > 0 &&
            duration >= config.minListingDuration &&
            duration <= config.maxListingDuration
        );
    }

    /**
     * @notice Validate auction parameters
     * @param startingBid Starting bid amount
     * @param duration Auction duration
     * @param config Fee configuration
     * @return bool Whether parameters are valid
     */
    function validateAuctionParams(
        uint256 startingBid,
        uint256 duration,
        FeeConfig memory config
    ) internal pure returns (bool) {
        return (
            startingBid > 0 &&
            duration >= config.minAuctionDuration &&
            duration <= config.maxAuctionDuration
        );
    }

    /**
     * @notice Calculate minimum bid for an auction
     * @param currentBid Current highest bid
     * @param bidIncrement Bid increment in basis points
     * @return Minimum next bid amount
     */
    function calculateMinimumBid(uint256 currentBid, uint256 bidIncrement) internal pure returns (uint256) {
        if (currentBid == 0) return 0;
        uint256 increment = (currentBid * bidIncrement) / BASIS_POINTS;
        return currentBid + increment;
    }

    /**
     * @notice Validate bid amount for an auction
     * @param bidAmount Proposed bid amount
     * @param currentBid Current highest bid
     * @param startingBid Starting bid of the auction
     * @param bidIncrement Bid increment in basis points
     * @return bool Whether bid is valid
     */
    function validateBid(
        uint256 bidAmount,
        uint256 currentBid,
        uint256 startingBid,
        uint256 bidIncrement
    ) internal pure returns (bool) {
        if (currentBid == 0) {
            return bidAmount >= startingBid;
        }
        
        uint256 minimumBid = calculateMinimumBid(currentBid, bidIncrement);
        return bidAmount >= minimumBid;
    }

    /**
     * @notice Transfer ERC20 tokens with validation
     * @param token ERC20 token contract
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     * @return bool Success status
     */
    function safeTransferToken(
        IERC20 token,
        address from,
        address to,
        uint256 amount
    ) internal returns (bool) {
        if (amount == 0) return true;
        
        uint256 balanceBefore = token.balanceOf(to);
        
        if (from == address(this)) {
            require(token.transfer(to, amount), "Transfer failed");
        } else {
            require(token.transferFrom(from, to, amount), "Transfer failed");
        }
        
        uint256 balanceAfter = token.balanceOf(to);
        require(balanceAfter >= balanceBefore + amount, "Transfer amount mismatch");
        
        return true;
    }

    /**
     * @notice Transfer NFT with validation
     * @param nft NFT contract
     * @param from Sender address
     * @param to Recipient address
     * @param tokenId Token ID to transfer
     */
    function safeTransferNFT(
        LoanPositionNFT nft,
        address from,
        address to,
        uint256 tokenId
    ) internal {
        require(nft.ownerOf(tokenId) == from, "Not token owner");
        nft.safeTransferFrom(from, to, tokenId);
        require(nft.ownerOf(tokenId) == to, "NFT transfer failed");
    }

    /**
     * @notice Get current loan position value estimate
     * @param nft Loan position NFT contract
     * @param tokenId Token ID
     * @return Estimated current value
     */
    function getCurrentPositionValue(
        LoanPositionNFT nft,
        uint256 tokenId
    ) internal view returns (uint256) {
        try nft.getPositionValue(tokenId) returns (uint256 value) {
            return value;
        } catch {
            // If getPositionValue fails, return 0 as fallback
            return 0;
        }
    }

    /**
     * @notice Check if a loan position is tradeable
     * @param nft Loan position NFT contract
     * @param tokenId Token ID
     * @return bool Whether position can be traded
     */
    function isPositionTradeable(
        LoanPositionNFT nft,
        uint256 tokenId
    ) internal view returns (bool) {
        try nft.isPositionActive(tokenId) returns (bool active) {
            return active;
        } catch {
            // If check fails, assume not tradeable for safety
            return false;
        }
    }
}
