// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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