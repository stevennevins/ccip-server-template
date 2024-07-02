# CCIP Server Template

## Overview

The Cross-Chain Interoperability Protocol (CCIP) is a standardized method for smart contracts to access off-chain data and services. This repository demonstrates a practical implementation of CCIP, showcasing how smart contracts can interact with off-chain data sources while maintaining the security and transparency of the blockchain.

## Writing a Handler for CCIP Read Server

Handlers are the core components of a CCIP server. They process off-chain requests and return the required data. Here's a step-by-step guide on how to write a handler:

### 1. Implement the Handler Class

Create a new file for your handler (e.g., `src/handlers/yourHandlerService.ts`) and implement a class that follows the `HandlerDescription` interface:

```typescript
import { HandlerDescription, HandlerFunc } from "@chainlink/ccip-read-server";

export class YourHandler implements HandlerDescription {
  public readonly type: string = "yourHandlerType";
  public readonly func: HandlerFunc;

  constructor() {
    this.func = async () => {
      const result = await this.yourMethod();
      return [result];
    };
  }

  yourMethod = async (): Promise<string> => {
    // Implement your logic here
    return "your result";
  };
}

### 2. Write the Verifier Contract

Create a Solidity contract that includes a function to trigger the off-chain lookup and a callback function to process the result. Below is an example of how to write a verifier contract:


```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourVerifier {
    error OffchainLookup(
        address sender,
        string[] urls,
        bytes callData,
        bytes4 callbackFunction,
        bytes extraData
    );

    function yourOffchainFunction() external view returns (string memory) {
        string[] memory urls = new string[](1);
        urls[0] = "http://localhost:8000/{sender}/{data}.json";
        bytes memory callData = abi.encodeWithSignature("yourMethod()");
        revert OffchainLookup(
            address(this),
            urls,
            callData,
            this.yourCallback.selector,
            ""
        );
    }

    function yourCallback(
        bytes calldata result,
        bytes calldata
    ) public pure returns (string memory) {
        return abi.decode(result, (string));
    }
}
```

### 3. Add the Handler to the Gateway

In your `src/app.ts` file, import your new handler and add it to the server:

```typescript
import { Server } from "@chainlink/ccip-read-server";
import { utils } from "ethers";
import { YourHandler } from "./handlers/yourHandlerService";
import { gatewayAbi } from "./config";

export function makeApp(signer: utils.SigningKey, basePath: string) {
  const server = new Server();
  const handlers = [new YourHandler()];
  server.add(gatewayAbi, handlers);
  return server.makeApp(basePath);
}
```

### 4. Update the Gateway ABI

Ensure that your `gatewayAbi` in `src/config/abi.ts` includes the interface for your new handler. You can update this by adding it to the IGateway interface like below:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGateway {
    function yourOffchainFunction() external view returns (string memory);
}
```

## Usage

1. Clone the repository.

2. Install dependencies using `npm install`.

3. Install Foundry by following the instructions at https://github.com/foundry-rs/foundry.

4. Run tests using `npm test`.
