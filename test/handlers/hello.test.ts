import { HelloHandler } from "../../src/handlers/helloService";

describe("HelloService", () => {
  let helloService: HelloHandler;

  beforeAll(() => {
    helloService = new HelloHandler();
  });

  it("should return the correct greeting", async () => {
    const result = await helloService.hello();
    expect(result).toBe("hello");
  });

  it("should return a string", async () => {
    const result = await helloService.hello();
    expect(typeof result).toBe("string");
  });
});
