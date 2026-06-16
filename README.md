# AlgoCoach

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-1.2%2B-%23f9f9f9?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Connect your LeetCode profile, get a personalized roadmap, and solve problems daily — without the "what should I do next?" paralysis.**

AlgoCoach is an AI-powered LeetCode companion that generates a custom study roadmap based on your experience, goals, and weak topics. Every day it picks 3 problems tailored to your current week's topic — no more decision fatigue.

---

## Features

- **Personalized Roadmap** — AI generates a 4–12 week study plan from your preferences (experience, goals, weak topics, available hours)
- **Daily Problem Selection** — 3 problems every morning, pulled from LeetCode, filtered by your current roadmap week and difficulty preference
- **Streak Tracking** — Consecutive days with at least one solved problem keep you accountable
- **Weekly Progress** — See exactly how many problems you've solved vs assigned per roadmap week
- **Smart Regeneration** — Stuck on a problem? Replace it with an easier one ("I'm stuck") or swap individual slots
- **Duplicate Prevention** — No problem appears more than 3 times across your daily plans
- **LeetCode Sync** — Stats auto-refresh hourly from your LeetCode profile
- **Light / Dark Theme** — Full theme toggle with persistent preference
- **OAuth** — Sign in with GitHub or Google (Better Auth)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Tailwind CSS 3, Framer Motion, Recharts |
| Backend | Hono 4, Bun, Zod v4 |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Better Auth 1.6 (GitHub + Google OAuth) |
| AI | Google Gemini or Groq (pluggable via env var) |
| Deployment | Netlify Functions v2 |
| LeetCode API | Public GraphQL (no key required) |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.2+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- API keys for your chosen AI provider (Google Gemini or Groq)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/algocoach.git
cd algocoach

# Install dependencies
bun install

# Copy env vars and fill them in
cp .env.example .env
```

Edit `.env` with your values — at minimum:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random string, 32+ chars |
| `BETTER_AUTH_URL` | `http://localhost:3000` in dev |
| `GEMINI_API_KEY` | From [aistudio.google.com](https://aistudio.google.com) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials |

### Database

```bash
# Generate migration
bun run db:generate

# Apply to Neon
bun run db:migrate
```

### Run

```bash
# Start both frontend (Vite :5173) and backend (Bun :3000)
bun run dev
```

Open http://localhost:5173 — sign in with GitHub/Google, link your LeetCode username, and generate your roadmap.

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────┐
│  React SPA   │────▶│  Hono API        │────▶│  Neon       │
│  (Vite)      │     │  (Bun / Netlify) │     │  PostgreSQL │
│  :5173       │◀────│  :3000           │◀────│             │
└──────────────┘     └────────┬─────────┘     └─────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  AI Provider     │
                     │  (Google / Groq) │
                     └──────────────────┘
```

### Project Structure

```
algocoach/
├── server/                    # Backend (Hono)
│   ├── routes/                # API route handlers
│   │   ├── leetcode.ts        #  /api/leetcode/*
│   │   ├── plan.ts            #  /api/plan/*
│   │   ├── onboard.ts         #  /api/onboard/*
│   │   └── survey.ts          #  /api/survey/*
│   ├── services/              # Business logic
│   │   ├── ai.ts              #  Daily problem selection
│   │   ├── ai-provider.ts     #  AI provider abstraction
│   │   ├── leetcode.ts        #  LeetCode GraphQL client
│   │   └── leetcode-search.ts #  Problem search
│   ├── db/                    # Drizzle schema + client
│   ├── lib/                   # Validation, email, etc.
│   ├── middleware/            # Auth + rate limiting
│   └── index.ts               # App entry
├── src/                       # Frontend (React)
│   ├── pages/                 # Route pages
│   ├── components/            # UI components
│   │   ├── dashboard/         #  Dashboard widgets
│   │   ├── landing/           #  Landing page sections
│   │   ├── ui/                #  Reusable primitives
│   │   └── admin/             #  Admin dashboard
│   ├── lib/                   # API client, auth, theme
│   └── index.css              # Tailwind + theme vars
├── netlify/                   # Netlify function wrapper
├── .env.example               # Environment template
└── netlify.toml               # Netlify config
```

### Key Design Decisions

- **Daily problems are deterministic** (no AI) — sorted by AC rate, bucketed by difficulty, topic-diverse. Only the roadmap uses AI.
- **AI provider is pluggable** — set `AI_PROVIDER=google` or `AI_PROVIDER=groq`. Add new providers by implementing the `AIProvider` interface.
- **Light theme uses inverted CSS variables** — `surface-950` = white in light mode, so existing `bg-surface-950` classes render correctly without component changes.
- **SSE streaming** — roadmap generation streams tokens in real-time via Server-Sent Events for a smooth UX.

---

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start frontend + backend concurrently |
| `bun run dev:client` | Start Vite only |
| `bun run dev:server` | Start Hono backend only |
| `bun run build` | TypeScript check + Vite build |
| `bun test` | Run test suite (31 tests) |
| `bun run test:watch` | Tests in watch mode |
| `bun run db:generate` | Generate Drizzle migration |
| `bun run db:migrate` | Apply migrations to Neon |
| `bun run db:push` | Push schema directly (dev only) |

---

## Environment Variables

See [.env.example](.env.example) for the full list with descriptions.

Key variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | — | Auth secret (32+ random chars) |
| `BETTER_AUTH_URL` | ✅ | — | Your deployment URL |
| `GEMINI_API_KEY` | ⚠️ (gemini) | — | Google AI Studio API key |
| `GROQ_API_KEY` | ⚠️ (groq) | — | Groq API key |
| `AI_PROVIDER` | ❌ | `google` | `google` or `groq` |
| `AI_MODEL` | ❌ | provider default | Override the AI model |
| `LOCAL_DEV` | ❌ | `false` | Set `true` to bypass auth locally |
| `GITHUB_CLIENT_ID` | ⚠️ | — | GitHub OAuth app ID |
| `GOOGLE_CLIENT_ID` | ⚠️ | — | Google OAuth client ID |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines. In short:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing`)
3. Commit with clear messages
4. Open a PR

All PRs must pass `bun test` and `tsc --noEmit`.

---

## License

[MIT](LICENSE) © 2025 AlgoCoach
