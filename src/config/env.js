import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

const loadDotEnv = () => {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });

  if (process.env.NODE_ENV) {
    const envFile = path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`);
    dotenv.config({ path: envFile, override: true });
  }
};

loadDotEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8).optional(),
  JWT_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

const parsedEnv = envSchema.parse(process.env);

const defaultJwtSecret = "dev-secret-change-this";
const jwtSecret = parsedEnv.JWT_SECRET ?? defaultJwtSecret;

if (parsedEnv.NODE_ENV === "production" && jwtSecret === defaultJwtSecret) {
  throw new Error("JWT_SECRET must be set in production environments");
}

export const env = {
  ...parsedEnv,
  JWT_SECRET: jwtSecret,
};
