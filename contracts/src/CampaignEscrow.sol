// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for the World ID Router
interface IWorldID {
    function verifyProof(
        address signal,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract CampaignEscrow {
    // --- State Variables ---

    address public owner;
    address public relayer; // The trusted backend address that can trigger payouts

    IWorldID public worldId;
    string public actionId = "fundcampaignaction";
    string public appId = "app_aa2fa9002851b92d018042049b93071b"; // Replace with your App ID

    mapping(string => uint256) public campaignBalances;
    mapping(uint256 => bool) public nullifierHashes;
    
    // --- Events ---

    event CampaignFunded(string indexed campaignId, address indexed funder, uint256 amount);
    event RewardClaimed(string indexed campaignId, address indexed tester, uint256 amount);
    event RelayerUpdated(address indexed newRelayer);

    // --- Modifiers ---

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call this function");
        _;
    }

    // --- Functions ---

    constructor(address _worldIdRouter) {
        owner = msg.sender; // The deployer is the owner
        relayer = msg.sender; // Initially, the owner is also the relayer
        worldId = IWorldID(_worldIdRouter);
    }
    
    /**
     * @dev Allows the owner to set the trusted backend/relayer address.
     */
    function setRelayer(address _newRelayer) public onlyOwner {
        require(_newRelayer != address(0), "Invalid relayer address");
        relayer = _newRelayer;
        emit RelayerUpdated(_newRelayer);
    }

    /**
     * @dev Fund a campaign with ETH, requiring World ID proof.
     */
    function fundCampaign(
        string memory campaignId,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public payable {
        require(msg.value > 0, "Funding amount must be > 0");
        require(!nullifierHashes[nullifierHash], "Proof has already been used");

        worldId.verifyProof(msg.sender, root, nullifierHash, proof);

        nullifierHashes[nullifierHash] = true;
        campaignBalances[campaignId] += msg.value;
        
        emit CampaignFunded(campaignId, msg.sender, msg.value);
    }
    
    /**
     * @dev Releases funds to a tester. Can only be called by the trusted relayer.
     * The backend is responsible for verifying that the tester completed all tasks.
     */
    function releaseFunds(string memory campaignId, address payable tester, uint256 amount) public onlyRelayer {
        require(amount > 0, "Amount must be > 0");
        require(campaignBalances[campaignId] >= amount, "Insufficient funds for this campaign");

        // Deduct from the campaign balance
        campaignBalances[campaignId] -= amount;

        // Transfer the funds to the tester
        (bool success, ) = tester.call{value: amount}("");
        require(success, "Failed to send reward to tester");

        emit RewardClaimed(campaignId, tester, amount);
    }
    
    function getCampaignBalance(string memory campaignId) public view returns (uint256) {
        return campaignBalances[campaignId];
    }
}