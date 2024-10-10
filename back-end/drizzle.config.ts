import type { Config } from "drizzle-kit"
import 'dotenv/config';

export default {
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL as any
  },
  schema: "src/db/schema/schema.ts",
  out: "drizzle",
  verbose: true
} satisfies Config
