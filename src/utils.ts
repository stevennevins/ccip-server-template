import { utils } from "ethers";
import fs from "fs";
import path from "path";
const solc = require("solc");

export const fromHumanAbi = (fragments: ReadonlyArray<string>) =>
  new utils.Interface(fragments).format(utils.FormatTypes.json);

export const getEnv = (label: string): string => {
  const value = process.env[label];
  if (value == undefined) {
    throw new Error(`Env variables missing: ${label}`);
  }
  return value;
};

export function compileContract(contractName: string, filePath: string): any {
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
