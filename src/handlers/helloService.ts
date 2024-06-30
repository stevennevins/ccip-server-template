import { HandlerDescription, HandlerFunc } from "@chainlink/ccip-read-server";

export class HelloHandler implements HandlerDescription {
  public readonly type: string = "hello";
  public readonly func: HandlerFunc;

  constructor() {
    this.func = async () => {
      const result = await this.hello();
      return [result];
    };
  }

  hello = async (): Promise<string> => {
    return "hello";
  };
}
