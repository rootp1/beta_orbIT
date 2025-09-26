// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CampaignEscrow} from "../src/CampaignEscrow.sol";

contract DeployCampaignEscrow is Script {
    function run() public {
        // Address of the World ID Router on the Sepolia testnet.
        // This address has been corrected with the proper checksum.
        address worldIdRouterAddress = 0x2823C9554d64911735160535A09B55a3845c2287; 

        vm.startBroadcast();

        // Pass the required address to the constructor during deployment
        CampaignEscrow campaignEscrow = new CampaignEscrow(worldIdRouterAddress);

        console.log("CampaignEscrow deployed to:", address(campaignEscrow));

        vm.stopBroadcast();
    }
}

