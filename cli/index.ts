#!/usr/bin/env bun
import path from "path"
import fs from "fs"

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || ".", ".algocoach")
const ENV_PATH = path.join(CONFIG_DIR, ".env")

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

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return
  const lines = fs.readFileSync(ENV_PATH, "utf-8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && val) process.env[key] = val
  }
}

function hasAnyKey(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.NVIDIA_API_KEY)
}

async function cmdInit() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })

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
  fs.mkdirSync(CONFIG_DIR, { recursive: true })

  if (!fs.existsSync(ENV_PATH)) {
    console.log("No config found. Creating one...")
    fs.writeFileSync(ENV_PATH, envTemplate())
    console.log(`Created ${ENV_PATH}`)
    console.log("Edit it with your API keys, then run 'algocoach start' again.\n")
    return
  }

  loadEnv()

  if (!hasAnyKey()) {
    console.error("No AI API key configured. Add at least one key to " + ENV_PATH)
    process.exit(1)
  }

  const preferredPort = parseInt(process.env.PORT || "3000", 10)

  process.env.LOCAL_DEV = "true"
  process.env.LOCAL_USER_ID = "local-user"
  process.env.BETTER_AUTH_SECRET = "local-dev-secret-min-32-chars-long-for-better-auth"
  process.env.BETTER_AUTH_URL = `http://localhost:${preferredPort}`
  process.env.CORS_ORIGIN = `http://localhost:${preferredPort}`

  const { serve } = await import("../server/index")
  const { port } = serve(preferredPort)

  const url = `http://localhost:${port}`

  console.log(`\n  AlgoCoach running at ${url}\n`)

  // Auto-open browser
  try {
    const openCmd = process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", url]
        : ["xdg-open", url]
    Bun.spawnSync(openCmd)
  } catch {}
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
  start   Create config if needed and start the server
  init    Create config file only

Config: ${ENV_PATH}
`)
}
