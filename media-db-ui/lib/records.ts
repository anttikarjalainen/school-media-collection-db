import "server-only";
import { cache } from "react";
import {
  COLLECTIONS,
  PAGE_SIZE,
  type CollectionKey,
  type MediaRecord,
  type SortColumn,
  type SortDirection,
} from "./collections";
import { getClient } from "./db";
import type { RecordInput } from "./schemas";

export type RecordPage = {
  rows: MediaRecord[];
  /** All records in the table. */
  total: number;
  /** Records matching the search query. */
  matching: number;
  page: number;
  pageCount: number;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

function tableParts(key: CollectionKey) {
  const sql = getClient(key);
  const { table, fieldColumn } = COLLECTIONS[key];
  return { sql, table: sql(table), field: sql(fieldColumn), fieldColumn };
}

// Wrapped in cache() so the heading and the table share one query per request.
export const listRecords = cache(
  async (
    key: CollectionKey,
    q: string,
    sort: SortColumn,
    dir: SortDirection,
    requestedPage: number,
  ): Promise<RecordPage> => {
    const { sql, table, field, fieldColumn } = tableParts(key);

    const pattern = `%${escapeLike(q)}%`;
    const matches = q
      ? sql`(title ilike ${pattern} or ${field} ilike ${pattern} or year::text like ${pattern})`
      : sql`true`;

    const [counts] = await sql<{ total: number; matching: number }[]>`
      select count(*)::int as total, (count(*) filter (where ${matches}))::int as matching
      from ${table}
    `;
    const total = counts?.total ?? 0;
    const matching = counts?.matching ?? 0;

    const pageCount = Math.max(1, Math.ceil(matching / PAGE_SIZE));
    const page = Math.min(requestedPage, pageCount);

    const column = sort === "field" ? fieldColumn : sort;
    // Text sorts ignore case, like the design's localeCompare.
    const orderBy = column === "id" || column === "year" ? sql(column) : sql`lower(${sql(column)})`;
    const direction = dir === "asc" ? sql`asc` : sql`desc`;

    const rows = await sql<MediaRecord[]>`
      select id, title, ${field} as field, year
      from ${table}
      where ${matches}
      order by ${orderBy} ${direction}, id ${direction}
      limit ${PAGE_SIZE} offset ${(page - 1) * PAGE_SIZE}
    `;

    return { rows: [...rows], total, matching, page, pageCount };
  },
);

export async function countRecords(key: CollectionKey): Promise<number> {
  const { sql, table } = tableParts(key);
  const [row] = await sql<{ count: number }[]>`select count(*)::int as count from ${table}`;
  return row?.count ?? 0;
}

export async function createRecord(key: CollectionKey, input: RecordInput): Promise<MediaRecord> {
  const { sql, table, field } = tableParts(key);
  const [row] = await sql<MediaRecord[]>`
    insert into ${table} (title, ${field}, year)
    values (${input.title}, ${input.field}, ${input.year})
    returning id, title, ${field} as field, year
  `;
  if (!row) throw new Error("Insert returned no row");
  return row;
}

/** Returns null when the record no longer exists. */
export async function updateRecord(
  key: CollectionKey,
  id: number,
  input: RecordInput,
): Promise<MediaRecord | null> {
  const { sql, table, field } = tableParts(key);
  const [row] = await sql<MediaRecord[]>`
    update ${table}
    set title = ${input.title}, ${field} = ${input.field}, year = ${input.year}
    where id = ${id}
    returning id, title, ${field} as field, year
  `;
  return row ?? null;
}

/** Returns null when the record no longer exists. */
export async function deleteRecord(key: CollectionKey, id: number): Promise<MediaRecord | null> {
  const { sql, table, field } = tableParts(key);
  const [row] = await sql<MediaRecord[]>`
    delete from ${table}
    where id = ${id}
    returning id, title, ${field} as field, year
  `;
  return row ?? null;
}
