# CCIP Server Template

## Overview

The Cross-Chain Interoperability Protocol (CCIP) is a standardized method for smart contracts to access off-chain data and services. It was introduced as part of Ethereum Improvement Proposal (EIP) 3668 to address the limitations of existing oracle solutions and provide a more flexible and secure way for smart contracts to interact with external data sources.

Key aspects of CCIP:

The core mechanism of CCIP involves a smart contract reverting with an `OffchainLookup` error when it needs external data. This error contains all the information needed for a client to fetch the data off-chain and submit it back to the contract for verification.

This repository demonstrates a practical implementation of CCIP, showcasing how smart contracts can interact with off-chain data sources while maintaining the security and transparency of the blockchain.

## Implementation Details

### Writing a Handler

Handlers are the core components of a CCIP server. They process off-chain requests and return the required data. Here's a general structure for writing a handler:

1. Implement the `HandlerDescription` interface, define a `type` property to identify the handler, and implement a `func` property as an async function that can processes the request which contains the data from the revert and returns the result to the callback function specified.
2. Write the verifier contract that handles the callback from the client
3. Add the handler to the gateway.

Example structure:
Here's a detailed example of implementing a handler, using the `HelloVerifier.sol` contract and adding the `HelloHandler` to the gateway in `app.ts`.

#### Step 1: Implement the `HelloVerifier` Contract

The `HelloVerifier` contract is a smart contract that includes a function `helloOffchain` which reverts with an `OffchainLookup` error. This error contains the necessary information for the client to fetch data off-chain.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Gateway {
    function hello() external view returns (string memory);
}

contract HelloVerifier {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    function helloOffchain() external view returns (string memory) {
        string[] memory urls = new string[](1);
        urls[0] = "http://localhost:8000/{sender}/{data}.json";
        bytes memory callData = abi.encodeWithSelector(Gateway.hello.selector);
        revert OffchainLookup(
            address(this),
            urls,
            callData,
            this.helloCallback.selector,
            ""
        );
    }

    function helloCallback(
        bytes calldata result,
        bytes calldata
    ) public pure returns (string memory) {
        string memory decodedResult = abi.decode(result, (string));
        return decodedResult;
    }
}
```

#### Step 2: Write the `helloService.ts`

The `helloService.ts` file contains the implementation of the `HelloHandler` class. This class defines the handler that processes the off-chain requests and returns the required data.

Here's an example of the `helloService.ts` implementation:

```typescript
import { HandlerDescription, HandlerFunc } from "@chainlink/ccip-read-server";

export class HelloHandler implements HandlerDescription {
  public readonly type: string = "hello";
  public readonly func: HandlerFunc;

  constructor() {
    this.func = async () => {
      const result = await this.hello();
      return [result];
    };
  }

  hello = async (): Promise<string> => {
    return "hello";
  };
}
```

#### Step 3: Add the `HelloHandler` to the Gateway

In your `app.ts` file, you need to add the `HelloHandler` to the gateway. This handler will process the off-chain requests and return the required data.

Here's an example of how to add the `HelloHandler`:

```typescript
import { HelloHandler } from "./handlers/helloService/helloService";
import helloServiceAbi from "./handlers/helloService/helloServiceAbi.json";

export function makeApp(signer: utils.SigningKey, basePath: string) {
  const server = new Server();
  
  const helloHandler = new HelloHandler();
  
  server.add(helloServiceAbi, [helloHandler]);

  return server.makeApp(basePath);
}
```

## Usage

1. Clone the repository.

2. Install dependencies using `npm install`.

3. Install Foundry by following the instructions at https://github.com/foundry-rs/foundry.

4. Run tests using `npm test`.
