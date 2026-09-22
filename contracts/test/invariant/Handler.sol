// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MerchantRails} from "../../src/MerchantRails.sol";
import {MockUSD} from "../../src/MockUSD.sol";

/// Bounded action surface for Foundry's stateful (invariant) fuzzer. Every call the fuzzer makes
/// lands here, gets bounded to sane inputs, and is wrapped in try/catch so an *expected* revert
/// (e.g. paying an already-closed invoice) never aborts the run -- only a genuine violation of an
/// invariant, checked separately, should ever fail the campaign.
contract Handler is Test {
    MerchantRails public immutable rails;
    MockUSD public immutable token;
    address public immutable merchant;
    address public immutable treasury;

    address[] public payers;
    bytes32[] public createdIds;

    /// @dev Successful (non-reverting) call counts per invoice -- the real thing we're proving
    ///      can never exceed 1, across ANY random sequence of create/pay/cancel the fuzzer finds.
    mapping(bytes32 => uint256) public payAttempts;
    mapping(bytes32 => uint256) public cancelAttempts;

    /// @dev Sum of `amount` for every invoice that was actually, successfully paid.
    uint256 public ghost_sumPaid;

    constructor(MerchantRails rails_, MockUSD token_, address merchant_, address treasury_) {
        rails = rails_;
        token = token_;
        merchant = merchant_;
        treasury = treasury_;

        for (uint256 i = 0; i < 3; i++) {
            address payer = makeAddr(string.concat("invariantPayer", vm.toString(i)));
            payers.push(payer);
            token.mint(payer, 1_000_000_000_000);
            vm.prank(payer);
            token.approve(address(rails), type(uint256).max);
        }
    }

    function createInvoice(uint256 amountSeed) external {
        uint256 amount = bound(amountSeed, 1, 1_000_000_000); // up to 1,000 mUSD
        vm.prank(merchant);
        bytes32 id = rails.createInvoice(address(token), amount, 0, 0);
        createdIds.push(id);
    }

    function pay(uint256 idSeed, uint256 payerSeed) external {
        if (createdIds.length == 0) return;
        bytes32 id = createdIds[idSeed % createdIds.length];
        address payer = payers[payerSeed % payers.length];

        (,, uint128 amount,,) = rails.invoices(id);

        vm.prank(payer);
        try rails.pay(id) {
            payAttempts[id]++;
            ghost_sumPaid += amount;
        } catch {
            // expected once an invoice is already Paid/Cancelled -- not a failure.
        }
    }

    function cancelInvoice(uint256 idSeed) external {
        if (createdIds.length == 0) return;
        bytes32 id = createdIds[idSeed % createdIds.length];

        vm.prank(merchant);
        try rails.cancelInvoice(id) {
            cancelAttempts[id]++;
        } catch {
            // expected once an invoice is already Paid/Cancelled -- not a failure.
        }
    }

    function createdIdsLength() external view returns (uint256) {
        return createdIds.length;
    }
}
