// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SignedHelloVerifier {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    event SignedHelloResult(string result);

    address public immutable signer;

    constructor(address _signer) {
        signer = _signer;
    }

    function signedHello() public view returns (string memory) {
        string[] memory urls = new string[](1);
        urls[0] = "http://localhost:8000/"; // Replace with your actual server URL

        bytes memory callData = abi.encodeWithSignature("signedHello()");

        revert OffchainLookup(
            address(this),
            urls,
            callData,
            this.signedHelloCallback.selector,
            ""
        );
    }

    function signedHelloCallback(
        bytes calldata result,
        bytes calldata signature
    ) public {
        string memory decodedResult = abi.decode(result, (string));

        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19\x00", keccak256(result))
        );

        address recoveredSigner = ecrecover(
            messageHash,
            uint8(signature[64]),
            bytes32(signature[0:32]),
            bytes32(signature[32:64])
        );

        require(recoveredSigner == signer, "Invalid signature");

        emit SignedHelloResult(decodedResult);
    }
}
