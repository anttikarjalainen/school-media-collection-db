import type { Metadata } from "next";
import { Suspense } from "react";
import { COLLECTIONS, type CollectionKey } from "@/lib/collections";
import { parseListParams } from "@/lib/schemas";
import { DatabaseTabs } from "./database-tabs";
import { CollectionIcon } from "./icons";
import { AddRecordButton, RecordDialogs } from "./record-dialogs";
import { RecordsSection, RecordsSkeleton, RecordSummary } from "./records-view";
import { SearchBox, SearchBoxFallback } from "./search-box";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export function collectionMetadata(collection: CollectionKey): Metadata {
  return { title: `${COLLECTIONS[collection].label} · Media Collections` };
}

/**
 * The page for one collection. Each database has its own static route that
 * renders this, so the shell never reads `params` and every tab gets its own
 * prerendered, instantly navigable App Shell.
 */
export function CollectionPage({ collection, searchParams }: { collection: CollectionKey; searchParams: SearchParams }) {
  const config = COLLECTIONS[collection];

  // The shell renders immediately; everything that reads the database or the
  // search params streams in through its own Suspense boundary.
  return (
    <div data-collection={collection}>
      <RecordDialogs collection={collection}>
        <main className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pt-7 pb-18 sm:px-10">
          <DatabaseTabs active={collection} />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-text">
                <CollectionIcon collection={collection} size={22} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.015em]">{config.label}</h1>
                <Suspense fallback={<p className="text-[13px] leading-[18px] text-fg-3">Loading…</p>}>
                  <Summary collection={collection} searchParams={searchParams} />
                </Suspense>
              </div>
            </div>
            <div className="flex flex-[1_1_100%] flex-wrap items-center justify-end gap-2.5 sm:flex-[1_1_360px]">
              <Suspense fallback={<SearchBoxFallback />}>
                <SearchBox key={collection} collection={collection} />
              </Suspense>
              <AddRecordButton collection={collection} />
            </div>
          </div>

          <section
            aria-label={`${config.label} records`}
            className="overflow-hidden rounded-xl border border-line bg-surface shadow-elev-sm"
          >
            <Suspense fallback={<RecordsSkeleton />}>
              <Records collection={collection} searchParams={searchParams} />
            </Suspense>
          </section>
        </main>
      </RecordDialogs>
    </div>
  );
}

type SectionProps = { collection: CollectionKey; searchParams: SearchParams };

async function Summary({ collection, searchParams }: SectionProps) {
  const params = parseListParams(collection, await searchParams);
  return <RecordSummary collection={collection} params={params} />;
}

async function Records({ collection, searchParams }: SectionProps) {
  const params = parseListParams(collection, await searchParams);
  return <RecordsSection collection={collection} params={params} />;
}
