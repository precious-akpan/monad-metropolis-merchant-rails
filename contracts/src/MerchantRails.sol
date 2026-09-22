// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MerchantRails
/// @notice Non-custodial invoice settlement. A merchant creates an invoice; a customer pays it in
///         one transaction; the stablecoin goes straight to the merchant (minus a small, capped
///         protocol fee). The contract never holds funds: every payment is two `transferFrom`
///         calls from the payer to the final recipients inside a single transaction.
/// @dev    Supports standard ERC-20s only. Fee-on-transfer / rebasing tokens are NOT supported
///         (the merchant would silently receive less than `amount - fee`). Use stablecoins.
contract MerchantRails is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status {
        None,
        Open,
        Paid,
        Cancelled
    }

    struct Invoice {
        address merchant;
        address token;
        uint128 amount;
        uint64 expiresAt; // 0 = never expires; otherwise payable while block.timestamp <= expiresAt
        Status status;
    }

    /// @notice Hard upper bound on the fee: 1.00%.
    uint16 public constant MAX_FEE_BPS = 100;

    uint16 public immutable feeBps;
    address public immutable feeRecipient;

    mapping(bytes32 id => Invoice) public invoices;
    /// @dev Per-merchant counter so invoice ids are derived on-chain and cannot be squatted.
    mapping(address merchant => uint256) public merchantNonce;

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

    error ZeroAmount();
    error AmountTooLarge();
    error ZeroAddress();
    error FeeTooHigh();
    error BadExpiry();
    error InvoiceNotOpen();
    error InvoiceExpired();
    error NotMerchant();

    constructor(uint16 feeBps_, address feeRecipient_) {
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        if (feeBps_ > 0 && feeRecipient_ == address(0)) revert ZeroAddress();
        feeBps = feeBps_;
        feeRecipient = feeRecipient_;
    }

    /// @notice Merchant creates an invoice for `amount` of `token`. `ref` is an opaque merchant
    ///         reference (e.g. a hash of a POS order number) surfaced only in the event.
    /// @return id The on-chain-derived invoice id (encode this in the checkout QR / link).
    function createInvoice(address token, uint256 amount, uint64 expiresAt, bytes32 ref)
        external
        returns (bytes32 id)
    {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount > type(uint128).max) revert AmountTooLarge();
        if (expiresAt != 0 && expiresAt <= block.timestamp) revert BadExpiry();

        id = keccak256(abi.encode(block.chainid, address(this), msg.sender, merchantNonce[msg.sender]++));
        invoices[id] = Invoice({
            merchant: msg.sender,
            token: token,
            // forge-lint: disable-next-line(unsafe-typecast)
            amount: uint128(amount), // safe: bounded by the AmountTooLarge check above
            expiresAt: expiresAt,
            status: Status.Open
        });

        emit InvoiceCreated(id, msg.sender, token, amount, expiresAt, ref);
    }

    /// @notice Pay an open invoice in full. Anyone may pay; the caller must have approved this
    ///         contract for at least the invoice amount.
    function pay(bytes32 id) external nonReentrant {
        Invoice storage inv = invoices[id];
        if (inv.status != Status.Open) revert InvoiceNotOpen();
        if (inv.expiresAt != 0 && block.timestamp > inv.expiresAt) revert InvoiceExpired();

        // Effects before interactions: the invoice can never be paid twice.
        inv.status = Status.Paid;

        address merchant = inv.merchant;
        IERC20 token = IERC20(inv.token);
        uint256 amount = inv.amount;
        uint256 fee = (amount * feeBps) / 10_000; // amount <= 2^128, feeBps <= 100: no overflow
        uint256 net = amount - fee;

        if (fee > 0) token.safeTransferFrom(msg.sender, feeRecipient, fee);
        token.safeTransferFrom(msg.sender, merchant, net);

        // forge-lint: disable-next-line(unsafe-typecast)
        emit InvoicePaid(id, merchant, msg.sender, address(token), amount, fee, uint64(block.timestamp)); // timestamp fits in uint64
    }

    /// @notice Merchant withdraws an unpaid invoice.
    function cancelInvoice(bytes32 id) external {
        Invoice storage inv = invoices[id];
        if (inv.merchant != msg.sender) revert NotMerchant();
        if (inv.status != Status.Open) revert InvoiceNotOpen();
        inv.status = Status.Cancelled;
        emit InvoiceCancelled(id, msg.sender);
    }
}
