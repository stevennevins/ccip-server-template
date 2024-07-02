import { Server } from "@chainlink/ccip-read-server";
import { utils } from "ethers";
import { gatewayAbi } from "./config";
import { SignedHelloHandler, HelloHandler } from "./handlers";

export function makeApp(signer: utils.SigningKey, basePath: string) {
  const server = new Server();
  const handlers = [new SignedHelloHandler(signer), new HelloHandler()];
  server.add(gatewayAbi, handlers);

  return server.makeApp(basePath);
}
