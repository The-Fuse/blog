"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatShortDate } from "@/lib/format";
import type { ArticleDTO } from "@/lib/types";
import { AdminShell } from "./AdminShell";

export function ArticleList({ articles }: { articles: ArticleDTO[] }) {
  const router = useRouter();
  const [view, setView] = useState("all");
  const [query, setQuery] = useState("");

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

  async function toggle(article: ArticleDTO) {
    const status = article.status === "published" ? "draft" : "published";
    await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <AdminShell counts={counts} view={view} onView={setView}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", paddingBottom: 20, borderBottom: "1px solid var(--rule)" }}>
        <div>
          <span className="mono-sm" style={{ color: "var(--copper)" }}>
            {view === "all" ? "All" : view === "published" ? "Published" : "Drafts"}
          </span>
          <h1 style={{ fontSize: "2.2rem", letterSpacing: "-0.015em", marginTop: 6 }}>Articles</h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input className="search" type="search" placeholder="Search titles…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button type="button" className="primary-btn" onClick={() => router.push("/admin/articles/new")}>
            + New article
          </button>
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
        return (
          <div key={r.id} className="admin-row">
            <button type="button" className="ghost" style={{ textAlign: "left", minWidth: 0 }} onClick={() => router.push(`/admin/articles/${r.id}`)}>
              <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "1.15rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink)" }}>
                {r.title}
              </span>
              <span style={{ display: "block", fontSize: "0.85rem", color: "var(--ink-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.dek}
              </span>
            </button>
            <span className="hide-md mono-sm" style={{ color: "var(--copper)" }}>{r.topic}</span>
            <span className="hide-md" style={{ fontSize: "0.88rem", color: "var(--ink-2)" }}>{formatShortDate(r.updatedAt)}</span>
            <span className="mono-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6, color }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              {published ? "Published" : "Draft"}
            </span>
            <div style={{ display: "flex", gap: 12, justifyContent: "end" }} className="mono-sm">
              <button type="button" className="ghost" onClick={() => router.push(`/admin/articles/${r.id}`)}>Edit</button>
              <button type="button" className="ghost" onClick={() => toggle(r)}>{published ? "Unpublish" : "Publish"}</button>
            </div>
          </div>
        );
      })}
      {rows.length === 0 ? (
        <p style={{ padding: "48px 0", color: "var(--ink-3)", textAlign: "center", fontStyle: "italic" }}>Nothing here yet.</p>
      ) : null}
    </AdminShell>
  );
}
