// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MerchantRails} from "../src/MerchantRails.sol";
import {MockUSD} from "../src/MockUSD.sol";

/// Testnet deploy (uses a Foundry keystore, per Monad's guide - never paste private keys):
///   forge script script/Deploy.s.sol --rpc-url monad_testnet --account monad-deployer --broadcast
///
/// Env (all optional):
///   FEE_BPS        protocol fee in basis points, max 100 (default 30)
///   FEE_RECIPIENT  fee sink (default: the deployer)
///   USE_MOCK_USD   "false" to skip deploying MockUSD (default: deploy it; TESTNET ONLY)
contract Deploy is Script {
    function run() external {
        uint16 feeBps = uint16(vm.envOr("FEE_BPS", uint256(30)));
        bool useMock = vm.envOr("USE_MOCK_USD", true);

        vm.startBroadcast();
        address feeRecipient = vm.envOr("FEE_RECIPIENT", msg.sender);
        MerchantRails rails = new MerchantRails(feeBps, feeRecipient);
        console.log("MerchantRails:", address(rails));
        console.log("  feeBps:", feeBps);
        console.log("  feeRecipient:", feeRecipient);

        if (useMock) {
            MockUSD usd = new MockUSD();
            console.log("MockUSD (testnet only):", address(usd));
        }
        vm.stopBroadcast();
    }
}
