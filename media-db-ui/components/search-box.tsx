"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { COLLECTIONS, type CollectionKey } from "@/lib/collections";
import { SearchIcon, XIcon } from "./icons";

const DEBOUNCE_MS = 250;

export function SearchBox({ collection }: { collection: CollectionKey }) {
  const config = COLLECTIONS[collection];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(() => searchParams.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function navigate(query: string) {
    const next = new URLSearchParams(searchParams);
    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");
    // A new search always starts from the first page.
    next.delete("page");
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  function onChange(query: string) {
    setValue(query);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(query), DEBOUNCE_MS);
  }

  function clear() {
    clearTimeout(timer.current);
    setValue("");
    navigate("");
  }

  const label = `Search ${config.label.toLowerCase()} by title, ${config.fieldLabel.toLowerCase()} or year`;

  return (
    <div className="relative min-w-0 flex-[1_1_160px] sm:min-w-[200px] sm:flex-[0_1_300px]">
      <label htmlFor="record-search" className="sr-only">
        {label}
      </label>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-3">
        <SearchIcon size={16} />
      </span>
      <input
        id="record-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) clear();
        }}
        placeholder={`Search ${config.label.toLowerCase()}…`}
        maxLength={100}
        className="text-input rounded-[9px] pr-10 pl-9"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="focus-ring absolute top-1 right-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-[7px] text-fg-3 hover:bg-surface-hover hover:text-fg"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  );
}

/** Same footprint as the search box, shown while search params load. */
export function SearchBoxFallback() {
  return <div className="h-10 min-w-0 flex-[1_1_160px] rounded-[9px] border border-line-strong bg-surface sm:min-w-[200px] sm:flex-[0_1_300px]" />;
}
