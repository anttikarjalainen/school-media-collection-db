import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";
import {
  COLLECTIONS,
  PAGE_SIZE,
  collectionHref,
  type CollectionKey,
  type ListParams,
  type SortColumn,
} from "@/lib/collections";
import { listRecords, type RecordPage } from "@/lib/records";
import { secondaryButton } from "./buttons";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CollectionIcon,
  SearchIcon,
  SortIcon,
} from "./icons";
import { AddRecordButton, RowActions } from "./record-dialogs";

type ViewProps ={ collection: CollectionKey; params: ListParams };

type LoadResult = { ok: true; data: RecordPage } | { ok: false };

async function load({ collection, params }: ViewProps): Promise<LoadResult> {
  // Records must be read per request, never baked into a prerender or prefetch.
  // Kept outside the try so the prerender bailout isn't caught as a failure.
  await connection();
  try {
    const data = await listRecords(collection, params.q, params.sort, params.dir, params.page);
    return { ok: true, data };
  } catch (error) {
    console.error(`listRecords(${collection}) failed`, error);
    return { ok: false };
  }
}

/** The "12 records · 3 matching" line under the heading. */
export async function RecordSummary(props: ViewProps) {
  const result = await load(props);
  if (!result.ok) return <p className="text-[13px] leading-[18px] text-danger">Database unavailable</p>;
  const { total, matching } = result.data;
  return (
    <p className="text-[13px] leading-[18px] text-fg-3">
      {total} record{total === 1 ? "" : "s"}
      {props.params.q && ` · ${matching} matching`}
    </p>
  );
}

