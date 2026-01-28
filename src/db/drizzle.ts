import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

// Next.js automatically loads .env files, no need for dotenv config
export const db = drizzle(process.env.DATABASE_URL!, { schema })
