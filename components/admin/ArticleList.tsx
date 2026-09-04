"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatShortDate } from "@/lib/format";
import type { ArticleDTO } from "@/lib/types";
import { AdminShell } from "./AdminShell";

type View = "all" | "published" | "drafts";

function RowMenu({ article, onEdit, onToggle, onDelete }: { article: ArticleDTO; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const published = article.status === "published";

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="row-menu-wrap">
      <button type="button" className="row-menu-btn" aria-label={`Actions for ${article.title}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        ⋯
      </button>
      {open ? (
        <div className="row-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }}>Edit</button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); onToggle(); }}>{published ? "Unpublish" : "Publish"}</button>
          <button type="button" role="menuitem" className="danger" onClick={() => { setOpen(false); onDelete(); }}>Delete…</button>
        </div>
      ) : null}
    </div>
  );
}

export function ArticleList({ articles, initialView = "all" }: { articles: ArticleDTO[]; initialView?: View }) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
  };

  const rows = useMemo(() => {
    let list = articles;
    if (view === "published") list = list.filter((a) => a.status === "published");
    if (view === "drafts") list = list.filter((a) => a.status === "draft");
    if (query) list = list.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [articles, view, query]);

  function edit(article: ArticleDTO) {
    router.push(`/admin/articles/${article.id}`);
  }

  async function toggle(article: ArticleDTO) {
    const publishing = article.status !== "published";
    const ok = window.confirm(
      publishing
        ? `Publish "${article.title}"? It will appear on the site right away.`
        : `Unpublish "${article.title}"? It comes off the site and stays saved as a draft.`,
    );
    if (!ok) return;
    setBusyId(article.id);
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: publishing ? "published" : "draft" }),
      });
      if (!res.ok) window.alert("Could not update the article. Please try again.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(article: ArticleDTO) {
    if (!window.confirm(`Delete "${article.title}" permanently? This cannot be undone.`)) return;
    setBusyId(article.id);
    try {
      const res = await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
      if (!res.ok) window.alert("Could not delete the article. Please try again.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const viewLabel = view === "all" ? "All articles" : view === "published" ? "Published" : "Drafts";

  return (
    <AdminShell counts={counts} view={view} onView={(v) => setView(v as View)}>
      <div className="list-head">
        <div className="list-title">
          <h1>{viewLabel}</h1>
          <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{rows.length} {rows.length === 1 ? "article" : "articles"}</span>
        </div>
        <div className="list-tools">
          <input className="search" type="search" placeholder="Search titles…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search titles" />
          <button type="button" className="primary-btn list-new" onClick={() => router.push("/admin/articles/new")}>+ New article</button>
        </div>
      </div>

      <div className="admin-row head mono-sm">
        <span>Title</span>
        <span className="hide-md">Topic</span>
        <span className="hide-md">Updated</span>
        <span>Status</span>
        <span />
      </div>

      {rows.map((r) => {
        const published = r.status === "published";
        const color = published ? "var(--verd)" : "var(--copper)";
        const busy = busyId === r.id;
        return (
          <div key={r.id} className={`admin-row${busy ? " busy" : ""}`}>
            <button type="button" className="row-main" onClick={() => edit(r)} title="Open in the writer">
              <span className="row-title">{r.title || "Untitled"}</span>
              <span className="row-dek">{r.dek}</span>
              <span className="row-meta mono-sm">
                <span style={{ color }}>{published ? "Published" : "Draft"}</span>
                {r.topic ? <span> · {r.topic}</span> : null}
                <span> · {formatShortDate(r.updatedAt)}</span>
              </span>
            </button>
            <span className="hide-md mono-sm" style={{ color: "var(--copper)" }}>{r.topic}</span>
            <span className="hide-md" style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{formatShortDate(r.updatedAt)}</span>
            <span className="row-status mono-sm" style={{ color }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              {published ? "Published" : "Draft"}
            </span>
            <div className="row-actions mono-sm">
              <button type="button" className="ghost" onClick={() => edit(r)}>Edit</button>
              <button type="button" className="ghost" disabled={busy} onClick={() => toggle(r)}>{published ? "Unpublish" : "Publish"}</button>
              <button type="button" className="ghost danger" disabled={busy} onClick={() => remove(r)}>Delete</button>
            </div>
            <RowMenu article={r} onEdit={() => edit(r)} onToggle={() => toggle(r)} onDelete={() => remove(r)} />
          </div>
        );
      })}
      {rows.length === 0 ? (
        <p style={{ padding: "48px 0", color: "var(--ink-3)", textAlign: "center", fontStyle: "italic" }}>
          {query ? "No titles match your search." : view === "drafts" ? "No drafts. Everything is published." : "Nothing here yet."}
        </p>
      ) : null}
    </AdminShell>
  );
}
