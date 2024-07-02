import { makeApp } from "./app";
import { utils } from "ethers";
import { SERVER_PRIVATE_KEY, BASE_PATH, PORT } from "./config";

const signer = new utils.SigningKey(SERVER_PRIVATE_KEY);

const app = makeApp(signer, BASE_PATH);
app.listen(PORT);

console.log(`Listening to http://127.0.0.1:${PORT}/`);
