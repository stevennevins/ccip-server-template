import {
  SigningKey,
  solidityKeccak256,
  keccak256,
  joinSignature,
  defaultAbiCoder,
} from "ethers/lib/utils";
import { HandlerDescription, HandlerFunc } from "@chainlink/ccip-read-server";

const helloMessage: string = "hello";
const signaturePrefix: string = "0x1900";

export class SignedHelloHandler implements HandlerDescription {
  public readonly type: string = "signedHello";
  public readonly func: HandlerFunc;

  constructor(private readonly signer: SigningKey) {
    this.func = async () => {
      const { result, signature } = await this.getSignedHello();
      return [result, signature];
    };
  }

  getSignedHello = async (): Promise<{ result: string; signature: string }> => {
    const result = defaultAbiCoder.encode(["string"], [helloMessage]);

    const messageHash = solidityKeccak256(
      ["bytes", "bytes32"],
      [signaturePrefix, keccak256(result)]
    );

    const signedData = this.signer.signDigest(messageHash);
    const signature = joinSignature(signedData);

    return {
      result,
      signature,
    };
  };
}
