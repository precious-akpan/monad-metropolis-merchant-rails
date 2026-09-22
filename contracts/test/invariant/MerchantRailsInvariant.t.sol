// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MerchantRails} from "../../src/MerchantRails.sol";
import {MockUSD} from "../../src/MockUSD.sol";
import {Handler} from "./Handler.sol";

/// Stateful fuzzing: Foundry generates long random sequences of createInvoice/pay/cancelInvoice
/// calls (interleaved, across multiple payers) via the Handler, and checks these properties hold
/// after EVERY sequence it tries -- not just the specific scenarios the unit tests spell out.
contract MerchantRailsInvariantTest is Test {
    MerchantRails internal rails;
    MockUSD internal usd;
    Handler internal handler;

    address internal merchant = makeAddr("invariantMerchant");
    address internal treasury = makeAddr("invariantTreasury");
    uint16 internal constant FEE_BPS = 30;

    function setUp() public {
        usd = new MockUSD();
        rails = new MerchantRails(FEE_BPS, treasury);
        handler = new Handler(rails, usd, merchant, treasury);

        targetContract(address(handler));
    }

    /// The contract must never custody funds, no matter what sequence of calls led here.
    function invariant_neverCustodiesFunds() public view {
        assertEq(usd.balanceOf(address(rails)), 0, "contract must never hold funds");
    }

    /// No invoice can ever be successfully paid more than once, cancelled more than once, or
    /// both paid AND cancelled -- across any interleaving the fuzzer found, not just the
    /// hand-written double-pay unit test.
    function invariant_noInvoiceDoubleSettled() public view {
        uint256 n = handler.createdIdsLength();
        for (uint256 i = 0; i < n; i++) {
            bytes32 id = handler.createdIds(i);
            assertLe(handler.payAttempts(id), 1, "invoice paid more than once");
            assertLe(handler.cancelAttempts(id), 1, "invoice cancelled more than once");
            assertLe(handler.payAttempts(id) + handler.cancelAttempts(id), 1, "invoice both paid and cancelled");
        }
    }

    /// Every unit of value that ever left a payer for a successfully paid invoice is accounted
    /// for in the merchant's and treasury's balances -- nothing lost, nothing created, across the
    /// whole random run.
    function invariant_valueConservationAcrossRun() public view {
        assertEq(
            usd.balanceOf(merchant) + usd.balanceOf(treasury),
            handler.ghost_sumPaid(),
            "value conservation across the entire fuzzed run"
        );
    }
}
