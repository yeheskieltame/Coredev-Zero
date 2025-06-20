// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LoanPositionNFT is ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    struct LoanPosition {
        address borrower;
        address market;
        uint256 loanAmount;
        uint256 interestRate;
        uint256 startTime;
        uint256 endTime;
        uint256 currentDebt;
        bool isActive;
        string projectDataCID;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => LoanPosition) public loanPositions;
    mapping(address => uint256[]) public borrowerPositions;
    mapping(address => uint256[]) public marketPositions;

    event PositionMinted(
        uint256 indexed tokenId,
        address indexed borrower,
        address indexed market,
        uint256 loanAmount
    );
    
    event PositionUpdated(uint256 indexed tokenId, uint256 currentDebt, bool isActive);

    constructor() ERC721("Loan Position NFT", "LPNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mintPosition(
        address borrower,
        address market,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 duration,
        string memory projectDataCID
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;
        
        loanPositions[tokenId] = LoanPosition({
            borrower: borrower,
            market: market,
            loanAmount: loanAmount,
            interestRate: interestRate,
            startTime: startTime,
            endTime: endTime,
            currentDebt: loanAmount,
            isActive: true,
            projectDataCID: projectDataCID
        });

        borrowerPositions[borrower].push(tokenId);
        marketPositions[market].push(tokenId);

        _safeMint(borrower, tokenId);
        
        // Set metadata URI
        string memory tokenURI = string(abi.encodePacked(
            "data:application/json;base64,",
            _encodeBase64(abi.encodePacked(
                '{"name":"Loan Position #', _toString(tokenId), '",',
                '"description":"CoreDev Zero Loan Position",',
                '"attributes":[',
                '{"trait_type":"Loan Amount","value":"', _toString(loanAmount), '"},',
                '{"trait_type":"Interest Rate","value":"', _toString(interestRate), '"},',
                '{"trait_type":"Market","value":"', _addressToString(market), '"}',
                ']}'
            ))
        ));
        
        _setTokenURI(tokenId, tokenURI);

        emit PositionMinted(tokenId, borrower, market, loanAmount);
        return tokenId;
    }

    function updatePosition(
        uint256 tokenId,
        uint256 currentDebt,
        bool isActive
    ) external onlyRole(MINTER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        
        loanPositions[tokenId].currentDebt = currentDebt;
        loanPositions[tokenId].isActive = isActive;
        
        emit PositionUpdated(tokenId, currentDebt, isActive);
    }

    function getLoanPosition(uint256 tokenId) external view returns (LoanPosition memory) {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        return loanPositions[tokenId];
    }

    function getBorrowerPositions(address borrower) external view returns (uint256[] memory) {
        return borrowerPositions[borrower];
    }

    function getMarketPositions(address market) external view returns (uint256[] memory) {
        return marketPositions[market];
    }

    function isPositionActive(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        return loanPositions[tokenId].isActive;
    }

    function getPositionValue(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        LoanPosition memory position = loanPositions[tokenId];
        
        if (!position.isActive) {
            return 0;
        }
        
        // Simple valuation: remaining debt with some discount for risk
        return position.currentDebt * 80 / 100; // 20% discount for liquidity risk
    }

    // Utility functions
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 _bytes = bytes32(uint256(uint160(_addr)));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _string = new bytes(42);
        _string[0] = '0';
        _string[1] = 'x';
        for(uint i = 0; i < 20; i++) {
            _string[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _string[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(_string);
    }

    function _encodeBase64(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        if (data.length == 0) return "";
        
        string memory result = new string(4 * ((data.length + 2) / 3));
        bytes memory resultBytes = bytes(result);
        
        uint256 i = 0;
        uint256 j = 0;
        
        for (; i + 3 <= data.length; i += 3) {
            uint256 a = uint256(uint8(data[i]));
            uint256 b = uint256(uint8(data[i + 1]));
            uint256 c = uint256(uint8(data[i + 2]));
            
            uint256 bitmap = (a << 16) | (b << 8) | c;
            
            resultBytes[j++] = bytes(table)[bitmap >> 18];
            resultBytes[j++] = bytes(table)[(bitmap >> 12) & 63];
            resultBytes[j++] = bytes(table)[(bitmap >> 6) & 63];
            resultBytes[j++] = bytes(table)[bitmap & 63];
        }
        
        if (data.length % 3 == 1) {
            uint256 bitmap = uint256(uint8(data[i])) << 16;
            resultBytes[j++] = bytes(table)[bitmap >> 18];
            resultBytes[j++] = bytes(table)[(bitmap >> 12) & 63];
            resultBytes[j++] = "=";
            resultBytes[j++] = "=";
        } else if (data.length % 3 == 2) {
            uint256 bitmap = (uint256(uint8(data[i])) << 16) | (uint256(uint8(data[i + 1])) << 8);
            resultBytes[j++] = bytes(table)[bitmap >> 18];
            resultBytes[j++] = bytes(table)[(bitmap >> 12) & 63];
            resultBytes[j++] = bytes(table)[(bitmap >> 6) & 63];
            resultBytes[j++] = "=";
        }
        
        return result;
    }

    // Override required functions
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
