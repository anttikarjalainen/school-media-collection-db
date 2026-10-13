"use client";

import { MoonIcon, SunIcon } from "./icons";

export const THEME_STORAGE_KEY = "theme";

export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  }

  // The current theme is only known in the browser, so both icons render and
  // CSS shows the right one. That avoids a hydration mismatch.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="focus-ring inline-flex size-10 cursor-pointer items-center justify-center rounded-[9px] border border-line bg-surface text-fg-2 hover:bg-surface-hover hover:text-fg"
    >
      <MoonIcon size={18} className="shrink-0 dark:hidden" />
      <SunIcon size={18} className="hidden shrink-0 dark:block" />
    </button>
  );
}
