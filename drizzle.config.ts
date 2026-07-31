// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import path from "path";

export default defineConfig({
    dialect: "sqlite",
    schema: "./lib/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: path.join(process.cwd(), "data", "sqlite.db"),
    },
    verbose: true,
    strict: true,
});