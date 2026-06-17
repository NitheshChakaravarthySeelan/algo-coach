#!/usr/bin/env bun
import path from "path"
import fs from "fs"

const ENV_PATH = path.resolve(".env")

function envTemplate() {
  return [
    "# AlgoCoach Configuration",
    "# Uncomment and fill in at least one AI provider API key.",
    "",
    "# AI provider: google, groq, or nvidia",
    "AI_PROVIDER=google",
    "",
    "# API keys (get from https://aistudio.google.com, https://console.groq.com, https://build.nvidia.com)",
    "# GEMINI_API_KEY=your-key-here",
    "# GROQ_API_KEY=your-key-here",
    "# NVIDIA_API_KEY=your-key-here",
    "",
    "# Optional overrides",
    "# AI_MODEL=",
    "# PORT=3000",
  ].join("\n") + "\n"
}

function hasAnyKey(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.NVIDIA_API_KEY)
}

async function cmdInit() {
  if (!fs.existsSync(ENV_PATH)) {
    fs.writeFileSync(ENV_PATH, envTemplate())
    console.log(`Created ${ENV_PATH}`)
  } else {
    console.log(`${ENV_PATH} already exists`)
  }

  console.log(`
Edit .env to set at least one AI provider API key.
You can get API keys from:
  - Google Gemini: https://aistudio.google.com
  - Groq: https://console.groq.com
  - NVIDIA NIM: https://build.nvidia.com

Then run: algocoach start
`)
}

async function cmdStart() {
  if (!fs.existsSync(ENV_PATH)) {
    console.log("No .env found. Creating one...")
    fs.writeFileSync(ENV_PATH, envTemplate())
    console.log(`Created ${ENV_PATH}`)
    console.log("Edit it with your API keys, then run 'algocoach start' again.\n")
    return
  }

  if (!hasAnyKey()) {
    console.error("No AI API key configured in .env. Add at least one key and try again.")
    process.exit(1)
  }

  const port = parseInt(process.env.PORT || "3000", 10)

  process.env.LOCAL_DEV = "true"
  process.env.LOCAL_USER_ID = "local-user"
  process.env.BETTER_AUTH_URL = `http://localhost:${port}`
  process.env.BETTER_AUTH_SECRET = "local-dev-secret-min-32-chars-long-for-better-auth"
  process.env.CORS_ORIGIN = `http://localhost:${port}`

  const { serve } = await import("../server/index")
  serve(port)

  console.log(`\n  AlgoCoach running at http://localhost:${port}\n`)
}

const cmd = process.argv[2] || "start"

switch (cmd) {
  case "init":
    await cmdInit()
    break
  case "start":
  case "serve":
    await cmdStart()
    break
  default:
    console.log(`
Usage: algocoach <command>

Commands:
  start   Create .env if needed and start the server
  init    Create .env in current directory

Run 'algocoach start' to get started.
`)
}
