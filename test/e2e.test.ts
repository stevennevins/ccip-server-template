import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { makeApp } from "../src/app";
import { utils } from "ethers";
import { getEnv } from "../src/utils";
import dotenv from "dotenv";
import { createTestClient, http, publicActions, walletActions } from "viem";
import { localhost } from "viem/chains";
import {
  compileSimpleBytecodeContract,
  compileHelloContract,
} from "./utils/compile";
import { spawn } from "child_process";

describe("E2E Tests with Local Ethereum Node", () => {
  let provider: JsonRpcProvider;
  let signer: ethers.Signer;
  let node: any;
  let ccipServer: any;
  let viemClient: any;

  beforeAll(async () => {
    dotenv.config();

    node = spawn("anvil", []);

    const PROVIDER_URL = "http://localhost:8545";
    provider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
    provider.on("debug", (info) => {
      if (info.action === "request") {
        console.log(`Requesting ${info.request.method}`);
      }
    });
    signer = provider.getSigner(0);

    const serverSigner = new utils.SigningKey(getEnv("SERVER_PRIVATE_KEY"));
    const basePath = "/";
    ccipServer = makeApp(serverSigner, basePath);
    await ccipServer.listen(8000);

    viemClient = createTestClient({
      chain: localhost,
      mode: "anvil",
      transport: http(),
    })
      .extend(publicActions)
      .extend(walletActions);
  });

  afterAll(async () => {
    node.kill();
  });

  describe("Setup Tests", () => {
    it("should create the app", () => {
      expect(ccipServer).toBeDefined();
      expect(ccipServer).toBeInstanceOf(Function);
    });

    it("should confirm the chain id and rpc url of the anvil node", async () => {
      const network = await provider.getNetwork();
      expect(network.chainId).toBe(31337);

      const rpcUrl = provider.connection.url;
      expect(rpcUrl).toBe("http://localhost:8545");
    });
  });

  describe("Hello Function Tests", () => {
    let helloVerifierContract: ethers.Contract;
    let helloVerifierContractAddress: string;
    let artifact: any;

    beforeAll(async () => {
      const helloVerifierArtifact = await compileHelloContract();
      const contractName = "HelloVerifier.sol";
      artifact = helloVerifierArtifact.contracts[contractName].HelloVerifier;
      const HelloVerifierFactory = new ethers.ContractFactory(
        artifact.abi,
        artifact.evm.bytecode.object,
        signer
      );
      helloVerifierContract = await HelloVerifierFactory.deploy();
      await helloVerifierContract.deployed();
      helloVerifierContractAddress = helloVerifierContract.address;
    });

    it("should have correct bytecode", async () => {
      const deployedBytecode = await provider.getCode(
        helloVerifierContractAddress
      );
      expect(deployedBytecode).toBe(
        "0x" + artifact.evm.deployedBytecode.object
      );
    });

    it("should deploy HelloVerifier contract", () => {
      expect(helloVerifierContractAddress).toBeTruthy();
    });

    it("should call the hello function of HelloVerifier contract using ethers and return 255", async () => {
      const result = await helloVerifierContract.hello();
      expect(result.toNumber()).toBe(255);
    });

    it("should call the helloOffchain function of HelloVerifier contract using ethers without throwing", async () => {
      const result = await helloVerifierContract.helloOffchain();
      expect(result).toBeDefined();
    });

    it("should have correct helloOffchain function selector", () => {
      const expectedSelector = ethers.utils.id("helloOffchain()").slice(0, 10);
      const actualSelector = artifact.evm.methodIdentifiers["helloOffchain()"];
      expect(actualSelector).toBe(expectedSelector.slice(2)); // Remove '0x' prefix
    });

    it("should call helloOffchain using a low level view call", async () => {
      const data = ethers.utils.id("helloOffchain()").slice(0, 10); // Function selector
      const tx = {
        to: helloVerifierContractAddress,
        data: data,
      };

      const result = await provider.call(tx, "latest");
      expect(result).toBeDefined();
    });

    it("should call helloOffchain using minimal interface", async () => {
      const minimalAbi = ["function helloOffchain() view returns (string)"];
      const contract = new ethers.Contract(
        helloVerifierContractAddress,
        minimalAbi,
        provider
      );
      const result = await contract.helloOffchain();
      expect(result).toBeDefined();
    });

    it("should call the hello function of HelloVerifier contract using viem and return 255", async () => {
      const result = await viemClient.readContract({
        address: helloVerifierContractAddress,
        abi: artifact.abi,
        functionName: "hello",
      });

      expect(result).toBe(255n);
    });

    it("should call the helloOffchain function of HelloVerifier contract using viem without throwing", async () => {
      const result = await viemClient.readContract({
        address: helloVerifierContractAddress,
        abi: artifact.abi,
        functionName: "helloOffchain",
      });

      expect(result).toBeDefined();
    });
  });

  describe("SimpleBytecode Contract Test", () => {
    let simpleBytecodeContract: ethers.Contract;
    let simpleBytecodeContractAddress: string;

    beforeAll(async () => {
      const simpleBytecodeArtifact = await compileSimpleBytecodeContract();
      const contractName = "SimpleBytecode.sol";
      const contract =
        simpleBytecodeArtifact.contracts[contractName].SimpleBytecode;
      const SimpleBytecodeFactory = new ethers.ContractFactory(
        contract.abi,
        contract.evm.bytecode.object,
        signer
      );
      simpleBytecodeContract = await SimpleBytecodeFactory.deploy();
      await simpleBytecodeContract.deployed();
      simpleBytecodeContractAddress = simpleBytecodeContract.address;
    });

    it("should deploy the SimpleBytecode contract", () => {
      expect(simpleBytecodeContractAddress).toBeTruthy();
    });

    it("should return 255 when called with viem", async () => {
      const result = await viemClient.readContract({
        address: simpleBytecodeContractAddress,
        abi: [
          {
            type: "function",
            name: "getValue",
            inputs: [],
            outputs: [{ type: "uint256" }],
            stateMutability: "view",
          },
        ],
        functionName: "getValue",
      });

      console.log("Result:", result);

      expect(result).toBe(255n);
    });

    it("should return 255 when called using ethers", async () => {
      const simpleBytecodeContractInterface = new ethers.utils.Interface([
        "function getValue() view returns (uint256)",
      ]);
      const contract = new ethers.Contract(
        simpleBytecodeContractAddress,
        simpleBytecodeContractInterface,
        provider
      );

      const result = await contract.getValue();

      expect(result.toNumber()).toBe(255);
    });
  });

  describe("Simple Contract Test", () => {
    let simpleContract: ethers.Contract;

    const simpleContractBytecode = "0x6960ff60005260206000f3600052600a6016f3";

    beforeAll(async () => {
      const factory = new ethers.ContractFactory(
        [],
        simpleContractBytecode,
        signer
      );
      simpleContract = await factory.deploy();
      await simpleContract.deployed();
    });

    it("should deploy the contract", async () => {
      expect(simpleContract.address).toBeTruthy();
    });

    it("should call the simple contract using viem", async () => {
      const result = await viemClient.call({
        to: simpleContract.address,
        data: "0x",
      });

      expect(result).toBeTruthy();
    });

    it("should call the simple contract using ethers", async () => {
      const result = await provider.call({
        to: simpleContract.address,
        data: "0x",
      });

      expect(result).toBeTruthy();
    });
  });
});
