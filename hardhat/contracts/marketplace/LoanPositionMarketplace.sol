// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "../tokens/LoanPositionNFT.sol";

contract LoanPositionMarketplace is Ownable, ReentrancyGuard, ERC721Holder {
    struct Listing {
        uint256 tokenId;
        address seller;
        address paymentToken;
        uint256 price;
        uint256 listingTime;
        bool isActive;
        uint256 expiryTime;
    }

    struct Auction {
        uint256 tokenId;
        address seller;
        address paymentToken;
        uint256 startPrice;
        uint256 currentBid;
        address currentBidder;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 minBidIncrement;
    }

    struct MarketStats {
        uint256 totalVolume;
        uint256 totalTrades;
        uint256 averagePrice;
        uint256 lastTradeTime;
    }

    LoanPositionNFT public immutable loanPositionNFT;
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Auction) public auctions;
    mapping(address => bool) public acceptedTokens;
    mapping(address => uint256) public userTrades;
    mapping(address => uint256) public userVolume;
    
    MarketStats public marketStats;
    
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant MAX_FEE = 1000; // 10%
    address public feeRecipient;
    
    uint256 public minListingDuration = 1 hours;
    uint256 public maxListingDuration = 30 days;
    uint256 public minAuctionDuration = 1 hours;
    uint256 public maxAuctionDuration = 7 days;
    
    event TokenListed(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed paymentToken,
        uint256 price,
        uint256 expiryTime
    );
    
    event TokenSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        address paymentToken,
        uint256 price
    );
    
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    
    event AuctionStarted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed paymentToken,
        uint256 startPrice,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 bidAmount
    );
    
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 finalPrice
    );

    modifier onlyTokenOwner(uint256 tokenId) {
        require(loanPositionNFT.ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier validToken(address token) {
        require(acceptedTokens[token], "Token not accepted");
        _;
    }

    constructor(
        address _loanPositionNFT,
        address _feeRecipient
    ) Ownable(msg.sender) {
        loanPositionNFT = LoanPositionNFT(_loanPositionNFT);
        feeRecipient = _feeRecipient;
        
        // Accept ETH by default (address(0))
        acceptedTokens[address(0)] = true;
    }

    function listPosition(
        uint256 tokenId,
        address paymentToken,
        uint256 price,
        uint256 duration
    ) external onlyTokenOwner(tokenId) validToken(paymentToken) nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(duration >= minListingDuration && duration <= maxListingDuration, "Invalid duration");
        require(!listings[tokenId].isActive, "Already listed");
        require(!auctions[tokenId].isActive, "Currently in auction");

        // Transfer NFT to marketplace
        loanPositionNFT.safeTransferFrom(msg.sender, address(this), tokenId);

        uint256 expiryTime = block.timestamp + duration;
        
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            paymentToken: paymentToken,
            price: price,
            listingTime: block.timestamp,
            isActive: true,
            expiryTime: expiryTime
        });

        emit TokenListed(tokenId, msg.sender, paymentToken, price, expiryTime);
    }

    function buyPosition(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(block.timestamp <= listing.expiryTime, "Listing expired");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        uint256 price = listing.price;
        address seller = listing.seller;
        address paymentToken = listing.paymentToken;

        // Mark as inactive before transfers
        listing.isActive = false;

        // Handle payment
        uint256 fee = (price * platformFee) / 10000;
        uint256 sellerAmount = price - fee;

        if (paymentToken == address(0)) {
            // ETH payment
            require(msg.value == price, "Incorrect ETH amount");
            payable(seller).transfer(sellerAmount);
            payable(feeRecipient).transfer(fee);
        } else {
            // ERC20 payment
            IERC20 token = IERC20(paymentToken);
            require(token.transferFrom(msg.sender, seller, sellerAmount), "Transfer to seller failed");
            require(token.transferFrom(msg.sender, feeRecipient, fee), "Fee transfer failed");
        }

        // Transfer NFT to buyer
        loanPositionNFT.safeTransferFrom(address(this), msg.sender, tokenId);

        // Update stats
        _updateMarketStats(price);
        userTrades[msg.sender]++;
        userTrades[seller]++;
        userVolume[msg.sender] += price;
        userVolume[seller] += price;

        emit TokenSold(tokenId, seller, msg.sender, paymentToken, price);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not your listing");

        listing.isActive = false;
        
        // Return NFT to seller
        loanPositionNFT.safeTransferFrom(address(this), msg.sender, tokenId);

        emit ListingCancelled(tokenId, msg.sender);
    }

    function startAuction(
        uint256 tokenId,
        address paymentToken,
        uint256 startPrice,
        uint256 duration,
        uint256 minBidIncrement
    ) external onlyTokenOwner(tokenId) validToken(paymentToken) nonReentrant {
        require(startPrice > 0, "Start price must be greater than 0");
        require(duration >= minAuctionDuration && duration <= maxAuctionDuration, "Invalid duration");
        require(!listings[tokenId].isActive, "Currently listed");
        require(!auctions[tokenId].isActive, "Already in auction");
        require(minBidIncrement > 0, "Min bid increment required");

        // Transfer NFT to marketplace
        loanPositionNFT.safeTransferFrom(msg.sender, address(this), tokenId);

        uint256 endTime = block.timestamp + duration;
        
        auctions[tokenId] = Auction({
            tokenId: tokenId,
            seller: msg.sender,
            paymentToken: paymentToken,
            startPrice: startPrice,
            currentBid: 0,
            currentBidder: address(0),
            startTime: block.timestamp,
            endTime: endTime,
            isActive: true,
            minBidIncrement: minBidIncrement
        });

        emit AuctionStarted(tokenId, msg.sender, paymentToken, startPrice, endTime);
    }

    function placeBid(uint256 tokenId) external payable nonReentrant {
        Auction storage auction = auctions[tokenId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp <= auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Cannot bid on own auction");

        uint256 bidAmount;
        if (auction.paymentToken == address(0)) {
            bidAmount = msg.value;
        } else {
            // For ERC20 auctions, we'd need to implement a different mechanism
            // This is simplified for ETH auctions
            revert("ERC20 auctions not implemented in this version");
        }

        uint256 minBid = auction.currentBid == 0 ? 
            auction.startPrice : 
            auction.currentBid + auction.minBidIncrement;
        
        require(bidAmount >= minBid, "Bid too low");

        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            payable(auction.currentBidder).transfer(auction.currentBid);
        }

        auction.currentBid = bidAmount;
        auction.currentBidder = msg.sender;

        // Extend auction if bid placed in last 10 minutes
        if (auction.endTime - block.timestamp < 10 minutes) {
            auction.endTime = block.timestamp + 10 minutes;
        }

        emit BidPlaced(tokenId, msg.sender, bidAmount);
    }

    function endAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = auctions[tokenId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp > auction.endTime, "Auction still active");

        auction.isActive = false;

        if (auction.currentBidder != address(0)) {
            // Successful auction
            uint256 fee = (auction.currentBid * platformFee) / 10000;
            uint256 sellerAmount = auction.currentBid - fee;

            payable(auction.seller).transfer(sellerAmount);
            payable(feeRecipient).transfer(fee);

            // Transfer NFT to winner
            loanPositionNFT.safeTransferFrom(address(this), auction.currentBidder, tokenId);

            // Update stats
            _updateMarketStats(auction.currentBid);
            userTrades[auction.currentBidder]++;
            userTrades[auction.seller]++;
            userVolume[auction.currentBidder] += auction.currentBid;
            userVolume[auction.seller] += auction.currentBid;

            emit AuctionEnded(tokenId, auction.currentBidder, auction.currentBid);
        } else {
            // No bids, return NFT to seller
            loanPositionNFT.safeTransferFrom(address(this), auction.seller, tokenId);
            emit AuctionEnded(tokenId, address(0), 0);
        }
    }

    function _updateMarketStats(uint256 price) internal {
        marketStats.totalVolume += price;
        marketStats.totalTrades++;
        marketStats.averagePrice = marketStats.totalVolume / marketStats.totalTrades;
        marketStats.lastTradeTime = block.timestamp;
    }

    // View functions
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function getAuction(uint256 tokenId) external view returns (Auction memory) {
        return auctions[tokenId];
    }

    function getMarketStats() external view returns (MarketStats memory) {
        return marketStats;
    }

    function getUserStats(address user) external view returns (uint256 trades, uint256 volume) {
        return (userTrades[user], userVolume[user]);
    }

    function isListingExpired(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].isActive && block.timestamp > listings[tokenId].expiryTime;
    }

    function isAuctionEnded(uint256 tokenId) external view returns (bool) {
        return auctions[tokenId].isActive && block.timestamp > auctions[tokenId].endTime;
    }

    // Admin functions
    function addAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = true;
    }

    function removeAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = false;
    }

    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_FEE, "Fee too high");
        platformFee = _fee;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }

    function setListingDuration(uint256 _min, uint256 _max) external onlyOwner {
        require(_min < _max, "Invalid duration range");
        minListingDuration = _min;
        maxListingDuration = _max;
    }

    function setAuctionDuration(uint256 _min, uint256 _max) external onlyOwner {
        require(_min < _max, "Invalid duration range");
        minAuctionDuration = _min;
        maxAuctionDuration = _max;
    }

    // Emergency functions
    function emergencyWithdraw(uint256 tokenId) external onlyOwner {
        loanPositionNFT.safeTransferFrom(address(this), owner(), tokenId);
    }

    function emergencyWithdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function emergencyWithdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
