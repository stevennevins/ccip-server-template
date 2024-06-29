import { ethers } from "ethers";
import { SigningKey } from "ethers/lib/utils";
import { SignedHelloHandler } from "../../src/handlers/signedHelloService/signedHelloService";

describe("SignedHelloService", () => {
  let signer: SigningKey;
  let signedHelloService: SignedHelloHandler;

  beforeAll(() => {
    signer = new SigningKey(ethers.utils.randomBytes(32));
    signedHelloService = new SignedHelloHandler(signer);
  });

  it("should return the correct hello message", async () => {
    const { result } = await signedHelloService.getSignedHello();
    const decodedMessage = ethers.utils.defaultAbiCoder.decode(
      ["string"],
      result
    )[0];
    expect(decodedMessage).toBe("hello");
  });

  it("should return a valid signature", async () => {
    const { signature } = await signedHelloService.getSignedHello();
    expect(signature).toHaveLength(132); // 0x + 130 characters
  });

  it("should allow public key recovery", async () => {
    const { result, signature } = await signedHelloService.getSignedHello();
    const messageHash = ethers.utils.solidityKeccak256(
      ["bytes", "bytes32"],
      ["0x1900", ethers.utils.keccak256(result)]
    );
    const recoveredPubKey = ethers.utils.recoverPublicKey(
      messageHash,
      signature
    );
    expect(recoveredPubKey).toBe(signer.publicKey);
  });

  it("should return different signatures for different signers", async () => {
    const anotherSigner = new SigningKey(ethers.utils.randomBytes(32));
    const anotherService = new SignedHelloHandler(anotherSigner);

    const { signature: signature1 } = await signedHelloService.getSignedHello();
    const { signature: signature2 } = await anotherService.getSignedHello();

    expect(signature1).not.toBe(signature2);
  });
});
