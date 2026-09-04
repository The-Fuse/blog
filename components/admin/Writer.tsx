"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { BLOCK_META, newBlock, PALETTE } from "@/lib/blocks";
import { articleStats, toDateInput } from "@/lib/format";
import { slugify } from "@/lib/slug";
import type { ArticleDTO, Block, BlockType, Topic } from "@/lib/types";
import { AdminShell } from "./AdminShell";

type Draft = {
  kicker: string;
  title: string;
  dek: string;
  topic: Topic;
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
    topic: a?.topic ?? "Philosophy",
    publishDate: a ? toDateInput(a.publishDate) : toDateInput(new Date().toISOString()),
    featured: a?.featured ?? false,
    leadPlateUrl: a?.leadPlateUrl ?? null,
    leadPlateCaption: a?.leadPlateCaption ?? "",
    blocks: a?.blocks?.length ? a.blocks : [newBlock("lede")],
  };
}

const FMTS = [
  { key: "i", label: "i", title: "Italic", before: "*", after: "*", fallback: "italic", color: "var(--ink-2)", style: { fontStyle: "italic" } },
  { key: "b", label: "B", title: "Bold", before: "**", after: "**", fallback: "bold", color: "var(--ink-2)", style: { fontWeight: 700 } },
  { key: "link", label: "Link", title: "Hyperlink", before: "[", after: "](https://)", fallback: "text", color: "var(--verd)" },
  { key: "cite", label: "§ Cite", title: "Section reference", before: "§", after: "", fallback: "PHK 23", color: "var(--copper)" },
  { key: "fn", label: "Footnote", title: "Footnote", before: "^[", after: "]", fallback: "note", color: "var(--copper)" },
  { key: "idea", label: "Idea", title: "Pill: idea", before: "{idea:", after: "}", fallback: "term", color: "var(--verd)" },
  { key: "spirit", label: "Spirit", title: "Pill: spirit", before: "{spirit:", after: "}", fallback: "term", color: "var(--copper)" },
  { key: "matter", label: "Matter", title: "Pill: matter", before: "{matter:", after: "}", fallback: "term", color: "var(--ink-3)" },
  { key: "p", label: "P#", title: "Premise marker", before: "P1 ", after: "", fallback: "", color: "var(--verd)" },
  { key: "concl", label: "∴", title: "Conclusion", before: "∴ ", after: "", fallback: "", color: "var(--copper)" },
] as const;

const ALLOW: Partial<Record<BlockType, string[]>> = {
  code: [],
  steps: ["i", "cite", "p", "concl"],
  h3: ["i"],
  chapter: ["i"],
  plate: ["i", "b", "cite"],
  quote: ["i", "cite"],
  note: ["i", "link", "cite"],
};

function blockStyle(type: BlockType): CSSProperties {
  switch (type) {
    case "lede":
      return { fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.55 };
    case "h3":
    case "chapter":
      return { fontFamily: "var(--font-display)", fontSize: "1.32rem", lineHeight: 1.2 };
    case "quote":
      return { fontFamily: "var(--font-display)", fontSize: "1.16rem", lineHeight: 1.5, fontStyle: "italic" };
    case "key":
      return { fontSize: 16, background: "var(--verd-wash)", padding: "12px 14px", borderRadius: 2 };
    case "warn":
      return { fontSize: 16, background: "var(--verm-wash)", padding: "12px 14px", borderRadius: 2 };
    case "exam":
      return { fontSize: 16, background: "var(--copper-wash)", padding: "12px 14px", borderRadius: 2 };
    case "steps":
    case "code":
      return { fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, background: "var(--panel)", padding: "12px 14px", borderRadius: 2, border: "1px solid var(--rule-2)", whiteSpace: "pre" };
    case "note":
      return { fontSize: "0.85rem", color: "var(--ink-3)", lineHeight: 1.5, borderLeft: "2px solid var(--rule)", paddingLeft: 11 };
    case "plate":
      return { fontSize: "0.9rem", color: "var(--ink-2)", lineHeight: 1.5 };
    default:
      return { fontSize: 17, lineHeight: 1.62 };
  }
}

async function uploadFile(file: File) {
  const data = new FormData();
  data.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: data });
  if (!res.ok) throw new Error("Upload failed");
  const json = (await res.json()) as { url: string };
  return json.url;
}

