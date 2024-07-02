import dotenv from "dotenv";

dotenv.config();

export const getEnv = (label: string): string => {
  const value = process.env[label];
  if (value == undefined) {
    throw new Error(`Env variables missing: ${label}`);
  }
  return value;
};

export const SERVER_PRIVATE_KEY = getEnv("SERVER_PRIVATE_KEY");
export const BASE_PATH = "/";
export const PORT = 8000;
