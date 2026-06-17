#!/usr/bin/env bun
import path from "path"
import fs from "fs"

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || ".", ".leetcode-tracker")
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json")

interface Config {
  aiProvider: string
  aiModel: string
  geminiApiKey: string
  groqApiKey: string
  nvidiaApiKey: string
  port: number
}

function defaultConfig(): Config {
  return {
    aiProvider: "google",
    aiModel: "",
    geminiApiKey: "",
    groqApiKey: "",
    nvidiaApiKey: "",
    port: 3000,
  }
}

function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return { ...defaultConfig(), ...JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) }
    }
  } catch { }
  return defaultConfig()
}

function saveConfig(config: Config) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}

async function cmdInit() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })

  if (!fs.existsSync(CONFIG_PATH)) {
    saveConfig(defaultConfig())
  }

  console.log(`
LeetCode Tracker - Configuration
================================

Configuration directory: ${CONFIG_DIR}
Config file: ${CONFIG_PATH}

Please edit the config file and set at least one AI provider API key.
You can get API keys from:
  - Google Gemini: https://aistudio.google.com
  - Groq: https://console.groq.com
  - NVIDIA NIM: https://build.nvidia.com

Then run: leetcode-tracker serve
`)
}

async function cmdServe() {
  const config = loadConfig()

  const hasKey = config.geminiApiKey || config.groqApiKey || config.nvidiaApiKey
  if (!hasKey) {
    console.error("No AI API key configured. Run 'leetcode-tracker init' first.")
    process.exit(1)
  }

  const envVars: Record<string, string> = {
    LOCAL_DEV: "true",
    LOCAL_USER_ID: "local-user",
    AI_PROVIDER: config.aiProvider,
    AI_MODEL: config.aiModel,
    GEMINI_API_KEY: config.geminiApiKey,
    GROQ_API_KEY: config.groqApiKey,
    NVIDIA_API_KEY: config.nvidiaApiKey,
    PORT: String(config.port),
    BETTER_AUTH_URL: `http://localhost:${config.port}`,
    BETTER_AUTH_SECRET: "local-dev-secret-min-32-chars-long-for-better-auth",
    CORS_ORIGIN: `http://localhost:${config.port}`,
  }

  for (const [key, val] of Object.entries(envVars)) {
    process.env[key] = val
  }

  const { serve } = await import("../server/index")
  serve(config.port)

  console.log(`\n  LeetCode Tracker running at http://localhost:${config.port}\n`)
}

const cmd = process.argv[2] || "serve"

switch (cmd) {
  case "init":
    await cmdInit()
    break
  case "serve":
    await cmdServe()
    break
  default:
    console.log(`
Usage: leetcode-tracker <command>

Commands:
  init    Create configuration and initialize database
  serve   Start the LeetCode Tracker server
  help    Show this help message
`)
}
