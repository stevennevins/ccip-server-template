import { compileContract } from "../utils/compile";

const compiledGatewayContract = compileContract(
  "IGateway",
  "../contracts/IGateway.sol"
);

const gatewayAbi =
  compiledGatewayContract.contracts["IGateway"]["IGateway"].abi;

export { gatewayAbi };
