// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TaskEscrow.sol";

contract DeployTaskEscrow is Script {
    function run() external {
        // Read PRIVATE_KEY as bytes
        bytes memory keyBytes = vm.envBytes("PRIVATE_KEY");

        // Convert bytes to uint256
        uint256 deployerKey = uint256(bytes32(keyBytes));

        vm.startBroadcast(deployerKey);

        TaskEscrow taskEscrow = new TaskEscrow();

        console.log(" TaskEscrow deployed at:", address(taskEscrow));

        vm.stopBroadcast();
    }
}
