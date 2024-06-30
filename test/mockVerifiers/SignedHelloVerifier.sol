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

    address public signer;

    function signedHello() public view returns (string memory) {
        string[] memory urls = new string[](1);
        urls[0] = "http://localhost:8000/{sender}/{data}.json";

        bytes memory callData = abi.encodeWithSignature("signedHello()");

        revert OffchainLookup(
            address(this),
            urls,
            callData,
            this.signedHelloCallback.selector,
            ""
        );
    }

    function setSigner(address _signer) public {
        signer = _signer;
    }

    function signedHelloCallback(
        bytes calldata result,
        bytes calldata
    ) public view returns (string memory) {
        (bytes memory decodedResult, bytes memory signature) = abi.decode(
            result,
            (bytes, bytes)
        );

        require(
            keccak256(decodedResult) == keccak256(abi.encode("hello")),
            "Wrong String"
        );

        bytes32 messageHash = keccak256(decodedResult);

        bytes32 r;
        bytes32 s;
        uint8 v;

        // Check the signature length
        if (signature.length != 65) {
            revert("Invalid signature length");
        }

        // Divide the signature in r, s and v variables
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        // Version of signature should be 27 or 28
        if (v < 27) {
            v += 27;
        }

        if (v != 27 && v != 28) {
            revert("Invalid signature version");
        }

        address recovered = ecrecover(messageHash, v, r, s);
        require(recovered == signer, "Invalid Sig");
        return "hello";
    }
}
