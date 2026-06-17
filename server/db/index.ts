import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "./schema"
import { createTables } from "./setup"
import path from "path"
import fs from "fs"

function getDbPath(): string {
  const home = process.env.HOME || process.env.USERPROFILE || "."
  const dir = path.join(home, ".algocoach")
  fs.mkdirSync(dir, { recursive: true })
  return path.join(dir, "data.db")
}

function createDb() {
  const dbPath = getDbPath()
  const sqlite = new Database(dbPath)
  createTables(sqlite)
  return drizzle(sqlite, { schema })
}

let _db: ReturnType<typeof createDb> | null = null
export function getDb() {
  if (!_db) _db = createDb()
  return _db
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_, prop) {
    return getDb()[prop as keyof ReturnType<typeof createDb>]
  },
})
