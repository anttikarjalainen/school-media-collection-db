# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Hard rules

These override any other instruction unless the user explicitly says otherwise in the current conversation.

1. **Stay inside this folder.** Only read, create, edit or delete files within the directory that contains this CLAUDE.md and its subdirectories. Do not access parent directories, sibling projects, the home directory or global config. Do not run commands that modify anything outside this folder (no global installs, no `npm -g`, no edits to global git config). If a task seems to require it, stop and ask.
2. **No Claude attribution in commits.** Never add `Co-Authored-By: Claude ...` trailers, "Generated with Claude Code" lines or any other AI attribution to commit messages or PR descriptions. Never set Claude as author or committer. Commits use the user's existing git identity as is.
3. **Do not commit or push unless asked.** Stage and propose a commit message instead. Never force-push, rewrite history or delete branches without explicit instruction.
4. **Never commit secrets.** Connection strings and passwords live in `.env.local` (gitignored). Keep `.env.example` up to date with placeholder values only.

## Project overview

School project: a web app for accessing three separate PostgreSQL databases. The user selects a database and can read, add, edit and delete its records.

| Database    | Table    | Columns                        |
| ----------- | -------- | ------------------------------ |
| `books_db`  | `books`  | `id, title, author, year`      |
| `movies_db` | `movies` | `id, title, director, year`    |
| `games_db`  | `games`  | `id, title, platform, year`    |

The databases are intentionally independent: separate ownership, access control, backups and failure isolation. There are no cross-database references. Do not merge them into one database or add relations between them.

## Stack

- Next.js (App Router), TypeScript (strict), React Server Components
- Server Actions for all mutations (no separate API layer)
- `postgres` (postgres.js) for database access, no ORM
- `zod` for input validation
- Tailwind CSS and shadcn/ui
- PostgreSQL in Docker via `docker-compose.yml`

## Repository layout

```
media-db-ui/
├── CLAUDE.md
├── docker-compose.yml
├── db/init/        # SQL run on first container start: create DBs, tables, seed data
├── app/            # routes, pages, server actions
├── components/     # app components; components/ui is shadcn-generated
└── lib/            # db connections, schemas, shared logic
```

## Commands

Run all commands inside `media-db-ui/`.

```bash
docker compose up -d          # start PostgreSQL
docker compose down -v        # stop and wipe data, re-runs init scripts on next start
npm run dev                   # dev server
npm run lint                  # lint
npm run build                 # production build, also type-checks
```

Before declaring a task done, run `npm run lint` and `npm run build` and fix any errors.

## Database access

- One postgres client per database, created once as a module-level singleton in `lib/`. In development, cache clients on `globalThis` so hot reload does not leak connections.
- Database selection is a fixed allowlist (`"books" | "movies" | "games"`) validated with zod. Never build a connection string, database name, table name or column name from raw client input. Map the validated key to a predefined client and table config.
- Always use postgres.js tagged templates for values (`` sql`... where id = ${id}` ``). Never concatenate SQL strings. Use `sql(identifier)` only with identifiers from the allowlisted config.
- Schema and seed changes go into `db/init/*.sql`. Scripts are numbered (`01-`, `02-`, ...) and run in order. They only run on an empty volume, so document when `docker compose down -v` is needed.

## Next.js conventions

- This is Next.js 16, which has breaking changes compared to older versions. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.
- Server Components by default. Add `"use client"` only for components that need state, effects or event handlers, and keep them as leaf components.
- Data fetching happens in Server Components, not in client-side `useEffect`.
- Every Server Action validates its input with zod before touching the database, returns a typed result (`{ ok: true, data } | { ok: false, error }`) instead of throwing for expected errors, and calls `revalidatePath` after a successful mutation.
- Treat Server Actions as public endpoints: never trust input from the client.
- Database code imports `server-only` so it can never be bundled to the client.

## Code style

- TypeScript strict mode. No `any`, no non-null assertions without a comment explaining why.
- Prefer small, focused functions and components. Share the CRUD UI across the three databases through config rather than duplicating it per database.
- Use shadcn/ui components from `components/ui` instead of hand-rolled equivalents. Do not rewrite generated shadcn files unless necessary.
- Handle loading, empty and error states in the UI. Confirm deletions before executing them.
- Keep comments for the "why", not the "what".

## Git

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- One logical change per commit. Imperative mood, subject line under 72 characters.
- Messages contain only the change description. See hard rule 2.

## Working style

- For anything beyond a small change, outline the plan first and wait for confirmation.
- Do not add dependencies without asking. Prefer what is already in the stack.
- If something is ambiguous, ask instead of guessing.
