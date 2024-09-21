// lib/turso.ts
import { createClient } from "@libsql/client";

const tursoDatabaseUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoDatabaseUrl || !tursoAuthToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined in the environment variables.");
}

const turso = createClient({
  url: tursoDatabaseUrl,
  authToken: tursoAuthToken,
});

export default turso;
