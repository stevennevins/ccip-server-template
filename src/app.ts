import { Server } from "@chainlink/ccip-read-server";
import { utils } from "ethers";
import { compileContract } from "./utils";
import { SignedHelloHandler, HelloHandler } from "./handlers";

const compiledContract = compileContract(
  "IGateway",
  "../handlers/IGateway.sol"
);
const gatewayAbi = compiledContract.contracts["IGateway"]["IGateway"].abi;

export function makeApp(signer: utils.SigningKey, basePath: string) {
  const server = new Server();
  const handlers = [new SignedHelloHandler(signer), new HelloHandler()];
  server.add(gatewayAbi, handlers);

  return server.makeApp(basePath);
}
