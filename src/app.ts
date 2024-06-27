import { Server } from '@chainlink/ccip-read-server';
import { utils } from 'ethers';
import { fromHumanAbi } from './utils';
import { GetVersionHandler } from './handlers/versionService/versionService';
import versionServiceAbi from './handlers/versionService/versionServiceAbi.json';

const gatewayAbi = fromHumanAbi(versionServiceAbi);

export function makeApp(signer: utils.SigningKey, basePath: string) {
    const server = new Server();
    const handlers = [new GetVersionHandler(signer)];
    server.add(gatewayAbi, handlers);

    return server.makeApp(basePath);
}
