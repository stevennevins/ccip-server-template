import { ethers } from 'ethers';
import { SigningKey } from 'ethers/lib/utils';
import { GetVersionHandler } from '../../src/handlers/versionService/versionService';

describe('GetVersionService', () => {
    let signer: SigningKey;
    let getVersionService: GetVersionHandler;

    beforeAll(() => {
        signer = new SigningKey(ethers.utils.randomBytes(32));
        getVersionService = new GetVersionHandler(signer);
    });

    it('should return the correct version', async () => {
        const { result } = await getVersionService.getVersion();
        const decodedVersion = ethers.utils.defaultAbiCoder.decode(
            ['string'],
            result
        )[0];
        expect(decodedVersion).toBe('1.0.0');
    });

    it('should return a valid signature', async () => {
        const { signature } = await getVersionService.getVersion();
        expect(signature).toHaveLength(132); // 0x + 130 characters
    });

    it('should allow public key recovery', async () => {
        const { result, signature } = await getVersionService.getVersion();
        const messageHash = ethers.utils.solidityKeccak256(
            ['bytes', 'bytes32'],
            ['0x1900', ethers.utils.keccak256(result)]
        );
        const recoveredPubKey = ethers.utils.recoverPublicKey(
            messageHash,
            signature
        );
        expect(recoveredPubKey).toBe(signer.publicKey);
    });

    it('should return different signatures for different signers', async () => {
        const anotherSigner = new SigningKey(ethers.utils.randomBytes(32));
        const anotherService = new GetVersionHandler(anotherSigner);

        const { signature: signature1 } = await getVersionService.getVersion();
        const { signature: signature2 } = await anotherService.getVersion();

        expect(signature1).not.toBe(signature2);
    });
});
