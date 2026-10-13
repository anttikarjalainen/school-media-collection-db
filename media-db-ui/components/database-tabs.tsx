import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { COLLECTIONS, COLLECTION_KEYS, type CollectionKey } from "@/lib/collections";
import { countRecords } from "@/lib/records";
import { CollectionIcon } from "./icons";

const badge =
  "inline-flex h-5 min-w-[22px] items-center justify-center rounded-[10px] px-1.5 text-xs font-medium tabular-nums";

/** Each count queries its own database, so one database being down only affects its own tab. */
async function TabCount({ collection, active }: { collection: CollectionKey; active: boolean }) {
  // Counts must be read per request, never baked into the prerendered shell.
  await connection();
  const count = await countRecords(collection).catch(() => null);
  if (count === null) {
    return (
      <span className={`${badge} bg-danger-soft text-danger`} title={`${COLLECTIONS[collection].label} database unavailable`}>
        –
      </span>
    );
  }
  const colors = active ? "bg-accent-soft text-accent-text" : "bg-line text-fg-2";
  return <span className={`${badge} ${colors}`}>{count}</span>;
}

export function DatabaseTabs({ active }: { active: CollectionKey }) {
  return (
    <nav
      aria-label="Database"
      className="flex gap-1 self-stretch rounded-xl border border-line bg-surface-2 p-1 sm:inline-flex sm:self-start"
    >
      {COLLECTION_KEYS.map((key) => {
        const selected = key === active;
        return (
          <Link
            key={key}
            href={`/${key}`}
            data-collection={key}
            aria-current={selected ? "page" : undefined}
            className={`focus-ring inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-sm whitespace-nowrap sm:flex-none sm:px-3 ${
              selected
                ? "bg-surface font-semibold text-fg shadow-[var(--elev-sm),0_0_0_1px_var(--line)]"
                : "font-medium text-fg-2 hover:bg-surface-hover hover:text-fg"
            }`}
          >
            <span className={`flex ${selected ? "text-accent-text" : "text-fg-3"}`}>
              <CollectionIcon collection={key} size={18} />
            </span>
            <span>{COLLECTIONS[key].label}</span>
            <Suspense fallback={<span className={`${badge} bg-line text-transparent`}>0</span>}>
              <TabCount collection={key} active={selected} />
            </Suspense>
          </Link>
        );
      })}
    </nav>
  );
}
