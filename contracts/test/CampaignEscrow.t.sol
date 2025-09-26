// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CampaignEscrow, IWorldID} from "../src/CampaignEscrow.sol";

// Mock (fake) version of the World ID contract for testing.
contract MockWorldID is IWorldID {
    function verifyProof(address, uint256, uint256, uint256[8] calldata) external view override {
        // Simulates a successful verification by doing nothing.
    }
}

contract CampaignEscrowTest is Test {
    CampaignEscrow escrow;
    MockWorldID mockWorldId;
    address owner; // The contract deployer
    address relayer; // The trusted backend address
    address funder;
    address tester;

    function setUp() public {
        owner = address(this); // The test contract itself can be the owner
        relayer = makeAddr("relayer");
        funder = makeAddr("funder");
        tester = makeAddr("tester");

        mockWorldId = new MockWorldID();
        escrow = new CampaignEscrow(address(mockWorldId));

        // Set the trusted relayer address
        escrow.setRelayer(relayer);
    }

    // --- Existing Funding Tests ---

    function test_FundCampaign_SucceedsWithValidProof() public {
        vm.deal(funder, 1 ether);
        vm.prank(funder);
        uint256[8] memory proof;
        escrow.fundCampaign{value: 1 ether}("test-campaign", 1, 123, proof);
        assertEq(escrow.getCampaignBalance("test-campaign"), 1 ether);
    }

    function test_FundCampaign_FailsIfProofIsReused() public {
        vm.deal(funder, 2 ether);
        uint256[8] memory proof;
        
        vm.prank(funder);
        escrow.fundCampaign{value: 1 ether}("test-campaign", 1, 1, proof);
        
        vm.prank(funder);
        vm.expectRevert("Proof has already been used");
        escrow.fundCampaign{value: 1 ether}("test-campaign", 1, 1, proof);
    }

    // --- NEW Tests for Payouts and Permissions ---

    /**
     * @dev Test that the relayer can successfully release funds to a tester.
     */
    function test_ReleaseFunds_SucceedsWhenCalledByRelayer() public {
        // Step 1: Fund the campaign first
        vm.deal(funder, 1 ether);
        vm.prank(funder);
        uint256[8] memory proof;
        escrow.fundCampaign{value: 1 ether}("test-campaign", 1, 123, proof);

        // Step 2: Relayer releases funds
        uint256 rewardAmount = 0.5 ether;
        vm.prank(relayer); // The transaction comes from the trusted relayer
        escrow.releaseFunds("test-campaign", payable(tester), rewardAmount);

        // Step 3: Check balances
        assertEq(escrow.getCampaignBalance("test-campaign"), 0.5 ether); // Campaign balance should decrease
        assertEq(tester.balance, rewardAmount); // Tester's balance should increase
    }

    /**
     * @dev Test that a random address cannot release funds.
     */
    function test_ReleaseFunds_FailsWhenCalledByRandomAddress() public {
        vm.deal(funder, 1 ether);
        vm.prank(funder);
        uint256[8] memory proof;
        escrow.fundCampaign{value: 1 ether}("test-campaign", 1, 123, proof);
        
        address randomAddress = makeAddr("random");
        
        vm.prank(randomAddress); // The transaction comes from a random address
        vm.expectRevert("Only relayer can call this function");
        escrow.releaseFunds("test-campaign", payable(tester), 0.5 ether);
    }

    /**
     * @dev Test that releasing funds fails if the campaign balance is too low.
     */
    function test_ReleaseFunds_FailsWithInsufficientFunds() public {
        vm.deal(funder, 1 ether);
        vm.prank(funder);
        uint256[8] memory proof;
        escrow.fundCampaign{value: 1 ether}("test-campaign", 1, 123, proof);

        vm.prank(relayer);
        vm.expectRevert("Insufficient funds for this campaign");
        escrow.releaseFunds("test-campaign", payable(tester), 2 ether); // Trying to release more than was funded
    }

    /**
     * @dev Test that the owner can update the relayer address.
     */
    function test_SetRelayer_SucceedsWhenCalledByOwner() public {
        address newRelayer = makeAddr("newRelayer");
        
        // The owner is address(this) in setUp()
        vm.prank(owner);
        escrow.setRelayer(newRelayer);
        
        assertEq(escrow.relayer(), newRelayer);
    }

    /**
     * @dev Test that a random address cannot update the relayer.
     */
    function test_SetRelayer_FailsWhenCalledByRandomAddress() public {
        address newRelayer = makeAddr("newRelayer");
        
        vm.prank(funder); // Comes from a random address
        vm.expectRevert("Only owner can call this function");
        escrow.setRelayer(newRelayer);
    }
}