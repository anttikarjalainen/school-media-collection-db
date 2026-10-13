"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { COLLECTIONS, type CollectionKey, type MediaRecord } from "@/lib/collections";
import { iconButton, primaryButton } from "./buttons";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { PencilIcon, PlusIcon, TrashIcon } from "./icons";
import { RecordPanel } from "./record-panel";

type DialogState =
  | { kind: "add" }
  | { kind: "edit"; record: MediaRecord }
  | { kind: "delete"; record: MediaRecord }
  | null;

const DialogContext = createContext<((state: DialogState) => void) | null>(null);

function useOpenDialog() {
  const open = useContext(DialogContext);
  if (!open) throw new Error("Record buttons must be used inside <RecordDialogs>");
  return open;
}

/** Owns the add/edit panel and delete confirmation for one collection page. */
export function RecordDialogs({ collection, children }: { collection: CollectionKey; children: ReactNode }) {
  const [state, setState] = useState<DialogState>(null);
  const close = () => setState(null);

  return (
    <DialogContext.Provider value={setState}>
      {children}
      {state?.kind === "add" && <RecordPanel collection={collection} record={null} onClose={close} />}
      {state?.kind === "edit" && <RecordPanel collection={collection} record={state.record} onClose={close} />}
      {state?.kind === "delete" && (
        <ConfirmDeleteDialog collection={collection} record={state.record} onClose={close} />
      )}
    </DialogContext.Provider>
  );
}

export function AddRecordButton({ collection }: { collection: CollectionKey }) {
  const open = useOpenDialog();
  return (
    <button type="button" onClick={() => open({ kind: "add" })} className={`${primaryButton} pr-4 pl-[13px]`}>
      <PlusIcon size={16} />
      <span>Add {COLLECTIONS[collection].singular}</span>
    </button>
  );
}

export function RowActions({ record }: { record: MediaRecord }) {
  const open = useOpenDialog();
  return (
    <>
      <button
        type="button"
        onClick={() => open({ kind: "edit", record })}
        aria-label={`Edit “${record.title}”`}
        title="Edit"
        className={iconButton}
      >
        <PencilIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => open({ kind: "delete", record })}
        aria-label={`Delete “${record.title}”`}
        title="Delete"
        className={`${iconButton} hover:bg-danger-soft hover:text-danger`}
      >
        <TrashIcon size={16} />
      </button>
    </>
  );
}
