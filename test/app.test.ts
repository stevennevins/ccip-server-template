import { utils, ethers } from 'ethers';
import supertest from 'supertest';
import { makeApp } from '../src/app';
import versionServiceAbi from '../src/handlers/versionService/versionServiceAbi.json';

describe('CCIP Server', () => {
    const TEST_ADDR = '0x1234567890123456789012345678901234567890';
    const VERSION = '1.0.0';
    const SIGNATURE_PREFIX = '0x1900';

    let app: ReturnType<typeof makeApp>;
    let signer: utils.SigningKey;

    beforeAll(() => {
        signer = new utils.SigningKey(utils.randomBytes(32));
        app = makeApp(signer, '/');
    });

    const makeRequest = async (address: string, calldata: string) => {
        return await supertest(app).get(`/${address}/${calldata}.json`).send();
    };

    const recoverPublicKey = (messageHash: string, sigData: string) => {
        return utils.recoverPublicKey(messageHash, sigData);
    };

    describe('getVersion', () => {
        it('should return correct data and allow public key recovery', async () => {
            const getVersionIface = new ethers.utils.Interface(
                versionServiceAbi
            );
            const getVersionCalldata =
                getVersionIface.encodeFunctionData('getVersion');

            const response = await makeRequest(TEST_ADDR, getVersionCalldata);

            expect(response.status).toBe(200);

            const [result, sigData] = getVersionIface.decodeFunctionResult(
                'getVersion',
                response.body.data
            );

            const decodedVersion = ethers.utils.defaultAbiCoder.decode(
                ['string'],
                result
            )[0];
            expect(typeof decodedVersion).toBe('string');
            expect(decodedVersion).toBe(VERSION);

            const messageHash = utils.solidityKeccak256(
                ['bytes', 'bytes32'],
                [SIGNATURE_PREFIX, utils.keccak256(result)]
            );
            const recoveredPubKey = recoverPublicKey(messageHash, sigData);
            expect(recoveredPubKey).toBe(signer.publicKey);
        });
    });
});
