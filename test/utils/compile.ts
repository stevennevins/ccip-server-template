import { compileContract } from "../../src/utils";

export async function compileHelloContract(): Promise<any> {
  return compileContract(
    "HelloVerifier.sol",
    "../test/mockVerifiers/HelloVerifier.sol"
  );
}

export async function compileSignedHelloContract(): Promise<any> {
  return compileContract(
    "SignedHelloVerifier.sol",
    "../test/mockVerifiers/SignedHelloVerifier.sol"
  );
}
