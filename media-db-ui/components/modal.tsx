"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  className: string;
  role?: "dialog" | "alertdialog";
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
};

/**
 * A native modal <dialog>: the browser handles focus trapping, Esc and making
 * the rest of the page inert. Mount it to open, unmount it to close.
 */
export function Modal({ onClose, className, role = "dialog", labelledBy, describedBy, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={`dialog border border-line bg-surface p-0 text-fg shadow-elev-lg ${className}`}
      onCancel={(event) => {
        // Let React decide when to unmount instead of the browser closing it directly.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clicks on the dialog element itself (not its content) come from the backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
