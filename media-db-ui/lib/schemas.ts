import { z } from "zod";
import { COLLECTIONS, COLLECTION_KEYS, type CollectionKey, type ListParams } from "./collections";

export const collectionKeySchema = z.enum(COLLECTION_KEYS);

export const recordIdSchema = z.coerce.number().int().positive();

const listParamsSchema = z.object({
  // A repeated query parameter arrives as an array; .catch() falls back instead of erroring.
  q: z.string().trim().max(100).catch(""),
  sort: z.enum(["id", "title", "field", "year"]).optional().catch(undefined),
  dir: z.enum(["asc", "desc"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export function parseListParams(key: CollectionKey, raw: Record<string, unknown>): ListParams {
  const { q, sort, dir, page } = listParamsSchema.parse(raw);
  // Sort and direction only make sense together; otherwise use the collection default.
  if (sort && dir) return { q, sort, dir, page };
  return { q, ...COLLECTIONS[key].defaultSort, page };
}

const YEAR_ERROR = "Enter a four-digit year between 1000 and 2100.";

export function recordInputSchema(key: CollectionKey) {
  const { fieldLabel } = COLLECTIONS[key];
  return z.object({
    title: z
      .string({ error: "Title is required." })
      .trim()
      .min(1, { error: "Title is required." })
      .max(200, { error: "Keep the title under 200 characters." }),
    field: z
      .string({ error: `${fieldLabel} is required.` })
      .trim()
      .min(1, { error: `${fieldLabel} is required.` })
      .max(200, { error: `Keep the ${fieldLabel.toLowerCase()} under 200 characters.` }),
    year: z
      .string({ error: YEAR_ERROR })
      .trim()
      .regex(/^\d{4}$/, { error: YEAR_ERROR })
      .transform(Number)
      .pipe(z.number().int().min(1000, { error: YEAR_ERROR }).max(2100, { error: YEAR_ERROR })),
  });
}

export type RecordInput = z.output<ReturnType<typeof recordInputSchema>>;
