import nextEnv from "@next/env";
import { validateEnvironment } from "../lib/validate-environment.mjs";

nextEnv.loadEnvConfig(process.cwd(), false);
try {
  validateEnvironment(process.env, true);
  console.log("Production environment configuration is valid. No service connections were made.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
