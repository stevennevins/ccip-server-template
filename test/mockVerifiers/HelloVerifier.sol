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
        // string[] memory urls = new string[](1);
        // urls[0] = "http://localhost:8000/"; // Replace with your actual server URL
        // bytes memory callData = abi.encodeWithSignature(
        //     "hello() view returns (string memory)"
        // );
        // revert OffchainLookup(
        //     address(this),
        //     urls,
        //     callData,
        //     this.helloCallback.selector,
        //     ""
        // );
        return "";
    }

    function helloCallback(
        bytes calldata result
    ) public pure returns (string memory) {
        string memory decodedResult = abi.decode(result, (string));
        return decodedResult;
    }
}
