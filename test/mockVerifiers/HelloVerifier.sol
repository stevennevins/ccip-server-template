// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloVerifier {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    event HelloResult(string result);

    function hello() external pure returns (uint256) {
        return 255;
    }

    function helloOffchain() external view returns (string memory) {
        return string("hello");
    }

    function helloCallback(
        bytes calldata result
    ) public pure returns (string memory) {
        string memory decodedResult = abi.decode(result, (string));
        return decodedResult;
    }
}
