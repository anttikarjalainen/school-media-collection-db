import Link from "next/link";
import { DatabaseIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-15 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-10">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md">
          <span className="flex size-7 items-center justify-center rounded-[7px] bg-fg text-bg">
            <DatabaseIcon size={16} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Media Collections</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
