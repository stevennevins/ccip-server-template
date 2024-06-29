import fs from "fs";
import path from "path";
const solc = require("solc");

async function compileContract(
  contractName: string,
  filePath: string
): Promise<any> {
  const contractPath = path.resolve(__dirname, filePath);
  const contractSource = fs.readFileSync(contractPath, "utf8");

  const input = {
    language: "Solidity",
    sources: {
      [contractName]: {
        content: contractSource,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    const errors = output.errors.filter(
      (error: any) => error.severity === "error"
    );
    if (errors.length > 0) {
      throw new Error(
        `Compilation errors:\n${errors
          .map((e: any) => e.formattedMessage)
          .join("\n")}`
      );
    }
  }

  return output;
}

export async function compileHelloContract(): Promise<any> {
  return compileContract(
    "HelloVerifier.sol",
    "../mockVerifiers/HelloVerifier.sol"
  );
}

export async function compileSignedHelloContract(): Promise<any> {
  return compileContract(
    "SignedHelloVerifier.sol",
    "../mockVerifiers/SignedHelloVerifier.sol"
  );
}

export async function compileSimpleBytecodeContract(): Promise<any> {
  return compileContract(
    "SimpleBytecode.sol",
    "../mockVerifiers/SimpleBytecode.sol"
  );
}
