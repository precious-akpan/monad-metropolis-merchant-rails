// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MerchantRails} from "../src/MerchantRails.sol";
import {MockUSD} from "../src/MockUSD.sol";

contract MerchantRailsTest is Test {
    MerchantRails internal rails;
    MockUSD internal usd;

    address internal merchant = makeAddr("merchant");
    address internal customer = makeAddr("customer");
    address internal treasury = makeAddr("treasury");
    address internal stranger = makeAddr("stranger");

    uint16 internal constant FEE_BPS = 30; // 0.30%
    uint256 internal constant PRICE = 25_000_000; // 25.00 mUSD (6 decimals)

    event InvoiceCreated(
        bytes32 indexed id, address indexed merchant, address token, uint256 amount, uint64 expiresAt, bytes32 ref
    );
    event InvoicePaid(
        bytes32 indexed id,
        address indexed merchant,
        address indexed payer,
        address token,
        uint256 amount,
        uint256 fee,
        uint64 paidAt
    );
    event InvoiceCancelled(bytes32 indexed id, address indexed merchant);

    function setUp() public {
        usd = new MockUSD();
        rails = new MerchantRails(FEE_BPS, treasury);
        usd.mint(customer, 1_000_000_000);
        vm.prank(customer);
        usd.approve(address(rails), type(uint256).max);
    }

    function _invoice(uint256 amount, uint64 expiresAt) internal returns (bytes32 id) {
        vm.prank(merchant);
        id = rails.createInvoice(address(usd), amount, expiresAt, bytes32("order-1"));
    }

    // ---------------------------------------------------------------- happy path

    function test_pay_splitsFeeAndMerchant_andEmits() public {
        bytes32 id = _invoice(PRICE, 0);
        uint256 fee = (PRICE * FEE_BPS) / 10_000;

        vm.expectEmit(true, true, true, true);
        emit InvoicePaid(id, merchant, customer, address(usd), PRICE, fee, uint64(block.timestamp));
        vm.prank(customer);
        rails.pay(id);

        assertEq(usd.balanceOf(merchant), PRICE - fee, "merchant net");
        assertEq(usd.balanceOf(treasury), fee, "fee");
        assertEq(usd.balanceOf(address(rails)), 0, "contract must never hold funds");
        (,,,, MerchantRails.Status s) = rails.invoices(id);
        assertEq(uint8(s), uint8(MerchantRails.Status.Paid));
    }

    function test_createInvoice_emitsAndStores() public {
        uint64 exp = uint64(block.timestamp + 1 hours);
        bytes32 expectedId = keccak256(abi.encode(block.chainid, address(rails), merchant, uint256(0)));

        vm.expectEmit(true, true, false, true);
        emit InvoiceCreated(expectedId, merchant, address(usd), PRICE, exp, bytes32("order-1"));
        vm.prank(merchant);
        bytes32 id = rails.createInvoice(address(usd), PRICE, exp, bytes32("order-1"));

        assertEq(id, expectedId);
        (address m, address t, uint128 a, uint64 e, MerchantRails.Status s) = rails.invoices(id);
        assertEq(m, merchant);
        assertEq(t, address(usd));
        assertEq(a, PRICE);
        assertEq(e, exp);
        assertEq(uint8(s), uint8(MerchantRails.Status.Open));
    }

    function test_thirdPartyCanPay() public {
        bytes32 id = _invoice(PRICE, 0);
        usd.mint(stranger, PRICE);
        vm.startPrank(stranger);
        usd.approve(address(rails), PRICE);
        rails.pay(id);
        vm.stopPrank();
        assertEq(usd.balanceOf(merchant), PRICE - (PRICE * FEE_BPS) / 10_000);
    }

    function test_invoiceIdsAreUniqueForIdenticalParams() public {
        bytes32 a = _invoice(PRICE, 0);
        bytes32 b = _invoice(PRICE, 0);
        assertTrue(a != b);
        assertEq(rails.merchantNonce(merchant), 2);
    }

    function test_zeroFee_merchantGetsFullAmount() public {
        MerchantRails free = new MerchantRails(0, address(0));
        vm.prank(merchant);
        bytes32 id = free.createInvoice(address(usd), PRICE, 0, 0);
        vm.startPrank(customer);
        usd.approve(address(free), PRICE);
        free.pay(id);
        vm.stopPrank();
        assertEq(usd.balanceOf(merchant), PRICE);
        assertEq(usd.balanceOf(address(free)), 0);
    }

    // ---------------------------------------------------------------- adversarial

    function test_doublePay_reverts() public {
        bytes32 id = _invoice(PRICE, 0);
        vm.prank(customer);
        rails.pay(id);

        vm.prank(customer);
        vm.expectRevert(MerchantRails.InvoiceNotOpen.selector);
        rails.pay(id);
        assertEq(usd.balanceOf(merchant), PRICE - (PRICE * FEE_BPS) / 10_000, "paid exactly once");
    }

    function test_unknownInvoice_reverts() public {
        vm.prank(customer);
        vm.expectRevert(MerchantRails.InvoiceNotOpen.selector);
        rails.pay(bytes32(uint256(1234)));
    }

    function test_zeroAmount_reverts() public {
        vm.prank(merchant);
        vm.expectRevert(MerchantRails.ZeroAmount.selector);
        rails.createInvoice(address(usd), 0, 0, 0);
    }

    function test_zeroToken_reverts() public {
        vm.prank(merchant);
        vm.expectRevert(MerchantRails.ZeroAddress.selector);
        rails.createInvoice(address(0), PRICE, 0, 0);
    }

    function test_amountAboveUint128_reverts() public {
        vm.prank(merchant);
        vm.expectRevert(MerchantRails.AmountTooLarge.selector);
        rails.createInvoice(address(usd), uint256(type(uint128).max) + 1, 0, 0);
    }

    function test_expiryInPast_reverts() public {
        vm.warp(1_000_000);
        vm.prank(merchant);
        vm.expectRevert(MerchantRails.BadExpiry.selector);
        rails.createInvoice(address(usd), PRICE, uint64(block.timestamp), 0);
    }

    function test_payAtExactExpiry_succeeds_afterExpiry_reverts() public {
        uint64 exp = uint64(block.timestamp + 100);
        bytes32 okId = _invoice(PRICE, exp);
        bytes32 lateId = _invoice(PRICE, exp);

        vm.warp(exp); // boundary: still payable
        vm.prank(customer);
        rails.pay(okId);

        vm.warp(uint256(exp) + 1);
        vm.prank(customer);
        vm.expectRevert(MerchantRails.InvoiceExpired.selector);
        rails.pay(lateId);
    }

    function test_cancel_byMerchant_thenPayReverts() public {
        bytes32 id = _invoice(PRICE, 0);
        vm.expectEmit(true, true, false, false);
        emit InvoiceCancelled(id, merchant);
        vm.prank(merchant);
        rails.cancelInvoice(id);

        vm.prank(customer);
        vm.expectRevert(MerchantRails.InvoiceNotOpen.selector);
        rails.pay(id);
    }

    function test_cancel_byStranger_reverts() public {
        bytes32 id = _invoice(PRICE, 0);
        vm.prank(stranger);
        vm.expectRevert(MerchantRails.NotMerchant.selector);
        rails.cancelInvoice(id);
    }

    function test_cancel_afterPaid_reverts() public {
        bytes32 id = _invoice(PRICE, 0);
        vm.prank(customer);
        rails.pay(id);
        vm.prank(merchant);
        vm.expectRevert(MerchantRails.InvoiceNotOpen.selector);
        rails.cancelInvoice(id);
    }

    function test_pay_withoutAllowance_reverts_andInvoiceStaysOpen() public {
        bytes32 id = _invoice(PRICE, 0);
        usd.mint(stranger, PRICE);
        vm.prank(stranger); // has funds, never approved
        vm.expectRevert();
        rails.pay(id);

        (,,,, MerchantRails.Status s) = rails.invoices(id);
        assertEq(uint8(s), uint8(MerchantRails.Status.Open), "failed pay must not consume the invoice");
    }

    function test_pay_insufficientBalance_reverts_andInvoiceStaysOpen() public {
        bytes32 id = _invoice(PRICE, 0);
        address broke = makeAddr("broke");
        vm.startPrank(broke);
        usd.approve(address(rails), type(uint256).max);
        vm.expectRevert();
        rails.pay(id);
        vm.stopPrank();

        (,,,, MerchantRails.Status s) = rails.invoices(id);
        assertEq(uint8(s), uint8(MerchantRails.Status.Open));
    }

    function test_constructor_rejectsFeeAboveCap() public {
        vm.expectRevert(MerchantRails.FeeTooHigh.selector);
        new MerchantRails(101, treasury);
    }

    function test_constructor_rejectsFeeWithoutRecipient() public {
        vm.expectRevert(MerchantRails.ZeroAddress.selector);
        new MerchantRails(30, address(0));
    }

    // ---------------------------------------------------------------- fuzz

    /// Money is conserved and the contract never custodies, for any amount and any legal fee.
    function testFuzz_feeSplit_conservesValue_andNeverCustodies(uint256 amount, uint16 feeBps) public {
        amount = bound(amount, 1, type(uint128).max);
        feeBps = uint16(bound(feeBps, 0, rails.MAX_FEE_BPS()));

        MerchantRails r = new MerchantRails(feeBps, treasury);
        address payer = makeAddr("fuzzPayer");
        usd.mint(payer, amount);
        vm.prank(payer);
        usd.approve(address(r), amount);

        vm.prank(merchant);
        bytes32 id = r.createInvoice(address(usd), amount, 0, 0);

        uint256 merchantBefore = usd.balanceOf(merchant);
        uint256 treasuryBefore = usd.balanceOf(treasury);

        vm.prank(payer);
        r.pay(id);

        uint256 merchantGot = usd.balanceOf(merchant) - merchantBefore;
        uint256 treasuryGot = usd.balanceOf(treasury) - treasuryBefore;

        assertEq(merchantGot + treasuryGot, amount, "value conserved");
        assertEq(treasuryGot, (amount * feeBps) / 10_000, "fee is floor(amount*bps/1e4)");
        assertLe(treasuryGot * 100, amount, "fee never exceeds 1%");
        assertEq(usd.balanceOf(address(r)), 0, "contract holds nothing");
        assertEq(usd.balanceOf(payer), 0, "payer charged exactly the invoice amount");
    }
}
