# AlgoCoach

AI-powered LeetCode study planner that creates personalized roadmaps, daily problem sets, and tracks your progress.

## Prerequisites

- [Bun](https://bun.sh) >= 1.3
- An AI provider API key (Google Gemini, Groq, or NVIDIA NIM)

## Quick Start

```bash
# Install globally
npm install -g algocoach

# Start (creates .env if missing)
algocoach start

# Open http://localhost:3000
```

## Setup

1. Run `algocoach start` — creates `.env` in the current directory
2. Edit `.env` — uncomment and set at least one API key:

```env
AI_PROVIDER=google
GEMINI_API_KEY=your-key-here
```

3. Run `algocoach start` again — starts the server

### Get an API Key

| Provider | Get Key |
|----------|---------|
| Google Gemini | https://aistudio.google.com |
| Groq | https://console.groq.com |
| NVIDIA NIM | https://build.nvidia.com |

## Usage

1. **Onboard** — Tell AlgoCoach your skill level, goals, and weak topics
2. **Link LeetCode** — Enter your LeetCode username to auto-sync stats
3. **Generate Roadmap** — AI creates a personalized multi-week study plan
4. **Daily Plan** — Get 3 curated problems (Easy + Medium + Hard) each day
5. **Track Progress** — Mark problems solved/tried/skipped, view streaks

### Commands

| Command | Description |
|---------|-------------|
| `algocoach start` | Create .env if missing and start server (default) |
| `algocoach init` | Create .env only |
| `algocoach serve` | Start server (alias for `start`) |

## Development

```bash
git clone https://github.com/yourusername/algocoach
cd algocoach
bun install
bun run build       # Build frontend
bun run dev         # Dev mode with hot reload (Vite :5173 + server :3000)
bun test            # Run tests
```

## Architecture

```
cli/index.ts        — CLI entry point (algocoach start/serve/init)
server/
  index.ts          — Hono HTTP server, static file serving
  db/
    schema.ts       — Drizzle SQLite schema (11 tables)
    setup.ts        — CREATE TABLE SQL
    index.ts        — bun:sqlite connection at ~/.algocoach/data.db
  auth/index.ts     — Better Auth with local-dev bypass
  routes/           — API route handlers (plan, leetcode, onboard, survey)
  services/
    ai.ts           — AI provider wrapper + roadmap/daily-plan generation
    ai-provider.ts  — Google, Groq, NVIDIA provider implementations
    leetcode-search.ts — LeetCode GraphQL search
src/                — React frontend (Vite + Tailwind)
```

## Data

- **Database**: `~/.algocoach/data.db` — SQLite, created on first use
- **Config**: `.env` in the working directory

## AI Providers

AlgoCoach supports three AI backends for roadmap generation and daily plan selection:

- **Google Gemini** (default) — uses `@google/genai` SDK
- **Groq** — uses `groq-sdk` for fast inference
- **NVIDIA NIM** — uses `openai` SDK with NVIDIA's OpenAI-compatible API

Set `AI_PROVIDER=groq` or `AI_PROVIDER=nvidia` in `.env` to switch.
