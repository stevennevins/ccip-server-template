import { ethers } from "ethers";
import {
  compileHelloContract,
  compileSignedHelloContract,
} from "./utils/compile";
describe("compileHelloContract", () => {
  it("should compile the HelloVerifier contract", async () => {
    const compiledContract = await compileHelloContract();

    expect(compiledContract).toBeDefined();
    expect(compiledContract.contracts).toBeDefined();

    const contractName = "HelloVerifier.sol";
    const contract = compiledContract.contracts[contractName].HelloVerifier;

    expect(contract).toBeDefined();
    expect(contract.evm.bytecode.object.length).toBeGreaterThan(0);

    const abi = new ethers.utils.Interface(contract.abi);
    console.log("ABI:", contract.abi);
    expect(abi.functions).toHaveProperty("hello()");
    expect(abi.functions).toHaveProperty("helloOffchain()");
    expect(abi.functions).toHaveProperty("helloCallback(bytes,bytes)");
    const helloOffchainFunction = contract.abi.find(
      (item: any) => item.type === "function" && item.name === "helloOffchain"
    );
    expect(helloOffchainFunction).toBeDefined();
    expect(helloOffchainFunction.stateMutability).toBe("view");
    expect(helloOffchainFunction.inputs).toHaveLength(0);
    expect(helloOffchainFunction.outputs).toHaveLength(1);
    expect(helloOffchainFunction.outputs[0].type).toBe("string");
  });
});

describe("compileSignedHelloContract", () => {
  it("should compile the SignedHelloVerifier contract", async () => {
    const compiledContract = await compileSignedHelloContract();

    expect(compiledContract).toBeDefined();
    expect(compiledContract.contracts).toBeDefined();

    const contractName = "SignedHelloVerifier.sol";
    const contract =
      compiledContract.contracts[contractName].SignedHelloVerifier;

    expect(contract).toBeDefined();
    expect(contract.evm.bytecode.object.length).toBeGreaterThan(0);

    const abi = new ethers.utils.Interface(contract.abi);
    expect(abi.functions).toHaveProperty("signedHello()");
    expect(abi.functions).toHaveProperty("signedHelloCallback(bytes,bytes)");
    expect(abi.functions).toHaveProperty("signer()");
  });
});