export function Writer({ article }: { article?: ArticleDTO | null }) {
  const router = useRouter();
  const [id, setId] = useState(article?.id ?? null);
  const [draft, setDraft] = useState<Draft>(() => fromArticle(article));
  const [saveState, setSaveState] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  function patch(partial: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...partial }));
    setSaveState("Unsaved");
  }

  function patchBlock(blockId: string, next: Partial<Block>) {
    setDraft((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === blockId ? { ...b, ...next } : b)),
    }));
    setSaveState("Unsaved");
  }

  function wrap(blockId: string, before: string, after: string, fallback: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      const ta = taRef.current;
      if (!ta || active !== blockId) return;
      const s = ta.selectionStart;
      const en = ta.selectionEnd;
      const v = ta.value;
      const sel = v.slice(s, en) || fallback;
      const next = v.slice(0, s) + before + sel + after + v.slice(en);
      patchBlock(blockId, { text: next });
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(s + before.length, s + before.length + sel.length);
      });
    };
  }

  async function commit(status: "draft" | "published") {
    const payload = { ...draft, status };
    const res = await fetch(id ? `/api/articles/${id}` : "/api/articles", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setSaveState("Save failed");
      return;
    }
    const saved = (await res.json()) as ArticleDTO;
    setId(saved.id);
    setSaveState(status === "published" ? "Published" : "Draft saved");
    if (!id) router.replace(`/admin/articles/${saved.id}`);
    router.refresh();
  }

  const stats = articleStats({ title: draft.title, dek: draft.dek, blocks: draft.blocks });
  const hasLede = draft.blocks.some((b) => b.type === "lede" && b.text.trim());
  const plates = draft.blocks.filter((b) => b.type === "plate");
  const platesOk = plates.every((b) => b.text.trim() && (b.label || "").trim());
  const slug = slugify(draft.title);
  const outline = [
    { text: draft.title || "Untitled", indent: "0" },
    ...draft.blocks
      .filter((b) => b.type === "h3" || b.type === "plate" || b.type === "lede" || b.type === "chapter")
      .map((b) => ({
        text: b.type === "plate" ? b.label || "Plate" : b.type === "lede" ? "Lede" : b.text || (b.type === "chapter" ? "Chapter" : "Heading"),
        indent: "12px",
      })),
  ];
  const checks = [
    { label: "Title and dek", state: draft.title && draft.dek ? "ok" : "missing", color: draft.title && draft.dek ? "var(--verd)" : "var(--copper)" },
    { label: "Opens with a lede", state: hasLede ? "ok" : "missing", color: hasLede ? "var(--verd)" : "var(--copper)" },
    { label: "Plates captioned", state: plates.length ? (platesOk ? "ok" : "incomplete") : "none", color: plates.length ? (platesOk ? "var(--verd)" : "var(--copper)") : "var(--ink-3)" },
    { label: "Read time", state: `${stats.minutes} min`, color: "var(--ink-3)" },
  ];

  const allowed = useMemo(() => {
    const type = draft.blocks.find((b) => b.id === active)?.type;
    if (!type) return [];
    const keys = ALLOW[type] ?? ["i", "b", "link", "cite", "fn", "idea", "spirit", "matter"];
    return FMTS.filter((f) => keys.includes(f.key));
  }, [active, draft.blocks]);

  return (
    <AdminShell outline={outline}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, flexWrap: "wrap", paddingBottom: 16, borderBottom: "1px solid var(--rule)" }}>
        <button type="button" className="ghost mono-sm" onClick={() => router.push("/admin")}>
          ← Articles
        </button>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }} className="mono">
          <span style={{ color: "var(--ink-3)" }}>{stats.words} words · {stats.minutes} min</span>
          <span style={{ color: "var(--ink-3)" }}>{saveState}</span>
          <button type="button" className="secondary-btn" onClick={() => commit("draft")}>Save draft</button>
          <button type="button" className="primary-btn" onClick={() => commit("published")}>Publish</button>
        </div>
      </div>

      <div className="writer-form">
        <div style={{ maxWidth: 760, minWidth: 0 }}>
          <input
            value={draft.kicker}
            onChange={(e) => patch({ kicker: e.target.value })}
            placeholder="Kicker — e.g. The whole system in four words"
            className="mono"
            style={{ width: "100%", border: "none", outline: "none", color: "var(--copper)", marginBottom: 18, background: "transparent" }}
          />
          <textarea
            rows={2}
            value={draft.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="Title"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em", lineHeight: 1.02, marginBottom: 18 }}
          />
          <textarea
            rows={2}
            value={draft.dek}
            onChange={(e) => patch({ dek: e.target.value })}
            placeholder="Dek — one or two sentences that state the claim."
            style={{ fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 36, paddingBottom: 28, borderBottom: "1px solid var(--rule)" }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {draft.blocks.map((b, i) => {
              const meta = BLOCK_META[b.type];
              return (
                <div key={b.id} className="blk" style={{ borderLeftColor: meta.edge }}>
                  <div style={{ minWidth: 0 }}>
                    {meta.labelHint ? (
                      <input
                        value={b.label || ""}
                        onChange={(e) => patchBlock(b.id, { label: e.target.value })}
                        placeholder={meta.labelHint}
                        className="mono-sm"
                        style={{ display: "block", width: "100%", border: "none", outline: "none", marginBottom: 6, color: meta.accent, background: "transparent" }}
                      />
                    ) : null}
                    {meta.plate ? (
                      <label
                        className="drop-zone wide"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files[0];
                          if (file) patchBlock(b.id, { imageUrl: await uploadFile(file) });
                        }}
                      >
                        {b.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span className="mono-sm">drop svg / png for this plate<br />filled = idea · outline = spirit · dashed = matter</span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = await uploadFile(file);
                            patchBlock(b.id, { imageUrl: url });
                          }}
                        />
                      </label>
                    ) : null}
                    {active === b.id && allowed.length > 0 ? (
                      <div className="fmt-bar">
                        {allowed.map((f) => (
                          <button
                            key={f.key}
                            type="button"
                            className="fmt-btn"
                            title={f.title}
                            style={{ color: f.color, ...("style" in f ? f.style : {}) }}
                            onMouseDown={wrap(b.id, f.before, f.after, f.fallback)}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <textarea
                      rows={Math.max(2, (b.text || "").split("\n").length)}
                      value={b.text}
                      placeholder={meta.hint}
                      style={blockStyle(b.type)}
                      onFocus={(e) => {
                        taRef.current = e.target;
                        setActive(b.id);
                      }}
                      onChange={(e) => patchBlock(b.id, { text: e.target.value })}
                    />
                    {meta.cite ? (
                      <input
                        value={b.cite || ""}
                        onChange={(e) => patchBlock(b.id, { cite: e.target.value })}
                        placeholder="Source — e.g. Principles §23"
                        className="mono-sm"
                        style={{ display: "block", width: "100%", border: "none", outline: "none", marginTop: 8, color: "var(--copper)", background: "transparent" }}
                      />
                    ) : null}
                  </div>
                  <div className="mono-sm" style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", color: "var(--ink-3)" }}>
                    <span style={{ color: meta.accent }}>{meta.kind}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="ghost" disabled={i === 0} onClick={() => {
                        if (i === 0) return;
                        const next = [...draft.blocks];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        patch({ blocks: next });
                      }}>↑</button>
                      <button type="button" className="ghost" disabled={i === draft.blocks.length - 1} onClick={() => {
                        if (i === draft.blocks.length - 1) return;
                        const next = [...draft.blocks];
                        [next[i + 1], next[i]] = [next[i], next[i + 1]];
                        patch({ blocks: next });
                      }}>↓</button>
                      <button type="button" className="ghost" onClick={() => patch({ blocks: draft.blocks.filter((x) => x.id !== b.id) })}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--rule-2)" }}>
            <span className="mono-sm" style={{ display: "block", color: "var(--ink-3)", marginBottom: 10 }}>Add a block</span>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-3)", margin: "0 0 14px" }}>
              Inline formatting: select text and use the toolbar, or type <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>*italic*</span>{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>**bold**</span>{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>[text](url)</span>{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>{"{idea:term}"}</span>{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>{"^[footnote]"}</span>{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>§PHK 23</span>.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PALETTE.map((p) => (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => patch({ blocks: [...draft.blocks, newBlock(p.type)] })}
                  style={{ cursor: "pointer", background: "var(--panel)", border: "1px solid var(--rule)", borderRadius: 2, padding: "6px 11px", fontSize: "0.88rem", color: "var(--ink-2)" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="meta-card">
            <span className="mono-sm" style={{ color: "var(--copper)" }}>Metadata</span>
            <label>
              Topic
              <select value={draft.topic} onChange={(e) => patch({ topic: e.target.value as Topic })}>
                <option>Philosophy</option>
                <option>Technical</option>
              </select>
            </label>
            <label>
              Slug
              <input value={slug} readOnly />
            </label>
            <label>
              Publish date
              <input type="date" value={draft.publishDate} onChange={(e) => patch({ publishDate: e.target.value })} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", cursor: "pointer" }}>
              <input type="checkbox" checked={draft.featured} onChange={(e) => patch({ featured: e.target.checked })} style={{ accentColor: "var(--verd)" }} />
              Feature on home
            </label>
          </div>
          <div className="meta-card">
            <span className="mono-sm" style={{ color: "var(--copper)" }}>Lead plate</span>
            <label
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) patch({ leadPlateUrl: await uploadFile(file) });
              }}
            >
              {draft.leadPlateUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.leadPlateUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className="mono-sm">drop svg / png<br />shown on home</span>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  patch({ leadPlateUrl: await uploadFile(file) });
                }}
              />
            </label>
            <input
              value={draft.leadPlateCaption}
              onChange={(e) => patch({ leadPlateCaption: e.target.value })}
              placeholder="Caption"
            />
          </div>
          <div className="meta-card" style={{ padding: 0, gap: 0 }}>
            <span className="mono-sm" style={{ display: "block", padding: "12px 14px 6px", color: "var(--copper)" }}>Before publishing</span>
            {checks.map((c) => (
              <div key={c.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 14px", borderTop: "1px solid var(--rule-2)", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--ink-2)" }}>{c.label}</span>
                <span className="mono-sm" style={{ color: c.color, whiteSpace: "nowrap" }}>{c.state}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--ink-3)" }}>
            Blocks follow the <a href="/admin/kit">format kit</a>. Diagrams use the visual grammar; the margin holds apparatus, not argument.
          </p>
        </aside>
      </div>
    </AdminShell>
  );
}
