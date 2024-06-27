import { utils } from 'ethers';

export const fromHumanAbi = (fragments: ReadonlyArray<string>) =>
    new utils.Interface(fragments).format(utils.FormatTypes.json);

export const getEnv = (label: string): string => {
    const value = process.env[label];
    if (value == undefined) {
        throw new Error(`Env variables missing: ${label}`);
    }
    return value;
};
