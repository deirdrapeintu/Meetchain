// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title POAP-like Badge Token (optional)
/// @notice Only the EventManager contract is allowed to mint badges
contract POAPToken is ERC721, Ownable {
    /// @dev address allowed to mint
    address public minter;

    /// @dev token id counter (global). Token id encodes eventId in high bits if needed
    uint256 private _nextId = 1;

    /// @dev optional baseURI for tokenURI resolution
    string private _baseTokenURI;

    error NotMinter();

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
        Ownable(msg.sender)
    {}

    function setMinter(address m) external onlyOwner {
        minter = m;
    }

    function setBaseURI(string calldata baseUri) external onlyOwner {
        _baseTokenURI = baseUri;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Mint a badge to `to` referencing `eventId`
    /// @dev Only callable by minter (EventManager)
    function mintBadge(address to, uint256 /*eventId*/ ) external returns (uint256 tokenId) {
        if (msg.sender != minter) revert NotMinter();
        tokenId = _nextId++;
        _safeMint(to, tokenId);
    }
}


