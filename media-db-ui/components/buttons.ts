// Shared class names for the design's button styles.

const base =
  "focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[9px] text-sm font-medium disabled:cursor-default disabled:opacity-60";

export const primaryButton = `${base} bg-accent px-4 text-accent-fg hover:brightness-93 dark:hover:brightness-108`;

export const secondaryButton = `${base} border border-line-strong bg-surface px-4 text-fg hover:bg-surface-2`;

export const dangerButton = `${base} bg-danger px-[18px] text-danger-fg hover:brightness-92`;

export const iconButton =
  "focus-ring inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-fg-3 hover:bg-surface-hover hover:text-fg max-[720px]:size-11";
