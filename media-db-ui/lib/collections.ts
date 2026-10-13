// Allowlisted configuration for the three databases. Every table and column
// identifier used in SQL comes from here, never from client input.
// Safe to import from client components: contains no secrets or server code.

export const COLLECTION_KEYS = ["books", "movies", "games"] as const;

export type CollectionKey = (typeof COLLECTION_KEYS)[number];

export type SortColumn = "id" | "title" | "field" | "year";
export type SortDirection = "asc" | "desc";

export type CollectionConfig = {
  key: CollectionKey;
  label: string;
  singular: string;
  table: CollectionKey;
  /** The collection-specific text column, shown in the UI as `fieldLabel`. */
  fieldColumn: "author" | "director" | "platform";
  fieldLabel: string;
  envVar: "BOOKS_DATABASE_URL" | "MOVIES_DATABASE_URL" | "GAMES_DATABASE_URL";
  defaultSort: { sort: SortColumn; dir: SortDirection };
  placeholders: { title: string; field: string; year: string };
};

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
  books: {
    key: "books",
    label: "Books",
    singular: "book",
    table: "books",
    fieldColumn: "author",
    fieldLabel: "Author",
    envVar: "BOOKS_DATABASE_URL",
    defaultSort: { sort: "title", dir: "asc" },
    placeholders: {
      title: "e.g. The Left Hand of Darkness",
      field: "e.g. Ursula K. Le Guin",
      year: "e.g. 1969",
    },
  },
  movies: {
    key: "movies",
    label: "Movies",
    singular: "movie",
    table: "movies",
    fieldColumn: "director",
    fieldLabel: "Director",
    envVar: "MOVIES_DATABASE_URL",
    defaultSort: { sort: "year", dir: "desc" },
    placeholders: {
      title: "e.g. Fallen Leaves",
      field: "e.g. Aki Kaurismäki",
      year: "e.g. 2023",
    },
  },
  games: {
    key: "games",
    label: "Games",
    singular: "game",
    table: "games",
    fieldColumn: "platform",
    fieldLabel: "Platform",
    envVar: "GAMES_DATABASE_URL",
    defaultSort: { sort: "title", dir: "asc" },
    placeholders: {
      title: "e.g. Outer Wilds",
      field: "e.g. PC, Nintendo Switch",
      year: "e.g. 2019",
    },
  },
};

export const PAGE_SIZE = 10;

/** A record as the UI sees it: the collection-specific column is always `field`. */
export type MediaRecord = {
  id: number;
  title: string;
  field: string;
  year: number;
};

export type ListParams = {
  q: string;
  sort: SortColumn;
  dir: SortDirection;
  page: number;
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Partial<Record<"title" | "field" | "year", string>> };

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Builds a collection URL, leaving out values that match the defaults. */
export function collectionHref(key: CollectionKey, params: Partial<ListParams> = {}): string {
  const { defaultSort } = COLLECTIONS[key];
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  const sort = params.sort ?? defaultSort.sort;
  const dir = params.dir ?? defaultSort.dir;
  if (sort !== defaultSort.sort || dir !== defaultSort.dir) {
    search.set("sort", sort);
    search.set("dir", dir);
  }
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/${key}?${query}` : `/${key}`;
}
