"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArticleView } from "@/components/article/ArticleView";
import { newBlock } from "@/lib/blocks";
import { articleStats, toDateInput } from "@/lib/format";
import { textToBlocks } from "@/lib/import";
import { slugify } from "@/lib/slug";
import type { ArticleDTO, Block, BlockType, Status } from "@/lib/types";
import { AdminShell } from "./AdminShell";
import { BlockEditor, type FocusRequest } from "./BlockEditor";
import { InsertMenu } from "./InsertMenu";

type Draft = {
  kicker: string;
  title: string;
  dek: string;
  topic: string;
  publishDate: string;
  featured: boolean;
  leadPlateUrl: string | null;
  leadPlateCaption: string;
  blocks: Block[];
};

function fromArticle(a?: ArticleDTO | null): Draft {
  return {
    kicker: a?.kicker ?? "",
    title: a?.title ?? "",
    dek: a?.dek ?? "",
    topic: a?.topic ?? "",
    publishDate: a ? toDateInput(a.publishDate) : toDateInput(new Date().toISOString()),
    featured: a?.featured ?? false,
    leadPlateUrl: a?.leadPlateUrl ?? null,
    leadPlateCaption: a?.leadPlateCaption ?? "",
    // A fixed id for the very first block of a new article, so server and client render the same DOM id.
    blocks: a?.blocks?.length ? a.blocks : [{ ...newBlock("lede"), id: "opening" }],
  };
}

const CHEATSHEET: { type: string; result: string }[] = [
  { type: "Enter", result: "finish this paragraph and start a new one" },
  { type: "Shift + Enter", result: "line break inside the same block" },
  { type: "Backspace on an empty block", result: "removes it" },
  { type: "/ at the start of an empty block", result: "menu to change the block type" },
  { type: "## Title", result: "typed at the start becomes a chapter; ### a heading" },
  { type: "- item  ·  1. item  ·  > quote  ·  ```", result: "typed at the start become a list, quote or code block" },
  { type: "Cmd/Ctrl + S", result: "save" },
  { type: "Cmd/Ctrl + Enter", result: "new paragraph below (also works inside code, lists and tables)" },
  { type: "*word*  ·  **word**  ·  `code`", result: "italic, bold, inline code" },
  { type: "[text](https://example.com)", result: "a link" },
  { type: "^[your note]", result: "a footnote number; the note is listed at the end" },
  { type: "{idea:term} · {spirit:term} · {matter:term}", result: "term highlighted in green, copper or grey" },
];

const NEW_TOPIC = "__new__";

function draftToArticle(draft: Draft, id: string | null, author: string, slug: string): ArticleDTO {
  const date = draft.publishDate ? new Date(draft.publishDate) : new Date();
  return {
    id: id ?? "preview",
    slug: slug || "preview",
    kicker: draft.kicker,
    title: draft.title.trim() || "Untitled",
    dek: draft.dek,
    topic: draft.topic.trim() || "General",
    status: "draft",
    featured: draft.featured,
    publishDate: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
    updatedAt: new Date().toISOString(),
    author,
    leadPlateUrl: draft.leadPlateUrl,
    leadPlateCaption: draft.leadPlateCaption,
    blocks: draft.blocks,
  };
}

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

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

function FieldLabel({ children }: { children: string }) {
  return <span className="field-label">{children}</span>;
}

