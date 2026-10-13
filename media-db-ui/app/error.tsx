"use client";

import { secondaryButton } from "@/components/buttons";
import { AlertTriangleIcon } from "@/components/icons";

// Fallback for unexpected errors. Expected ones, like a database being down,
// are shown inline by the records view instead.
export default function CollectionError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col items-center gap-2.5 px-6 py-20 text-center">
      <span className="mb-1.5 flex size-14 items-center justify-center rounded-[14px] bg-danger-soft text-danger">
        <AlertTriangleIcon size={22} />
      </span>
      <h1 className="text-[17px] leading-6 font-semibold">Something went wrong</h1>
      <p className="mb-2.5 max-w-[360px] text-sm leading-[21px] text-fg-3">
        The page couldn’t be loaded. Your data is safe — try again.
      </p>
      <button type="button" onClick={() => retry()} className={secondaryButton}>
        Try again
      </button>
    </main>
  );
}
