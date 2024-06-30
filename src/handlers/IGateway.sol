// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGateway {
    function hello() external view returns (string memory);

    function signedHello() external view returns (bytes memory, bytes memory);
}
