# Contributing to AlgoCoach

Thanks for your interest in contributing! 🎯

## Quick Start

```bash
git clone https://github.com/your-username/algocoach.git
cd algocoach
bun install
cp .env.example .env  # fill in your values
bun run db:push        # create tables
bun run dev            # start dev servers
```

## Development Workflow

1. **Fork** the repo and create a branch from `main`
   - Feature branches: `feat/description`
   - Bug fixes: `fix/description`
   - Chores: `chore/description`

2. **Make your changes** — keep them focused on a single concern

3. **Run checks** before committing:
   ```bash
   bun test              # all tests pass
   npx tsc --noEmit      # no type errors
   ```

4. **Commit** with a clear message:
   ```
   feat: add weekly progress bar to roadmap overview
   fix: prevent duplicate daily plan creation
   chore: update AI provider timeout to 180s
   ```

5. **Open a PR** against `main` with a description of what and why

## Code Style

- **No comments** in source code unless absolutely necessary (e.g., complex regex)
- Prefer existing patterns — if the codebase uses `useCallback`, follow that
- TypeScript strict mode is enabled — avoid `any` where possible
- Use `camelCase` for variables/functions, `PascalCase` for components/types
- Import paths use `@/` alias (e.g., `@/components/ui/Button`)

## Testing

- Tests live alongside the code they test (`*.test.ts`)
- Run `bun test` for the full suite
- Add tests for new features, especially `selectDailyProblems` and API error paths

## Pull Request Checklist

- [ ] Code compiles (`tsc --noEmit`)
- [ ] All tests pass (`bun test`)
- [ ] No new ESLint warnings
- [ ] PR description explains the motivation and approach
- [ ] For UI changes, include a screenshot if visual

## Questions?

Open a [discussion](https://github.com/your-username/algocoach/discussions) or file an issue.
