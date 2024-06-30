# CCIP Server Template

## Overview

The Cross-Chain Interoperability Protocol (CCIP) is a standardized method for smart contracts to access off-chain data and services. It was introduced as part of Ethereum Improvement Proposal (EIP) 3668 to address the limitations of existing oracle solutions and provide a more flexible and secure way for smart contracts to interact with external data sources.

Key aspects of CCIP:

The core mechanism of CCIP involves a smart contract reverting with an `OffchainLookup` error when it needs external data. This error contains all the information needed for a client to fetch the data off-chain and submit it back to the contract for verification.

This repository demonstrates a practical implementation of CCIP, showcasing how smart contracts can interact with off-chain data sources while maintaining the security and transparency of the blockchain.


## Implementation Details

### Writing a Handler

Handlers are the core components of a CCIP server. They process off-chain requests and return the required data. Here's a general structure for writing a handler:

1. Implement the `HandlerDescription` interface.
2. Define a `type` property to identify the handler.
3. Implement a `func` property as an async function that processes the request and returns the result.

Example structure:

## Usage
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Run tests using `npm test`.