export async function RecordsSection(props: ViewProps) {
  const { collection, params } = props;
  const config = COLLECTIONS[collection];
  const result = await load(props);

  if (!result.ok) {
    return (
      <StateMessage
        icon={<AlertTriangleIcon size={22} />}
        iconClass="bg-danger-soft text-danger"
        title={`Couldn’t reach the ${config.label} database`}
        body={`The other databases are unaffected. Check that PostgreSQL is running and ${config.envVar} is correct, then reload.`}
      >
        {/* A full reload retries the connection; a client navigation to the same URL would not. */}
        <a href={collectionHref(collection, params)} className={secondaryButton}>
          Try again
        </a>
      </StateMessage>
    );
  }

  const { rows, total, matching, page, pageCount } = result.data;

  if (total === 0) {
    return (
      <StateMessage
        icon={<CollectionIcon collection={collection} size={26} />}
        iconClass="bg-accent-soft text-accent-text"
        title={`No ${config.label.toLowerCase()} yet`}
        body={`Add your first ${config.singular} to start the collection. Each record has a title, ${config.fieldLabel.toLowerCase()} and year.`}
      >
        <AddRecordButton collection={collection} />
      </StateMessage>
    );
  }

  if (matching === 0) {
    return (
      <StateMessage
        icon={<SearchIcon size={22} />}
        iconClass="bg-surface-2 text-fg-3"
        title={`No ${config.label.toLowerCase()} match “${params.q}”`}
        body={`Try a different title, ${config.fieldLabel.toLowerCase()} or year.`}
      >
        <Link href={collectionHref(collection, { sort: params.sort, dir: params.dir })} className={secondaryButton}>
          Clear search
        </Link>
      </StateMessage>
    );
  }

  const columns: { key: SortColumn; label: string; numeric?: boolean; className: string }[] = [
    { key: "id", label: "ID", className: "cell-id" },
    { key: "title", label: "Title", className: "cell-title" },
    { key: "field", label: config.fieldLabel, className: "cell-field" },
    { key: "year", label: "Year", numeric: true, className: "cell-year justify-end" },
  ];

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = from + rows.length - 1;

  return (
    <>
      <div role="table" aria-label={config.label} aria-rowcount={matching + 1}>
        <div role="rowgroup" className="records-head">
          <div role="row" className="records-grid bg-surface-2">
            {columns.map((column) => {
              const active = params.sort === column.key;
              // A new column starts newest-first for years, A–Z otherwise; the same column flips.
              const nextDir = active ? (params.dir === "asc" ? "desc" : "asc") : column.numeric ? "desc" : "asc";
              const state = active ? (params.dir === "asc" ? "ascending" : "descending") : "none";
              return (
                <div
                  key={column.key}
                  role="columnheader"
                  aria-sort={state}
                  className={`records-cell ${column.className}`}
                >
                  <Link
                    href={collectionHref(collection, { q: params.q, sort: column.key, dir: nextDir })}
                    scroll={false}
                    aria-label={`Sort by ${column.label}${active ? `, currently ${state}` : ""}`}
                    className={`focus-ring -mx-2 inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold tracking-[0.04em] uppercase hover:bg-surface-hover hover:text-fg ${
                      active ? "text-fg" : "text-fg-3"
                    }`}
                  >
                    <span>{column.label}</span>
                    <span className={active ? "flex text-accent-text" : "flex text-fg-3 opacity-60"}>
                      {state === "ascending" ? (
                        <ArrowUpIcon size={13} />
                      ) : state === "descending" ? (
                        <ArrowDownIcon size={13} />
                      ) : (
                        <SortIcon size={13} />
                      )}
                    </span>
                  </Link>
                </div>
              );
            })}
            <div role="columnheader" className="records-cell cell-actions justify-end">
              <span className="sr-only">Actions</span>
            </div>
          </div>
        </div>
        <div role="rowgroup">
          {rows.map((record) => (
            <div key={record.id} role="row" className="records-grid border-t border-line hover:bg-surface-2">
              <div role="cell" className="records-cell cell-id font-mono text-[12.5px] text-fg-3">
                {String(record.id).padStart(3, "0")}
              </div>
              <div role="cell" className="records-cell cell-title font-medium text-fg">
                <span className="truncate">{record.title}</span>
              </div>
              <div role="cell" className="records-cell cell-field text-fg-2">
                <span className="truncate">{record.field}</span>
              </div>
              <div role="cell" className="records-cell cell-year justify-end text-fg-2 tabular-nums">
                {record.year}
              </div>
              <div role="cell" className="records-cell cell-actions justify-end gap-0.5 pr-2.5">
                <RowActions record={record} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line py-2 pr-2.5 pl-4 text-[13px] text-fg-3">
        <span className="tabular-nums">
          {from}–{to} of {matching}
        </span>
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <span className="mr-2 hidden tabular-nums sm:inline">
            Page {page} of {pageCount}
          </span>
          <PageLink href={page > 1 ? collectionHref(collection, { ...params, page: page - 1 }) : null} label="Previous page">
            <ChevronLeftIcon size={16} />
          </PageLink>
          <PageLink
            href={page < pageCount ? collectionHref(collection, { ...params, page: page + 1 }) : null}
            label="Next page"
          >
            <ChevronRightIcon size={16} />
          </PageLink>
        </nav>
      </div>
    </>
  );
}

const pageButton =
  "inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-fg-2 max-[720px]:size-11";

function PageLink({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
  if (!href) {
    return (
      <span aria-disabled="true" aria-label={label} className={`${pageButton} opacity-40`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} aria-label={label} className={`focus-ring ${pageButton} hover:bg-surface-hover hover:text-fg`}>
      {children}
    </Link>
  );
}

function StateMessage({
  icon,
  iconClass,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-16 text-center sm:py-20">
      <span className={`mb-1.5 flex size-14 items-center justify-center rounded-[14px] ${iconClass}`}>{icon}</span>
      <h2 className="text-[17px] leading-6 font-semibold">{title}</h2>
      <p className="mb-2.5 max-w-[360px] text-sm leading-[21px] text-pretty text-fg-3">{body}</p>
      {children}
    </div>
  );
}

/** Placeholder rows with the same height as real ones, so nothing jumps when data arrives. */
export function RecordsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading records">
      <div className="records-head h-11 bg-surface-2" />
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex h-[52px] items-center gap-4 border-t border-line px-4">
          <div className="h-3 w-8 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-1/5 animate-pulse rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
