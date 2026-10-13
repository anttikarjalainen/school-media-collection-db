// Creates (or recreates) the three independent databases, each owned by its own
// role, then runs db/init/<key>.sql inside each one as that owner.
// Usage: npm run db:setup   (reads .env.local; destroys existing data)

import { readFile } from "node:fs/promises";
import postgres from "postgres";

const COLLECTIONS = [
  { key: "books", envVar: "BOOKS_DATABASE_URL" },
  { key: "movies", envVar: "MOVIES_DATABASE_URL" },
  { key: "games", envVar: "GAMES_DATABASE_URL" },
];

// DDL can't take bind parameters, so names are checked and quoted by hand.
const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env.local and fill it in.`);
  return value;
}

function parseTarget(envVar) {
  const url = new URL(requireEnv(envVar));
  const role = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = url.pathname.replace(/^\//, "");
  for (const [label, name] of [["role", role], ["database", database]]) {
    if (!IDENTIFIER.test(name)) throw new Error(`${envVar}: invalid ${label} name "${name}"`);
  }
  if (!password) throw new Error(`${envVar}: a password is required`);
  return { url: url.toString(), role, password, database };
}

const quoteLiteral = (value) => `'${value.replaceAll("'", "''")}'`;

async function main() {
  const targets = COLLECTIONS.map((c) => ({ ...c, ...parseTarget(c.envVar) }));
  const admin = postgres(requireEnv("ADMIN_DATABASE_URL"), { max: 1, onnotice: () => {} });

  try {
    for (const t of targets) {
      // One statement per call: CREATE/DROP DATABASE can't run inside a transaction block.
      await admin.unsafe(`drop database if exists "${t.database}" with (force)`);
      await admin.unsafe(`drop role if exists "${t.role}"`);
      await admin.unsafe(`create role "${t.role}" login password ${quoteLiteral(t.password)}`);
      await admin.unsafe(`create database "${t.database}" owner "${t.role}"`);
      // Only the owner may connect, so e.g. books_owner cannot open movies_db.
      await admin.unsafe(`revoke connect on database "${t.database}" from public`);
      await admin.unsafe(`grant connect on database "${t.database}" to "${t.role}"`);
      console.log(`created ${t.database} (owner ${t.role})`);
    }
  } finally {
    await admin.end();
  }

  for (const t of targets) {
    const sql = postgres(t.url, { max: 1, onnotice: () => {} });
    try {
      const script = await readFile(new URL(`./init/${t.key}.sql`, import.meta.url), "utf8");
      await sql.unsafe(script).simple();
      const [{ count }] = await sql`select count(*)::int as count from ${sql(t.key)}`;
      console.log(`seeded ${t.database}: ${count} ${t.key}`);
    } finally {
      await sql.end();
    }
  }
}

main().catch((error) => {
  console.error(`db:setup failed: ${error.message}`);
  process.exitCode = 1;
});
