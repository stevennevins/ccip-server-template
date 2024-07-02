import dotenv from "dotenv";

dotenv.config();

export const getEnv = (label: string): string => {
  const value = process.env[label];
  if (value == undefined) {
    throw new Error(`Env variables missing: ${label}`);
  }
  return value;
};
