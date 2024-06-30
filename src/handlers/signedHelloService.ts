import {
  SigningKey,
  solidityKeccak256,
  joinSignature,
  defaultAbiCoder,
  splitSignature,
} from "ethers/lib/utils";
import { HandlerDescription, HandlerFunc } from "@chainlink/ccip-read-server";

const helloMessage: string = "hello";

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

    const messageHash = solidityKeccak256(["bytes"], [result]);

    const signedData = this.signer.signDigest(messageHash);
    const { r, s, v } = splitSignature(signedData);
    const signature = joinSignature({ r, s, v });

    return {
      result,
      signature,
    };
  };
}
