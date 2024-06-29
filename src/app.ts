import { Server } from "@chainlink/ccip-read-server";
import { utils } from "ethers";
import { fromHumanAbi } from "./utils";
import { SignedHelloHandler } from "./handlers/signedHelloService/signedHelloService";
import signedHelloAbi from "./handlers/signedHelloService/signedHelloAbi.json";
import { HelloHandler } from "./handlers/helloService/helloService";
import helloServiceAbi from "./handlers/helloService/helloServiceAbi.json";

const gatewayAbi = fromHumanAbi([...signedHelloAbi, ...helloServiceAbi]);

export function makeApp(signer: utils.SigningKey, basePath: string) {
  const server = new Server();
  const handlers = [new SignedHelloHandler(signer), new HelloHandler()];
  server.add(gatewayAbi, handlers);

  return server.makeApp(basePath);
}
