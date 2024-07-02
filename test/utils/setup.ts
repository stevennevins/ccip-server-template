import { makeApp } from "../../src/app";
import { SERVER_PRIVATE_KEY, PORT } from "../../src/config";
import { utils } from "ethers";
import { Server } from "http";

let server: Server;

export async function startServer(): Promise<void> {
  const signer = new utils.SigningKey(SERVER_PRIVATE_KEY);
  const app = makeApp(signer, "/");
  return new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`Test server started on http://localhost:${PORT}`);
      resolve();
    });
  });
}

export async function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err: any) => {
        if (err) reject(err);
        else {
          console.log("Test server stopped");
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
