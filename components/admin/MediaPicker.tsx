"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MediaDTO } from "@/lib/types";

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchMedia(): Promise<MediaDTO[]> {
  const res = await fetch("/api/media", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load the image library");
  return (await res.json()) as MediaDTO[];
}

type Props = {
  title?: string;
  onPick: (url: string) => void;
  onClose: () => void;
  /** Uploads a file and returns its URL; the picker offers an Upload button when given. */
  onUpload?: (file: File) => Promise<string | null>;
};

/** Modal grid of every uploaded image. Click one to use it without uploading again. */
export function MediaPicker({ title = "Choose an image", onPick, onClose, onUpload }: Props) {
  const [items, setItems] = useState<MediaDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetchMedia()
      .then((m) => alive && setItems(m))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const shown = (items ?? []).filter((m) => !query || m.name.toLowerCase().includes(query.toLowerCase()));

  async function uploadNew(file: File | undefined) {
    if (!file || !onUpload) return;
    setBusy(true);
    try {
      const url = await onUpload(file);
      if (url) onPick(url);
    } finally {
      setBusy(false);
    }
  }

  // Rendered at the body so the writer's panel styles for inputs do not leak into the dialog.
  return createPortal(
    <div className="confirm-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="confirm-box picker-box" role="dialog" aria-modal="true" aria-label={title}>
        <div className="picker-head">
          <h2 className="confirm-title" style={{ margin: 0 }}>{title}</h2>
          <button type="button" className="ghost" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="picker-tools">
          <input className="search" type="search" placeholder="Search by file name…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search images" />
          {onUpload ? (
            <>
              <button type="button" className="secondary-btn" disabled={busy} onClick={() => fileRef.current?.click()}>
                {busy ? "Uploading…" : "Upload new…"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => void uploadNew(e.target.files?.[0])} />
            </>
          ) : null}
        </div>

        {error ? <p className="confirm-msg" style={{ color: "var(--verm)" }}>{error}</p> : null}
        {!items && !error ? <p className="confirm-msg">Loading…</p> : null}
        {items && items.length === 0 ? <p className="confirm-msg">No images uploaded yet.</p> : null}
        {items && items.length > 0 && shown.length === 0 ? <p className="confirm-msg">No file names match.</p> : null}

        {shown.length > 0 ? (
          <div className="media-grid picker-grid">
            {shown.map((m) => (
              <button key={m.id} type="button" className="media-card pick" onClick={() => onPick(m.url)} title={`Use ${m.name}`}>
                <span className="media-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="media-name">{m.name}</span>
                <span className="mono-sm media-sub">
                  {formatBytes(m.size)}
                  {m.usedIn.length ? ` · used in ${m.usedIn.length}` : ""}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
