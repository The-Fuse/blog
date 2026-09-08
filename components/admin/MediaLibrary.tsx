"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { formatShortDate } from "@/lib/format";
import type { MediaDTO } from "@/lib/types";
import { useConfirm } from "./ConfirmDialog";
import { fetchMedia, formatBytes } from "./MediaPicker";

async function uploadFile(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Upload failed");
  }
  return ((await res.json()) as { url: string }).url;
}

export function MediaLibrary({ initial }: { initial: MediaDTO[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [confirm, confirmDialog] = useConfirm();

  const rows = useMemo(
    () => (query ? items.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())) : items),
    [items, query],
  );
  const totalBytes = items.reduce((n, m) => n + m.size, 0);

  async function refresh() {
    try {
      setItems(await fetchMedia());
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not reload");
    }
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setNotice(null);
    try {
      for (const f of Array.from(files)) await uploadFile(f);
      await refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function copy(m: MediaDTO) {
    const abs = m.url.startsWith("/") ? `${window.location.origin}${m.url}` : m.url;
    try {
      await navigator.clipboard.writeText(abs);
      setCopied(m.id);
      setTimeout(() => setCopied((c) => (c === m.id ? null : c)), 1500);
    } catch {
      window.prompt("Copy the image address", abs);
    }
  }

  async function remove(m: MediaDTO) {
    const inUse = m.usedIn.length > 0;
    const ok = await confirm({
      title: `Delete “${m.name}”?`,
      message: inUse
        ? `This image is used in ${m.usedIn.length === 1 ? "one article" : `${m.usedIn.length} articles`} (${m.usedIn.map((a) => a.title).join(", ")}). Those places will show a broken image until you choose another one. This cannot be undone.`
        : "The file is removed from storage. This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusyId(m.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/media/${m.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete the image. Please try again.");
      setItems((list) => list.filter((x) => x.id !== m.id));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="list-head">
        <div className="list-title">
          <h1>Images</h1>
          <span className="mono-sm" style={{ color: "var(--ink-3)" }}>
            {items.length} {items.length === 1 ? "file" : "files"} · {formatBytes(totalBytes)}
          </span>
        </div>
        <div className="list-tools">
          <input className="search" type="search" placeholder="Search file names…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search file names" />
          <button type="button" className="primary-btn list-new" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading…" : "+ Upload"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => void upload(e.target.files)} />
        </div>
      </div>

      <p className="writer-intro">
        Every image uploaded from the writer lands here. Pick any of them again from an article&apos;s <b>Library…</b> button instead of uploading twice.
        Deleting a file that an article still uses leaves a broken picture there.
      </p>

      {notice ? <p className="confirm-msg" style={{ color: "var(--verm)" }}>{notice}</p> : null}

      <div
        className="media-grid"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void upload(e.dataTransfer.files);
        }}
      >
        {rows.map((m) => {
          const busy = busyId === m.id;
          return (
            <div key={m.id} className={`media-card${busy ? " busy" : ""}`}>
              <a className="media-thumb" href={m.url} target="_blank" rel="noreferrer" title="Open the full image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt="" loading="lazy" decoding="async" />
              </a>
              <div className="media-meta">
                <span className="media-name" title={m.name}>{m.name}</span>
                <span className="mono-sm media-sub">
                  {formatBytes(m.size)} · {formatShortDate(m.createdAt)}
                </span>
                <span className="media-used">
                  {m.usedIn.length === 0 ? (
                    <span className="mono-sm" style={{ color: "var(--ink-3)" }}>Not used yet</span>
                  ) : (
                    m.usedIn.map((a) => (
                      <Link key={a.id} href={`/admin/articles/${a.id}`} className="media-chip" title="Open in the writer">
                        {a.title || "Untitled"}
                      </Link>
                    ))
                  )}
                </span>
              </div>
              <div className="media-actions">
                <button type="button" className="link-btn" onClick={() => void copy(m)}>{copied === m.id ? "Copied" : "Copy address"}</button>
                <button type="button" className="link-btn danger" disabled={busy} onClick={() => void remove(m)}>Delete…</button>
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p style={{ padding: "48px 0", color: "var(--ink-3)", textAlign: "center", fontStyle: "italic" }}>
          {query ? "No file names match your search." : "No images yet. Upload one here or from an article."}
        </p>
      ) : null}
      {confirmDialog}
    </>
  );
}
