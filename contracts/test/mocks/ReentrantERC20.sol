// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {MerchantRails} from "../../src/MerchantRails.sol";

/// @notice TEST-ONLY malicious token. On an armed `transferFrom`, it re-enters MerchantRails
///         mid-payment before completing its own transfer -- exactly what a hostile token would
///         try. Used to prove the reentrancy guard and checks-effects-interactions ordering
///         actually hold, rather than trusting them by inspection.
contract ReentrantERC20 is ERC20 {
    MerchantRails public immutable rails;

    /// @dev What to attempt on re-entry, and which invoice id to target.
    enum Attack {
        None,
        PaySameInvoice,
        PayOtherInvoice,
        CancelSameInvoice
    }

    Attack public armedAttack;
    bytes32 public armedTargetId;

    /// @dev Set by the callback: did the re-entrant call revert (as it must)?
    bool public reentryAttempted;
    bool public reentryReverted;

    constructor(MerchantRails rails_) ERC20("Evil Token", "EVIL") {
        rails = rails_;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function arm(Attack attack, bytes32 targetId) external {
        armedAttack = attack;
        armedTargetId = targetId;
        reentryAttempted = false;
        reentryReverted = false;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (armedAttack != Attack.None) {
            Attack attack = armedAttack;
            armedAttack = Attack.None; // one-shot: don't recurse forever
            reentryAttempted = true;

            if (attack == Attack.PaySameInvoice || attack == Attack.PayOtherInvoice) {
                try rails.pay(armedTargetId) {
                    // If this succeeds, the reentrancy guard failed. The test asserts on
                    // `reentryReverted` and on final balances/status, so a silent success
                    // here is exactly what must NOT happen.
                } catch {
                    reentryReverted = true;
                }
            } else if (attack == Attack.CancelSameInvoice) {
                try rails.cancelInvoice(armedTargetId) {
                    // Same: a successful cancel mid-payment would mean CEI ordering failed.
                } catch {
                    reentryReverted = true;
                }
            }
        }
        return super.transferFrom(from, to, amount);
    }
}
