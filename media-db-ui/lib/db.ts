import "server-only";
import postgres from "postgres";
import { COLLECTIONS, type CollectionKey } from "./collections";

type Client = postgres.Sql;

// Hot reload re-evaluates this module; keeping clients on globalThis stops each
// reload from opening a fresh connection pool per database.
const globalForDb = globalThis as typeof globalThis & {
  mediaDbClients?: Partial<Record<CollectionKey, Client>>;
};

const clients: Partial<Record<CollectionKey, Client>> = globalForDb.mediaDbClients ?? {};
if (process.env.NODE_ENV !== "production") globalForDb.mediaDbClients = clients;

/**
 * Returns the connection pool for one database. Each database has its own URL
 * and owner role, so a failure in one never affects the others.
 */
export function getClient(key: CollectionKey): Client {
  const existing = clients[key];
  if (existing) return existing;

  const { envVar } = COLLECTIONS[key];
  const url = process.env[envVar];
  if (!url) throw new Error(`${envVar} is not set. See .env.example.`);

  const client = postgres(url, { max: 5, idle_timeout: 30, connect_timeout: 5 });
  clients[key] = client;
  return client;
}
