// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleBytecode {
    fallback() external payable {
        assembly {
            mstore(0, 255)
            return(0, 32)
        }
    }
}
