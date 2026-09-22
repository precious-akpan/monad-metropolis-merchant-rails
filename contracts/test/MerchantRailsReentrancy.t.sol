// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MerchantRails} from "../src/MerchantRails.sol";
import {ReentrantERC20} from "./mocks/ReentrantERC20.sol";

/// Proves reentrancy defenses hold against an actively hostile token, not just by inspection.
/// MerchantRails has two independent layers of defense: `nonReentrant` on `pay()`, and
/// checks-effects-interactions (status flips to Paid before any external call). These tests
/// exercise both.
contract MerchantRailsReentrancyTest is Test {
    MerchantRails internal rails;
    ReentrantERC20 internal evil;

    address internal merchant = makeAddr("merchant");
    address internal customer = makeAddr("customer");
    address internal treasury = makeAddr("treasury");

    uint16 internal constant FEE_BPS = 30;
    uint256 internal constant PRICE = 25_000_000;

    function setUp() public {
        rails = new MerchantRails(FEE_BPS, treasury);
        evil = new ReentrantERC20(rails);
        evil.mint(customer, 1_000_000_000);
        vm.prank(customer);
        evil.approve(address(rails), type(uint256).max);
    }

    function _invoice() internal returns (bytes32 id) {
        vm.prank(merchant);
        id = rails.createInvoice(address(evil), PRICE, 0, 0);
    }

    /// Re-entering pay() on the SAME invoice mid-payment must revert (nonReentrant guard),
    /// and the outer, legitimate call must still succeed exactly once.
    function test_reentrantToken_paySameInvoice_blockedByGuard() public {
        bytes32 id = _invoice();
        evil.arm(ReentrantERC20.Attack.PaySameInvoice, id);

        vm.prank(customer);
        rails.pay(id); // outer call succeeds

        assertTrue(evil.reentryAttempted(), "sanity: the token actually tried to re-enter");
        assertTrue(evil.reentryReverted(), "reentrant pay() must revert");

        (,,,, MerchantRails.Status status) = rails.invoices(id);
        assertEq(uint8(status), uint8(MerchantRails.Status.Paid));
        assertEq(evil.balanceOf(merchant), PRICE - (PRICE * FEE_BPS) / 10_000, "merchant paid exactly once");
    }

    /// Re-entering pay() on a DIFFERENT, otherwise-payable invoice must also revert: the guard
    /// is contract-wide, not per-invoice, so it must not leave a loophole for "just pay a
    /// different invoice while the lock is held."
    function test_reentrantToken_payOtherInvoice_blockedByGuard() public {
        bytes32 id1 = _invoice();
        bytes32 id2 = _invoice();
        evil.arm(ReentrantERC20.Attack.PayOtherInvoice, id2);

        vm.prank(customer);
        rails.pay(id1);

        assertTrue(evil.reentryAttempted());
        assertTrue(evil.reentryReverted(), "reentrant pay() on a different invoice must also revert");

        // id2 must remain untouched -- still Open, never paid via the reentrant attempt.
        (,,,, MerchantRails.Status status2) = rails.invoices(id2);
        assertEq(uint8(status2), uint8(MerchantRails.Status.Open));

        // it can still be paid normally afterwards, proving the guard released cleanly.
        vm.prank(customer);
        rails.pay(id2);
        (,,,, MerchantRails.Status status2After) = rails.invoices(id2);
        assertEq(uint8(status2After), uint8(MerchantRails.Status.Paid));
    }

    /// Re-entering cancelInvoice() on the SAME invoice mid-payment exercises the OTHER defense
    /// layer: cancelInvoice carries no nonReentrant guard, so this specifically proves
    /// checks-effects-interactions (status already flipped to Paid) is what stops it, not the
    /// reentrancy modifier.
    function test_reentrantToken_cancelSameInvoiceDuringPay_blockedByCEI() public {
        bytes32 id = _invoice();
        evil.arm(ReentrantERC20.Attack.CancelSameInvoice, id);

        vm.prank(customer);
        rails.pay(id);

        assertTrue(evil.reentryAttempted());
        assertTrue(evil.reentryReverted(), "reentrant cancelInvoice() mid-payment must revert");

        (,,,, MerchantRails.Status status) = rails.invoices(id);
        assertEq(uint8(status), uint8(MerchantRails.Status.Paid), "must end Paid, not Cancelled");
        assertEq(evil.balanceOf(merchant), PRICE - (PRICE * FEE_BPS) / 10_000);
    }
}
