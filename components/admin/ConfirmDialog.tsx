"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions. */
  danger?: boolean;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

/**
 * In-app confirmation dialog. Usage:
 *   const [confirm, dialog] = useConfirm();
 *   if (await confirm({ title: "Delete this?", danger: true })) …
 *   …and render {dialog} once in the component tree.
 */
export function useConfirm(): [(opts: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...opts, resolve });
      }),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      setPending((p) => {
        p?.resolve(ok);
        return null;
      });
    },
    [],
  );

  const dialog = pending ? <ConfirmDialog {...pending} onClose={close} /> : null;
  return [confirm, dialog];
}

function ConfirmDialog({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", danger, onClose }: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Focus the safe choice first so a stray Enter doesn't destroy anything.
    const t = setTimeout(() => confirmRef.current?.focus(), 0);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="confirm-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(false); }}>
      <div className="confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby={message ? "confirm-msg" : undefined}>
        <h2 id="confirm-title" className="confirm-title">{title}</h2>
        {message ? <p id="confirm-msg" className="confirm-msg">{message}</p> : null}
        <div className="confirm-actions">
          <button ref={confirmRef} type="button" className="secondary-btn" onClick={() => onClose(false)}>{cancelLabel}</button>
          <button type="button" className={`primary-btn${danger ? " confirm-danger" : ""}`} onClick={() => onClose(true)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
