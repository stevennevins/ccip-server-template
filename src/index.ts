import dotenv from "dotenv";
import { makeApp } from "./app";
import { utils } from "ethers";
import { getEnv } from "./utils";

dotenv.config();

const signer = new utils.SigningKey(getEnv("SERVER_PRIVATE_KEY"));
const basePath = "/";
const port = process.env.PORT || 8000;

const app = makeApp(signer, basePath);
app.listen(port);

console.log(`Listening to http://127.0.0.1:${port}/`);
