"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { COLLECTIONS, type ActionResult, type MediaRecord } from "@/lib/collections";
import * as records from "@/lib/records";
import { collectionKeySchema, recordIdSchema, recordInputSchema } from "@/lib/schemas";

// Server Actions are public endpoints: every argument is validated here, even
// though the UI only ever sends well-formed values.

const targetSchema = z.object({
  db: collectionKeySchema,
  id: recordIdSchema.optional(),
});

const INVALID_REQUEST: ActionResult<never> = { ok: false, error: "That request wasn't valid. Reload the page and try again." };

export async function saveRecord(input: unknown): Promise<ActionResult<MediaRecord>> {
  const target = targetSchema.safeParse(input);
  if (!target.success) return INVALID_REQUEST;
  const { db, id } = target.data;
  const { label, singular } = COLLECTIONS[db];

  const parsed = recordInputSchema(db).safeParse(input);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: {
        title: fieldErrors.title?.[0],
        field: fieldErrors.field?.[0],
        year: fieldErrors.year?.[0],
      },
    };
  }

  try {
    const saved =
      id === undefined
        ? await records.createRecord(db, parsed.data)
        : await records.updateRecord(db, id, parsed.data);
    revalidatePath(`/${db}`);
    if (!saved) return { ok: false, error: `This ${singular} no longer exists. It may have been deleted.` };
    return { ok: true, data: saved };
  } catch (error) {
    console.error(`saveRecord(${db}) failed`, error);
    return {
      ok: false,
      error: `Couldn’t reach the ${label} database. Your changes are still in the form — try again.`,
    };
  }
}

export async function deleteRecord(db: unknown, id: unknown): Promise<ActionResult<MediaRecord>> {
  const target = targetSchema.required().safeParse({ db, id });
  if (!target.success) return INVALID_REQUEST;
  const { label, singular } = COLLECTIONS[target.data.db];

  try {
    const deleted = await records.deleteRecord(target.data.db, target.data.id);
    // Revalidate even when nothing was deleted, so a stale row disappears from the list.
    revalidatePath(`/${target.data.db}`);
    if (!deleted) return { ok: false, error: `This ${singular} was already removed from ${label}.` };
    return { ok: true, data: deleted };
  } catch (error) {
    console.error(`deleteRecord(${target.data.db}) failed`, error);
    return { ok: false, error: `Couldn’t reach the ${label} database. Try again.` };
  }
}
