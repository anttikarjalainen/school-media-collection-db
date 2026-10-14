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
  const pressStartedOnBackdrop = useRef(false);

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
      onPointerDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        // Clicks on the dialog element itself (not its content) come from the backdrop.
        // A drag that starts in the content and ends on the backdrop also fires a click
        // on the dialog, so only close when the press started on the backdrop too.
        const fromBackdrop = event.target === event.currentTarget && pressStartedOnBackdrop.current;
        pressStartedOnBackdrop.current = false;
        if (fromBackdrop) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
