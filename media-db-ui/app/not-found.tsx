import Link from "next/link";
import { secondaryButton } from "@/components/buttons";
import { DatabaseIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col items-center gap-2.5 px-6 py-20 text-center">
      <span className="mb-1.5 flex size-14 items-center justify-center rounded-[14px] bg-surface-2 text-fg-3">
        <DatabaseIcon size={22} />
      </span>
      <h1 className="text-[17px] leading-6 font-semibold">No such database</h1>
      <p className="mb-2.5 max-w-[360px] text-sm leading-[21px] text-fg-3">
        Choose Books, Movies or Games to browse a collection.
      </p>
      <Link href="/books" className={secondaryButton}>
        Go to Books
      </Link>
    </main>
  );
}
