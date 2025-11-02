// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IPOAPToken {
    function mintBadge(address to, uint256 eventId) external returns (uint256 tokenId);
}

/// @title MeetChain Event Manager with FHE-encrypted attendance counter
/// @notice Stores event metadata CID, time window and FHE-encrypted attendee count. Optional POAP minting.
contract EventManagerFHE is SepoliaConfig {
    struct Event {
        uint256 id;
        address organizer;
        string metadataCID; // IPFS CID
        uint64 startTime;
        uint64 endTime;
        bool mintPOAP;
        euint32 encryptedCount; // Encrypted attendee counter
    }

    event EventCreated(uint256 indexed eventId, address indexed organizer);
    event SignedIn(uint256 indexed eventId, address indexed attendee);

    IPOAPToken public immutable poap;
    uint256 public nextEventId = 1;

    mapping(uint256 => Event) private _events;
    mapping(uint256 => mapping(address => bool)) private _hasSigned;
    mapping(uint256 => mapping(address => bool)) private _badgeClaimed;

    constructor(address poapToken) {
        poap = IPOAPToken(poapToken);
    }

    function createEvent(
        string calldata metadataCID,
        uint256 startTime,
        uint256 endTime,
        bool mintPOAP
    ) external returns (uint256 eventId) {
        require(bytes(metadataCID).length > 0, "empty cid");
        require(endTime > startTime && endTime > block.timestamp, "invalid time");

        eventId = nextEventId++;
        _events[eventId] = Event({
            id: eventId,
            organizer: msg.sender,
            metadataCID: metadataCID,
            startTime: uint64(startTime),
            endTime: uint64(endTime),
            mintPOAP: mintPOAP,
            encryptedCount: FHE.asEuint32(0)
        });

        // Allow decrypt for organizer and contract initially (count=0)
        FHE.allowThis(_events[eventId].encryptedCount);
        FHE.allow(_events[eventId].encryptedCount, msg.sender);

        emit EventCreated(eventId, msg.sender);
    }

    /// @notice Returns public event info; encrypted count must be fetched with `getEncryptedCount`
    function getEvent(uint256 eventId) external view returns (Event memory) {
        Event memory e = _events[eventId];
        require(e.organizer != address(0), "not found");
        return e;
    }

    /// @notice Get event header without encrypted field to ease ABI decoding
    function getEventHeader(uint256 eventId)
        external
        view
        returns (
            uint256 id,
            address organizer,
            string memory metadataCID,
            uint64 startTime,
            uint64 endTime,
            bool mintPOAP
        )
    {
        Event storage e = _events[eventId];
        require(e.organizer != address(0), "not found");
        return (e.id, e.organizer, e.metadataCID, e.startTime, e.endTime, e.mintPOAP);
    }

    /// @notice Get encrypted attendee count handle
    function getEncryptedCount(uint256 eventId) external view returns (euint32) {
        Event storage e = _events[eventId];
        require(e.organizer != address(0), "not found");
        return e.encryptedCount;
    }

    function hasSigned(uint256 eventId, address user) external view returns (bool) {
        return _hasSigned[eventId][user];
    }

    /// @notice Sign-in using an encrypted + proofed value (typically 1). Demonstrates FHE input verification and accumulation.
    /// @param eventId Target event id
    /// @param oneEncrypted External encrypted euint32 (value should be 1)
    /// @param inputProof FHE input proof
    function signIn(
        uint256 eventId,
        externalEuint32 oneEncrypted,
        bytes calldata inputProof
    ) external {
        Event storage e = _events[eventId];
        require(e.organizer != address(0), "not found");
        require(block.timestamp >= e.startTime && block.timestamp <= e.endTime, "not open");
        require(!_hasSigned[eventId][msg.sender], "already signed");

        euint32 one = FHE.fromExternal(oneEncrypted, inputProof);
        e.encryptedCount = FHE.add(e.encryptedCount, one);

        // Grant decryption permissions (organizer, attendee, and contract itself)
        FHE.allowThis(e.encryptedCount);
        FHE.allow(e.encryptedCount, msg.sender);
        FHE.allow(e.encryptedCount, e.organizer);

        _hasSigned[eventId][msg.sender] = true;

        // no auto-mint; user must claim later if enabled

        emit SignedIn(eventId, msg.sender);
    }

    /// @notice Whether user can claim POAP badge for the event
    function canClaim(uint256 eventId, address user) public view returns (bool) {
        Event storage e = _events[eventId];
        if (e.organizer == address(0)) return false;
        if (!e.mintPOAP) return false;
        if (!_hasSigned[eventId][user]) return false;
        if (_badgeClaimed[eventId][user]) return false;
        return true;
    }

    /// @notice Claim POAP badge if eligible (must have signed and not already claimed)
    function claimBadge(uint256 eventId) external {
        require(canClaim(eventId, msg.sender), "not eligible");
        _badgeClaimed[eventId][msg.sender] = true;
        poap.mintBadge(msg.sender, eventId);
    }
}


