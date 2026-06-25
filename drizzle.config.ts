import { defineConfig } from 'drizzle-kit'
import { homedir } from 'os'
import { join } from 'path'

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: join(homedir(), '.algocoach', 'data.db'),
  },
})
