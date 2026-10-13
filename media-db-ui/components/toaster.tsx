"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircleIcon, CheckCircleIcon, XIcon } from "./icons";

type Toast = { kind: "success" | "error"; title: string; message: string };

const ToastContext = createContext<((toast: Toast) => void) | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <Toaster>");
  return show;
}

export function Toaster({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(Toast & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((next: Toast) => {
    clearTimeout(timer.current);
    setToast({ ...next, id: Date.now() });
    // Errors stay longer so there is time to read what went wrong.
    timer.current = setTimeout(() => setToast(null), next.kind === "error" ? 6000 : 3500);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const isError = toast?.kind === "error";

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* The live region stays mounted so screen readers announce new toasts. */}
      <div
        role="status"
        aria-live="polite"
        className="fixed right-4 bottom-4 left-4 z-60 sm:right-6 sm:bottom-6 sm:left-auto sm:w-[380px]"
      >
        {toast && (
          <div
            key={toast.id}
            className="rise-in flex items-start gap-3 rounded-[10px] bg-toast-bg py-3 pr-2 pl-3.5 text-toast-fg shadow-elev-lg"
          >
            <span className={`flex pt-px ${isError ? "text-toast-err" : "text-toast-ok"}`}>
              {isError ? <AlertCircleIcon size={20} /> : <CheckCircleIcon size={20} />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-px">
              <strong className="text-sm font-semibold">{toast.title}</strong>
              <span className="text-[13px] leading-[19px] wrap-anywhere opacity-85">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss notification"
              className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[7px] opacity-75 hover:opacity-100"
            >
              <XIcon size={14} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
