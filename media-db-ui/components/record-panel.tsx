"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveRecord } from "@/app/actions";
import { COLLECTIONS, capitalize, type CollectionKey, type MediaRecord } from "@/lib/collections";
import { primaryButton, secondaryButton, iconButton } from "./buttons";
import { AlertCircleIcon, CollectionIcon, XIcon } from "./icons";
import { Modal } from "./modal";
import { useToast } from "./toaster";

type FieldName = "title" | "field" | "year";
type FieldErrors = Partial<Record<FieldName, string>>;

type RecordPanelProps = {
  collection: CollectionKey;
  /** null when adding a new record. */
  record: MediaRecord | null;
  onClose: () => void;
};

export function RecordPanel({ collection, record, onClose }: RecordPanelProps) {
  const config = COLLECTIONS[collection];
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  // Controlled inputs, so the values survive a failed save.
  const [values, setValues] = useState<Record<FieldName, string>>({
    title: record?.title ?? "",
    field: record?.field ?? "",
    year: record ? String(record.year) : "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const isEdit = record !== null;
  const title = `${isEdit ? "Edit" : "Add"} ${config.singular}`;

  function update(name: FieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveRecord({ db: collection, id: record?.id, ...values });
      if (result.ok) {
        onClose();
        toast({
          kind: "success",
          title: isEdit ? "Changes saved" : `${capitalize(config.singular)} added`,
          message: `“${result.data.title}” in ${config.label}.`,
        });
      } else if (result.fieldErrors) {
        setErrors(result.fieldErrors);
      } else {
        toast({ kind: "error", title: `Couldn’t save ${config.singular}`, message: result.error });
      }
    });
  }

  const fields: { name: FieldName; label: string; numeric?: boolean }[] = [
    { name: "title", label: "Title" },
    { name: "field", label: config.fieldLabel },
    { name: "year", label: "Year", numeric: true },
  ];

  return (
    <Modal onClose={onClose} className="dialog-sheet border-y-0 border-r-0" labelledBy="record-panel-title">
      <form onSubmit={submit} noValidate className="flex h-full flex-col" data-collection={collection}>
        <div className="flex items-start justify-between gap-4 border-b border-line py-5 pr-4 pl-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent-text">
              <CollectionIcon collection={collection} size={18} />
            </span>
            <div className="min-w-0">
              <h2 id="record-panel-title" className="text-[17px] leading-[22px] font-semibold">
                {title}
              </h2>
              <p className="mt-0.5 text-[13px] leading-[18px] text-fg-3">
                {isEdit
                  ? `Record ${String(record.id).padStart(3, "0")} in ${config.label}`
                  : `New record in ${config.label}`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className={iconButton}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          {fields.map(({ name, label, numeric }, index) => {
            const id = `record-${name}`;
            const error = errors[name];
            return (
              <div key={name} className="flex flex-col gap-1.5">
                <label htmlFor={id} className="text-[13px] font-medium">
                  {label}
                </label>
                <input
                  id={id}
                  name={name}
                  type="text"
                  inputMode={numeric ? "numeric" : undefined}
                  autoComplete="off"
                  value={values[name]}
                  onChange={(event) => update(name, event.target.value)}
                  placeholder={config.placeholders[name]}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  data-autofocus={index === 0 ? true : undefined}
                  className={`text-input ${numeric ? "max-w-40 tabular-nums" : ""}`}
                />
                {error && (
                  <p id={`${id}-error`} className="flex items-center gap-1.5 text-[13px] text-danger">
                    <AlertCircleIcon size={14} />
                    <span>{error}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={`${primaryButton} px-[18px]`}>
            {pending ? "Saving…" : isEdit ? "Save changes" : `Add ${config.singular}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