export function Writer({ article, topics }: { article?: ArticleDTO | null; topics: string[] }) {
  const router = useRouter();

  // What the server knows
  const [id, setId] = useState(article?.id ?? null);
  const [savedStatus, setSavedStatus] = useState<Status>(article?.status ?? "draft");
  const [savedSlug, setSavedSlug] = useState(article?.slug ?? null);
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState(article?.updatedAt ?? null);

  // What the author is typing
  const [draft, setDraft] = useState<Draft>(() => fromArticle(article));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(article ? Date.parse(article.updatedAt) : null);
  const [notice, setNotice] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [conflict, setConflict] = useState(false);
  const [backup, setBackup] = useState<{ at: number; draft: Draft } | null>(null);
  const [removed, setRemoved] = useState<{ block: Block; index: number } | null>(null);

  // Editor UI
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [addingTopic, setAddingTopic] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [focusReq, setFocusReq] = useState<FocusRequest | null>(null);
  const nonce = useRef(0);

  const backupKey = `writer-backup-${id ?? "new"}`;
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const requestFocus = useCallback((blockId: string, pos: FocusRequest["pos"]) => {
    nonce.current += 1;
    setFocusReq({ id: blockId, pos, nonce: nonce.current });
  }, []);

  function patch(partial: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setDirty(true);
    setNotice(null);
  }

  // ── Block operations (stable callbacks so each BlockEditor only re-renders when its own block changes)
  const patchBlock = useCallback((blockId: string, next: Partial<Block>) => {
    setDraft((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, ...next } : b)) }));
    setDirty(true);
  }, []);

  const insertAfter = useCallback(
    (blockId: string | null, type: BlockType) => {
      const block = newBlock(type);
      setDraft((d) => {
        const i = blockId ? d.blocks.findIndex((b) => b.id === blockId) : d.blocks.length - 1;
        const blocks = [...d.blocks];
        blocks.splice(i + 1, 0, block);
        return { ...d, blocks };
      });
      setDirty(true);
      requestFocus(block.id, "start");
    },
    [requestFocus],
  );

  const removeBlock = useCallback((blockId: string) => {
    const d = draftRef.current;
    const index = d.blocks.findIndex((b) => b.id === blockId);
    if (index < 0) return;
    const block = d.blocks[index];
    setRemoved(block.text || block.imageUrl ? { block, index } : null);
    // Never leave the article with no blocks; replace the last one with an empty paragraph instead.
    const blocks = d.blocks.length === 1 ? [newBlock("p")] : d.blocks.filter((b) => b.id !== blockId);
    setDraft({ ...d, blocks });
    setDirty(true);
  }, []);

  const undoRemove = useCallback(() => {
    if (!removed) return;
    setDraft((d) => {
      const blocks = [...d.blocks];
      blocks.splice(Math.min(removed.index, blocks.length), 0, removed.block);
      return { ...d, blocks };
    });
    requestFocus(removed.block.id, "end");
    setRemoved(null);
    setDirty(true);
  }, [removed, requestFocus]);

  const moveBlock = useCallback((blockId: string, dir: -1 | 1) => {
    setDraft((d) => {
      const i = d.blocks.findIndex((b) => b.id === blockId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.blocks.length) return d;
      const blocks = [...d.blocks];
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
      return { ...d, blocks };
    });
    setDirty(true);
  }, []);

  const splitBlock = useCallback(
    (blockId: string, before: string, after: string) => {
      const block = newBlock("p");
      block.text = after;
      setDraft((d) => {
        const i = d.blocks.findIndex((b) => b.id === blockId);
        if (i < 0) return d;
        const blocks = [...d.blocks];
        blocks[i] = { ...blocks[i], text: before };
        blocks.splice(i + 1, 0, block);
        return { ...d, blocks };
      });
      setDirty(true);
      requestFocus(block.id, "start");
    },
    [requestFocus],
  );

  const backspaceEmpty = useCallback(
    (blockId: string) => {
      const d = draftRef.current;
      const i = d.blocks.findIndex((b) => b.id === blockId);
      if (i <= 0) return;
      const prevId = d.blocks[i - 1].id;
      setDraft({ ...d, blocks: d.blocks.filter((b) => b.id !== blockId) });
      setDirty(true);
      requestFocus(prevId, "end");
    },
    [requestFocus],
  );

  const upload = useCallback(async (file: File) => {
    try {
      setNotice({ kind: "info", text: "Uploading image…" });
      const url = await uploadFile(file);
      setNotice(null);
      return url;
    } catch (err) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "Upload failed" });
      return null;
    }
  }, []);

  // ── Saving
  async function commit(status: Status, opts: { silent?: boolean } = {}) {
    if (saving || conflict) return;
    setSaving(true);
    if (!opts.silent) setNotice({ kind: "info", text: status === "published" && savedStatus !== "published" ? "Publishing…" : "Saving…" });
    try {
      const payload = { ...draft, status, expectedUpdatedAt: id ? loadedUpdatedAt ?? undefined : undefined };
      const res = await fetch(id ? `/api/articles/${id}` : "/api/articles", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 409) {
        setConflict(true);
        setNotice({ kind: "error", text: "Not saved — this article was changed elsewhere" });
        return;
      }
      if (!res.ok) {
        setNotice({ kind: "error", text: "Save failed — please try again" });
        return;
      }
      const saved = (await res.json()) as ArticleDTO;
      if (!id) {
        // First save of a new article: keep the URL in sync without reloading the page.
        window.history.replaceState(null, "", `/admin/articles/${saved.id}`);
        try {
          localStorage.removeItem("writer-backup-new");
        } catch {}
      }
      setId(saved.id);
      setSavedStatus(saved.status);
      setSavedSlug(saved.slug);
      setLoadedUpdatedAt(saved.updatedAt);
      setLastSavedAt(Date.now());
      setDirty(false);
      setConflict(false);
      try {
        localStorage.removeItem(`writer-backup-${saved.id}`);
      } catch {}
      if (!opts.silent) {
        setNotice({
          kind: "info",
          text: saved.status === "published" ? (status === "published" && savedStatus !== "published" ? "Published" : "Saved and live") : "Draft saved",
        });
      }
    } catch {
      setNotice({ kind: "error", text: "Save failed — check your connection" });
    } finally {
      setSaving(false);
    }
  }
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });

  // Autosave drafts to the server a couple of seconds after typing stops. Published articles are
  // never pushed live automatically; they get a local backup instead and an explicit "Save changes".
  useEffect(() => {
    if (!dirty || saving || conflict || savedStatus !== "draft") return;
    const hasContent = draft.title.trim() || draft.blocks.some((b) => b.text.trim() || b.imageUrl);
    if (!hasContent) return;
    const t = setTimeout(() => void commitRef.current("draft", { silent: true }), 2000);
    return () => clearTimeout(t);
  }, [draft, dirty, saving, conflict, savedStatus]);

  // Local backup of whatever is on screen, so a crash or a stale-save refusal never loses work.
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(backupKey, JSON.stringify({ at: Date.now(), draft }));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [draft, dirty, backupKey]);

  // On open: offer to restore a local backup that is newer than what the server has.
  // Runs after mount (not during render) so server and client markup match.
  const initialKey = useRef(backupKey);
  const initialArticle = useRef(article);
  useEffect(() => {
    const key = initialKey.current;
    const a = initialArticle.current;
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const b = JSON.parse(raw) as { at: number; draft: Draft };
        const serverAt = a ? Date.parse(a.updatedAt) : 0;
        if (b.at > serverAt + 1000 && JSON.stringify(b.draft) !== JSON.stringify(fromArticle(a))) setBackup(b);
        else localStorage.removeItem(key);
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Warn before leaving with unsaved changes; Cmd/Ctrl+S saves.
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void commitRef.current(savedStatus);
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("keydown", onKey);
    };
  }, [dirty, savedStatus]);

  // ── Destructive actions
  function clearAll() {
    if (!window.confirm("Clear the title, subtitle, images and all blocks? Nothing is saved until you save.")) return;
    const empty = fromArticle(null);
    setDraft({ ...empty, topic: draft.topic, publishDate: draft.publishDate });
    setDirty(true);
    setNotice({ kind: "info", text: "Cleared — not saved yet" });
  }

  async function deleteArticle() {
    if (!id || saving) return;
    if (!window.confirm(`Delete "${draft.title || "this article"}" permanently? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setNotice({ kind: "error", text: "Delete failed — please try again" });
        return;
      }
      try {
        localStorage.removeItem(backupKey);
      } catch {}
      setDirty(false);
      router.push("/admin");
      router.refresh();
    } catch {
      setNotice({ kind: "error", text: "Delete failed — check your connection" });
    } finally {
      setSaving(false);
    }
  }

  // ── Paste import
  function runImport(replace: boolean) {
    const parsed = textToBlocks(importText);
    if (!parsed.blocks.length && !parsed.title) return;
    const hasContent = draft.blocks.some((b) => b.text.trim() || b.imageUrl);
    if (replace && hasContent && !window.confirm("Replace everything written so far with the pasted text?")) return;
    const next: Partial<Draft> = {};
    const incoming = [...parsed.blocks];
    if (parsed.title) {
      if (!draft.title.trim()) next.title = parsed.title;
      else incoming.unshift({ ...newBlock("chapter"), text: parsed.title });
    }
    const kept = replace ? [] : draft.blocks.filter((b) => b.text.trim() || b.imageUrl);
    next.blocks = [...kept, ...incoming];
    patch(next);
    setImportText("");
    setImportOpen(false);
    setNotice({ kind: "info", text: `Added ${incoming.length} blocks` });
  }

  // ── Derived
  const stats = articleStats({ title: draft.title, dek: draft.dek, blocks: draft.blocks });
  const slug = slugify(draft.title);
  const isPublished = savedStatus === "published";
  const hasOpening = draft.blocks.some((b) => b.type === "lede" && b.text.trim());
  const images = draft.blocks.filter((b) => b.type === "plate");
  const imagesOk = images.every((b) => b.text.trim() && b.imageUrl);
  const checks = [
    { label: "Title and subtitle filled in", ok: Boolean(draft.title.trim() && draft.dek.trim()) },
    { label: "Has an opening paragraph", ok: hasOpening },
    { label: "Topic chosen", ok: Boolean(draft.topic.trim()) },
    { label: images.length ? "Images have a picture and a caption" : "No images (optional)", ok: images.length === 0 || imagesOk },
  ];
  const outline = useMemo(
    () => [
      { id: "title", text: draft.title || "Untitled", indent: "0" },
      ...draft.blocks
        .filter((b) => b.type === "chapter" || b.type === "h3")
        .map((b) => ({ id: b.id, text: b.text || (b.type === "chapter" ? "Chapter" : "Heading"), indent: b.type === "chapter" ? "0" : "14px" })),
    ],
    [draft.title, draft.blocks],
  );
  const savedTopic = article?.topic?.trim() ?? "";
  const topicOptions = useMemo(() => {
    const set = new Set(topics);
    if (savedTopic) set.add(savedTopic);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [topics, savedTopic]);
  const topicSelectValue = addingTopic ? NEW_TOPIC : topicOptions.includes(draft.topic) ? draft.topic : draft.topic ? NEW_TOPIC : "";
  const previewArticle = mode === "preview" ? draftToArticle(draft, id, article?.author ?? "Rohit Yadav", slug) : null;

  const statusText = notice
    ? notice.text
    : saving
      ? "Saving…"
      : dirty
        ? isPublished
          ? "Unsaved changes — not live yet"
          : "Unsaved changes"
        : lastSavedAt
          ? `Saved ${timeLabel(lastSavedAt)}`
          : "";

  return (
    <AdminShell outline={outline}>
      {/* ── Sticky action bar */}
      <div className="writer-top">
        <div className="writer-top-left">
          <button type="button" className="ghost mono-sm" onClick={() => router.push("/admin")}>← All articles</button>
          <div className="seg" aria-label="Edit or preview">
            <button type="button" className={mode === "edit" ? "on" : ""} onClick={() => setMode("edit")}>Edit</button>
            <button type="button" className={mode === "preview" ? "on" : ""} onClick={() => setMode("preview")}>Preview</button>
          </div>
          <span className={`status-pill${isPublished ? " live" : ""}`}>{isPublished ? "Live" : "Draft"}</span>
        </div>
        <div className="writer-top-right mono">
          <span style={{ color: "var(--ink-3)" }}>{stats.words} words · {stats.minutes} min</span>
          <span className={`save-state${notice?.kind === "error" ? " error" : ""}`}>{statusText}</span>
          {isPublished && savedSlug ? (
            <Link href={`/articles/${savedSlug}`} target="_blank" style={{ color: "var(--verd)" }}>View live →</Link>
          ) : null}
          {isPublished ? (
            <>
              <button type="button" className="secondary-btn" disabled={saving} onClick={() => commit("draft")} title="Take the article off the site and keep it as a draft">Unpublish</button>
              <button type="button" className="primary-btn" disabled={saving || !dirty} onClick={() => commit("published")}>Save changes</button>
            </>
          ) : (
            <>
              <button type="button" className="secondary-btn" disabled={saving} onClick={() => commit("draft")}>Save draft</button>
              <button type="button" className="primary-btn" disabled={saving} onClick={() => commit("published")}>Publish</button>
            </>
          )}
        </div>
      </div>

      {/* ── Notices */}
      {conflict ? (
        <div className="writer-banner danger">
          <b>Your changes were not saved.</b> This article was edited somewhere else after you opened this page. Your text is kept as a local backup.{" "}
          <button type="button" className="link-btn" onClick={() => window.location.reload()}>Reload to get the latest version</button>
        </div>
      ) : null}
      {backup ? (
        <div className="writer-banner">
          <b>Unsaved work found</b> from {timeLabel(backup.at)}, newer than the saved version.{" "}
          <button type="button" className="link-btn" onClick={() => { setDraft(backup.draft); setDirty(true); setBackup(null); }}>Restore it</button>
          {" · "}
          <button type="button" className="link-btn" onClick={() => { try { localStorage.removeItem(backupKey); } catch {} setBackup(null); }}>Discard</button>
        </div>
      ) : null}
      {removed ? (
        <div className="undo-bar">
          <span>Block removed.</span>
          <button type="button" className="link-btn" onClick={undoRemove}>Undo</button>
          <button type="button" className="ghost" aria-label="Dismiss" onClick={() => setRemoved(null)}>✕</button>
        </div>
      ) : null}

      {previewArticle ? (
        <>
          <div className="preview-bar">
            <span>This is how the article will look to readers.{dirty ? " Unsaved changes are shown here but not saved yet." : ""}</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="seg" aria-label="Preview theme">
                <button type="button" className={previewTheme === "light" ? "on" : ""} onClick={() => setPreviewTheme("light")}>Light</button>
                <button type="button" className={previewTheme === "dark" ? "on" : ""} onClick={() => setPreviewTheme("dark")}>Dark</button>
              </div>
              <button type="button" className="secondary-btn" onClick={() => setMode("edit")}>Back to editing</button>
            </div>
          </div>
          <div className={`preview-frame reader${previewTheme === "light" ? " reader-light" : ""}`}>
            <ArticleView article={previewArticle} chrome={false} />
          </div>
        </>
      ) : null}

      {mode === "edit" && !id ? (
        <p className="writer-intro">
          <b>How this works:</b> give the article a title and a subtitle, then just write. Press <b>Enter</b> for a new paragraph, type <b>/</b> on an empty line to pick a block type
          (chapter, heading, quote, table, code…), or paste a whole article at once. Drafts save themselves as you type. <b>Publish</b> puts it on the site.
        </p>
      ) : null}

      <div className="writer-form" hidden={mode !== "edit"}>
        <div style={{ maxWidth: 760, minWidth: 0 }}>
          <div id="blk-title">
            <FieldLabel>Small line above the title (optional)</FieldLabel>
            <input
              value={draft.kicker}
              onChange={(e) => patch({ kicker: e.target.value })}
              placeholder="e.g. Study edition · Part 1"
              className="mono blk-label"
              style={{ color: "var(--copper)", marginBottom: 18 }}
            />
            <FieldLabel>Title</FieldLabel>
            <textarea
              rows={1}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value.replace(/\n/g, "") })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (document.querySelector<HTMLTextAreaElement>("textarea[data-field=dek]") ?? null)?.focus();
                }
              }}
              placeholder="Article title"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", lineHeight: 1.02, marginBottom: 18 }}
            />
            <FieldLabel>Subtitle</FieldLabel>
            <textarea
              rows={1}
              data-field="dek"
              value={draft.dek}
              onChange={(e) => patch({ dek: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  requestFocus(draft.blocks[0]?.id, "start");
                }
              }}
              placeholder="One or two sentences saying what this article is about. Shown under the title and in the article list."
              style={{ fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 36, paddingBottom: 28, borderBottom: "1px solid var(--rule)" }}
            />
          </div>

          <div className="body-head">
            <FieldLabel>Article body</FieldLabel>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="secondary-btn" onClick={() => setImportOpen((v) => !v)}>
                {importOpen ? "Close paste box" : "Paste a whole article"}
              </button>
            </div>
          </div>

          {importOpen ? (
            <div className="import-panel">
              <p style={{ margin: "0 0 10px", fontSize: "0.9rem", color: "var(--ink-2)" }}>
                Paste plain text or Markdown. It is split into blocks you can then edit, reorder, or change the type of.
              </p>
              <ul className="import-rules">
                <li>A blank line starts a new paragraph. <code># Title</code> on the first line becomes the article title.</li>
                <li><code>## Chapter</code> starts a chapter, <code>### Heading</code> a heading, <code>&gt; text</code> a quote, <code>-</code> or <code>1.</code> a list, <code>```</code> a code block.</li>
                <li>Rows with <code>|</code> between cells become a table (first row is the header).</li>
                <li><code>!!! key Remember this</code>, <code>!!! warn Common mistake</code> or <code>!!! exam Exam tip</code> on its own line turns the next paragraph into that box, with the label after the type.</li>
              </ul>
              <textarea
                rows={12}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={"# My article title\n\nThe first paragraph becomes the opening paragraph.\n\n## First chapter\n\nMore paragraphs here…\n\n!!! key Remember this\nThe one thing to take away."}
                style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, background: "var(--panel-2)", border: "1px solid var(--rule)", borderRadius: 2, padding: 12 }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <button type="button" className="primary-btn" disabled={!importText.trim()} onClick={() => runImport(false)}>Add to the end</button>
                <button type="button" className="secondary-btn" disabled={!importText.trim()} onClick={() => runImport(true)}>Replace everything</button>
              </div>
            </div>
          ) : null}

          <div className="blocks">
            {draft.blocks.map((b, i) => (
              <BlockEditor
                key={b.id}
                block={b}
                index={i}
                count={draft.blocks.length}
                focusReq={focusReq && focusReq.id === b.id ? focusReq : null}
                onChange={patchBlock}
                onRemove={removeBlock}
                onMove={moveBlock}
                onInsertAfter={insertAfter}
                onSplit={splitBlock}
                onBackspaceEmpty={backspaceEmpty}
                onUpload={upload}
              />
            ))}
          </div>

          <div className="add-block">
            <button type="button" className="add-block-btn" onClick={() => insertAfter(null, "p")}>+ Paragraph</button>
            <div style={{ position: "relative" }}>
              <button type="button" className="add-block-btn" onClick={() => setAddMenuOpen((v) => !v)}>+ Other block…</button>
              {addMenuOpen ? (
                <InsertMenu
                  title="Add at the end"
                  onPick={(type) => {
                    setAddMenuOpen(false);
                    insertAfter(null, type);
                  }}
                  onClose={() => setAddMenuOpen(false)}
                />
              ) : null}
            </div>
            <span className="field-help" style={{ margin: 0 }}>Or press Enter at the end of any paragraph. Type / on an empty line for block types.</span>
          </div>

          <details className="cheat">
            <summary>Keyboard and formatting cheat sheet</summary>
            <table>
              <thead>
                <tr>
                  <th>Type or press</th>
                  <th>You get</th>
                </tr>
              </thead>
              <tbody>
                {CHEATSHEET.map((row) => (
                  <tr key={row.type}>
                    <td><code>{row.type}</code></td>
                    <td>{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>

        <aside className="writer-side">
          <div className="meta-card">
            <span className="mono-sm" style={{ color: "var(--copper)" }}>Settings</span>
            <label>
              Topic
              <select
                value={topicSelectValue}
                onChange={(e) => {
                  if (e.target.value === NEW_TOPIC) {
                    setAddingTopic(true);
                    patch({ topic: "" });
                  } else {
                    setAddingTopic(false);
                    patch({ topic: e.target.value });
                  }
                }}
              >
                <option value="">Choose a topic…</option>
                {topicOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value={NEW_TOPIC}>+ Add a new topic…</option>
              </select>
              {topicSelectValue === NEW_TOPIC ? (
                <input className="topic-new" autoFocus value={draft.topic} onChange={(e) => patch({ topic: e.target.value })} placeholder="Type the new topic name, e.g. History" />
              ) : null}
              <span className="field-help">Topics group articles and appear as filters on the home page.</span>
            </label>
            <label>
              Web address
              <input value={slug ? `/articles/${slug}` : ""} readOnly placeholder="Made from the title" />
            </label>
            <label>
              Publish date
              <input type="date" value={draft.publishDate} onChange={(e) => patch({ publishDate: e.target.value })} />
            </label>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={draft.featured} onChange={(e) => patch({ featured: e.target.checked })} style={{ accentColor: "var(--verd)", width: "auto", marginTop: 3 }} />
              <span>
                Feature on the home page
                <span className="field-help">Shows this article large at the top. Only one article can be featured.</span>
              </span>
            </label>
          </div>

          <div className="meta-card">
            <span className="mono-sm" style={{ color: "var(--copper)" }}>Cover image (optional)</span>
            <label
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (!file) return;
                const url = await upload(file);
                if (url) patch({ leadPlateUrl: url });
              }}
            >
              {draft.leadPlateUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.leadPlateUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className="mono-sm">Click or drop an image<br />Shown at the top of the article and on the home page</span>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await upload(file);
                  if (url) patch({ leadPlateUrl: url });
                }}
              />
            </label>
            {draft.leadPlateUrl ? (
              <button type="button" className="ghost mono-sm" style={{ alignSelf: "flex-start" }} onClick={() => patch({ leadPlateUrl: null })}>Remove image</button>
            ) : null}
            <input value={draft.leadPlateUrl ?? ""} onChange={(e) => patch({ leadPlateUrl: e.target.value.trim() || null })} placeholder="…or paste an image address" aria-label="Cover image address" />
            <input value={draft.leadPlateCaption} onChange={(e) => patch({ leadPlateCaption: e.target.value })} placeholder="Caption for the cover image (optional)" />
          </div>

          <div className="meta-card" style={{ padding: 0, gap: 0 }}>
            <span className="mono-sm" style={{ display: "block", padding: "12px 14px 6px", color: "var(--copper)" }}>Before you publish</span>
            {checks.map((c) => (
              <div key={c.label} className="check-row">
                <span className={`check-dot${c.ok ? " ok" : ""}`} aria-hidden />
                <span style={{ color: c.ok ? "var(--ink-2)" : "var(--ink)" }}>{c.label}</span>
              </div>
            ))}
            <div className="check-row" style={{ justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-2)" }}>Reading time</span>
              <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{stats.minutes} min</span>
            </div>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--ink-3)" }}>
            Not sure which block to use? The <a href="/admin/kit">style guide</a> shows how each one looks on the page.
          </p>

          <div className="meta-card danger-zone">
            <span className="mono-sm" style={{ color: "var(--verm)" }}>Start over</span>
            <button type="button" className="secondary-btn" onClick={clearAll}>Clear everything</button>
            <span className="field-help">Empties the title, subtitle, images and all blocks on this screen. Nothing changes on the site until you save.</span>
            {id ? (
              <>
                <button type="button" className="secondary-btn danger-btn" disabled={saving} onClick={deleteArticle}>Delete article</button>
                <span className="field-help">Removes this article permanently, including from the live site if it is published.</span>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
