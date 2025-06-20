// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILoanPositionMarketplace
 * @dev Interface for loan position trading marketplace
 * @notice Defines core marketplace functionality for trading loan position NFTs
 */
interface ILoanPositionMarketplace {
    /// @dev Listing information for loan positions
    struct Listing {
        address seller;         // Address of the seller
        uint256 tokenId;        // Token ID of the loan position
        uint256 price;          // Listing price in payment token
        uint256 deadline;       // Listing expiration timestamp
        bool isActive;          // Whether listing is active
    }

    /// @dev Auction information for loan positions
    struct Auction {
        address seller;         // Address of the seller
        uint256 tokenId;        // Token ID of the loan position
        uint256 startingBid;    // Starting bid amount
        uint256 currentBid;     // Current highest bid
        address currentBidder;  // Current highest bidder
        uint256 deadline;       // Auction end timestamp
        bool isActive;          // Whether auction is active
    }

    /**
     * @notice Create a fixed-price listing for a loan position
     * @param tokenId Token ID of the loan position
     * @param price Listing price in payment token
     * @param duration Duration of the listing in seconds
     */
    function createListing(uint256 tokenId, uint256 price, uint256 duration) external;

    /**
     * @notice Purchase a listed loan position
     * @param listingId ID of the listing to purchase
     */
    function buyListing(uint256 listingId) external;

    /**
     * @notice Create an auction for a loan position
     * @param tokenId Token ID of the loan position
     * @param startingBid Starting bid amount
     * @param duration Duration of the auction in seconds
     */
    function createAuction(uint256 tokenId, uint256 startingBid, uint256 duration) external;

    /**
     * @notice Place a bid on an auction
     * @param auctionId ID of the auction to bid on
     * @param bidAmount Bid amount
     */
    function placeBid(uint256 auctionId, uint256 bidAmount) external;

    /**
     * @notice Finalize an auction after it ends
     * @param auctionId ID of the auction to finalize
     */
    function finalizeAuction(uint256 auctionId) external;

    /**
     * @notice Cancel a listing (only by seller)
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external;

    /**
     * @notice Cancel an auction (only by seller, if no bids)
     * @param auctionId ID of the auction to cancel
     */
    function cancelAuction(uint256 auctionId) external;

    /// @dev Events for marketplace activities
    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 indexed tokenId, uint256 price);
    event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 indexed tokenId, uint256 startingBid);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 bidAmount);
    event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 winningBid);
    event AuctionCancelled(uint256 indexed auctionId);
}
