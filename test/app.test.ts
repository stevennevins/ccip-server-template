import { utils, ethers } from "ethers";
import supertest from "supertest";
import { makeApp } from "../src/app";
import { compileContract } from "../src/utils";

const compiledContract = compileContract(
  "IGateway",
  "../src/handlers/IGateway.sol"
);
const gatewayAbi = compiledContract.contracts["IGateway"]["IGateway"].abi;

describe("CCIP Server", () => {
  const TEST_ADDR = "0x1234567890123456789012345678901234567890";
  const HELLO_MESSAGE = "hello";

  let app: ReturnType<typeof makeApp>;
  let signer: utils.SigningKey;

  beforeAll(() => {
    signer = new utils.SigningKey(utils.randomBytes(32));
    app = makeApp(signer, "/");
  });

  const makeRequest = async (address: string, calldata: string) => {
    return await supertest(app).get(`/${address}/${calldata}.json`).send();
  };

  const recoverPublicKey = (messageHash: string, sigData: string) => {
    return utils.recoverPublicKey(messageHash, sigData);
  };

  describe("signedHello", () => {
    it("should return correct data and allow public key recovery", async () => {
      const signedHelloIface = new ethers.utils.Interface(gatewayAbi);
      const signedHelloCalldata =
        signedHelloIface.encodeFunctionData("signedHello");

      const response = await makeRequest(TEST_ADDR, signedHelloCalldata);

      expect(response.status).toBe(200);

      const [result, signature] = signedHelloIface.decodeFunctionResult(
        "signedHello",
        response.body.data
      );

      const decodedMessage = ethers.utils.defaultAbiCoder.decode(
        ["string"],
        result
      )[0];
      expect(typeof decodedMessage).toBe("string");
      expect(decodedMessage).toBe(HELLO_MESSAGE);

      const messageHash = utils.solidityKeccak256(["bytes"], [result]);
      const recoveredPubKey = recoverPublicKey(messageHash, signature);
      expect(recoveredPubKey).toBe(signer.publicKey);
    });
  });

  describe("hello", () => {
    it("should return the correct greeting", async () => {
      const helloIface = new ethers.utils.Interface(gatewayAbi);
      const helloCalldata = helloIface.encodeFunctionData("hello");

      const response = await makeRequest(TEST_ADDR, helloCalldata);

      expect(response.status).toBe(200);

      const [result] = helloIface.decodeFunctionResult(
        "hello",
        response.body.data
      );

      expect(result).toBe("hello");
    });

    it("should return a string", async () => {
      const helloIface = new ethers.utils.Interface(gatewayAbi);
      const helloCalldata = helloIface.encodeFunctionData("hello");

      const response = await makeRequest(TEST_ADDR, helloCalldata);

      expect(response.status).toBe(200);

      const [result] = helloIface.decodeFunctionResult(
        "hello",
        response.body.data
      );

      expect(typeof result).toBe("string");
    });
  });
});
