"use client";

import { useTransition } from "react";
import { deleteRecord } from "@/app/actions";
import { COLLECTIONS, capitalize, type CollectionKey, type MediaRecord } from "@/lib/collections";
import { dangerButton, secondaryButton } from "./buttons";
import { AlertTriangleIcon } from "./icons";
import { Modal } from "./modal";
import { useToast } from "./toaster";

type ConfirmDeleteDialogProps = {
  collection: CollectionKey;
  record: MediaRecord;
  onClose: () => void;
};

export function ConfirmDeleteDialog({ collection, record, onClose }: ConfirmDeleteDialogProps) {
  const config = COLLECTIONS[collection];
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await deleteRecord(collection, record.id);
      onClose();
      if (result.ok) {
        toast({
          kind: "success",
          title: `${capitalize(config.singular)} deleted`,
          message: `“${record.title}” was removed from ${config.label}.`,
        });
      } else {
        toast({ kind: "error", title: `Couldn’t delete ${config.singular}`, message: result.error });
      }
    });
  }

  return (
    <Modal
      onClose={onClose}
      role="alertdialog"
      className="dialog-center rounded-[14px]"
      labelledBy="delete-title"
      describedBy="delete-description"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-start gap-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-danger-soft text-danger">
            <AlertTriangleIcon size={18} />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 id="delete-title" className="text-[17px] leading-[22px] font-semibold wrap-anywhere">
              Delete “{record.title}”?
            </h2>
            <p id="delete-description" className="text-sm leading-[21px] text-fg-2">
              This permanently removes the {config.singular} from the {config.label} database. This can’t be
              undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {/* Cancel comes first so it receives initial focus, the safe default. */}
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="button" onClick={confirm} disabled={pending} className={dangerButton}>
            {pending ? "Deleting…" : `Delete ${config.singular}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
