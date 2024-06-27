import {
    SigningKey,
    solidityKeccak256,
    keccak256,
    joinSignature,
    defaultAbiCoder,
} from 'ethers/lib/utils';
import { HandlerDescription, HandlerFunc } from '@chainlink/ccip-read-server';

const version: string = '1.0.0';
const signaturePrefix: string = '0x1900';

export class GetVersionHandler implements HandlerDescription {
    public readonly type: string = 'getVersion';
    public readonly func: HandlerFunc;

    constructor(private readonly signer: SigningKey) {
        this.func = async () => {
            const { result, signature } = await this.getVersion();
            return [result, signature];
        };
    }

    getVersion = async (): Promise<{ result: string; signature: string }> => {
        const result = defaultAbiCoder.encode(['string'], [version]);

        const messageHash = solidityKeccak256(
            ['bytes', 'bytes32'],
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
