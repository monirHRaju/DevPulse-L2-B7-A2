import dotenv from "dotenv";

dotenv.config();

interface Env {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
}

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "PORT",
  "BCRYPT_ROUNDS",
] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`PORT must be a positive integer, got "${process.env.PORT}"`);
}

const rounds = Number(process.env.BCRYPT_ROUNDS);
if (!Number.isInteger(rounds) || rounds < 8 || rounds > 12) {
  throw new Error(
    `BCRYPT_ROUNDS must be an integer between 8 and 12, got "${process.env.BCRYPT_ROUNDS}"`
  );
}

export const env: Env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: port,
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
  BCRYPT_ROUNDS: rounds,
};
