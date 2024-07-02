import { utils } from "ethers";

export const fromHumanAbi = (fragments: ReadonlyArray<string>) =>
  new utils.Interface(fragments).format(utils.FormatTypes.json);
