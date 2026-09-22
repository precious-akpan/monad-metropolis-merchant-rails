// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice TESTNET ONLY. A 6-decimal stand-in stablecoin with an open faucet-style mint so demo
///         accounts can be funded instantly. Never deploy this to mainnet.
contract MockUSD is ERC20 {
    constructor() ERC20("Mock USD", "mUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Anyone can mint. Intentional: this is a demo token.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
