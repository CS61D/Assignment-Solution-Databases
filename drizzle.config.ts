import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./migrations",
  schema: "./src/schemas/schema.ts",
  dbCredentials: {
    url: "./db/database.sqlite",
  },
});
