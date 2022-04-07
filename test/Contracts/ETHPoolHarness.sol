// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "../../contracts/ETHPool.sol";

contract ETHPoolHarness is ETHPool {
    uint256 _blockTimestamp;

    function getBlockTimestamp()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _blockTimestamp;
    }

    function setBlockTimestamp(uint256 blockTimestamp) public {
        _blockTimestamp = blockTimestamp;
    }
}
