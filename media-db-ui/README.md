# Media Collections

A web app for browsing and editing three separate PostgreSQL databases: **books**, **movies** and **games**. Pick a database from the tabs, then search, sort and page through its records, and add, edit or delete them.

| Database    | Table    | Columns                     | Dummy rows |
| ----------- | -------- | --------------------------- | ---------- |
| `books_db`  | `books`  | `id, title, author, year`   | 20         |
| `movies_db` | `movies` | `id, title, director, year` | 8          |
| `games_db`  | `games`  | `id, title, platform, year` | 7          |

## How the three databases are kept separate

- Each collection is its own PostgreSQL **database**, not just a table or schema.
- Each database is owned by its own login role (`books_owner`, `movies_owner`, `games_owner`). `CONNECT` is revoked from everyone else, so the books role cannot even open `movies_db`.
- The app holds one connection pool per database, configured with its own URL. If one database is unreachable, only its tab shows an error; the other two keep working.

## Tech

Next.js 16 (App Router, Server Components, Server Actions), TypeScript, Tailwind CSS v4, [postgres.js](https://github.com/porsager/postgres) and zod. All SQL uses parameterised tagged templates. Table and column names come from a fixed allowlist, never from user input.

## Running it locally (Windows)

1. **Install PostgreSQL.** Download the Windows installer (PostgreSQL 17) from <https://www.postgresql.org/download/windows/> and run it:
   - Keep the default components (PostgreSQL Server, pgAdmin, Command Line Tools). Stack Builder isn't needed.
   - Set a password for the `postgres` superuser and remember it. You'll need it in step 3.
   - Keep the default port `5432` and the default locale.
   - When it finishes, PostgreSQL runs as a Windows service and starts automatically. To check it, open **Services** and look for `postgresql-x64-17` with status *Running*.

   Step-by-step guide with screenshots: <https://www.enterprisedb.com/docs/supported-open-source/postgresql/installing/windows/>. On macOS or Linux, see <https://www.postgresql.org/download/>.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure connections.** Copy `.env.example` to `.env.local`. Put your `postgres` password in `ADMIN_DATABASE_URL`, and choose passwords for the three owner roles in the other URLs. The setup script creates those roles with exactly those passwords.
4. **Create and seed the databases:**
   ```bash
   npm run db:setup
   ```
   This drops and recreates `books_db`, `movies_db` and `games_db`, so re-run it any time you want fresh dummy data.
5. **Start the app:**
   ```bash
   npm run dev
   ```
   Open <http://localhost:3000>.

## Project structure

```
db/setup.mjs        creates roles and databases, then runs db/init/<key>.sql in each
db/init/*.sql       table definition and dummy data per database
lib/collections.ts  per-database config (labels, table and column names)
lib/db.ts           one postgres.js client per database
lib/records.ts      queries: list with search/sort/paging, count, create, update, delete
lib/schemas.ts      zod validation for URLs and form input
app/<db>/page.tsx   the collection routes (/books, /movies, /games), all rendering components/collection-page.tsx
app/actions.ts      Server Actions for create, update and delete
components/         UI: tabs, table, side panel form, delete dialog, toasts
```

## Scripts

| Command            | What it does                                          |
| ------------------ | ----------------------------------------------------- |
| `npm run db:setup` | Recreate and seed the three databases (destroys data) |
| `npm run dev`      | Start the development server                          |
| `npm run build`    | Production build, including type checking             |
| `npm run lint`     | Run ESLint                                            |
