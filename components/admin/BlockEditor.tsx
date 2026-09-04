"use client";

import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { BLOCK_META, PALETTE } from "@/lib/blocks";
import type { Block, BlockType } from "@/lib/types";
import { filterPalette, InsertMenu } from "./InsertMenu";
import { TableEditor } from "./TableEditor";

export type FocusRequest = { id: string; pos: "start" | "end" | number; nonce: number };

/** Block types where Enter finishes the block and starts a new paragraph (like a word processor). */
export const TEXT_TYPES: BlockType[] = ["p", "lede", "h3", "chapter", "quote", "key", "warn", "exam", "note"];

/** Inline formatting buttons. `title` is the tooltip and explains what gets typed. */
const FMTS = [
  { key: "i", label: "Italic", title: "Italic — wraps the selection in *…*", before: "*", after: "*", fallback: "italic", color: "var(--ink-2)", style: { fontStyle: "italic" } },
  { key: "b", label: "Bold", title: "Bold — wraps the selection in **…**", before: "**", after: "**", fallback: "bold", color: "var(--ink-2)", style: { fontWeight: 700 } },
  { key: "code", label: "Code", title: "Inline code — wraps the selection in backticks", before: "`", after: "`", fallback: "code", color: "var(--ink-2)", style: { fontFamily: "var(--font-mono)" } },
  { key: "link", label: "Link", title: "Link — [text](https://…). Replace https:// with the address.", before: "[", after: "](https://)", fallback: "text", color: "var(--verd)" },
  { key: "fn", label: "Footnote", title: "Footnote — ^[note]. Shows as a small number; the note is listed at the end of the article.", before: "^[", after: "]", fallback: "your note", color: "var(--copper)" },
  { key: "cite", label: "Reference", title: "Small reference marker — e.g. §Chapter 3 or §Page 23", before: "§", after: "", fallback: "Chapter 3", color: "var(--copper)" },
  { key: "idea", label: "Green term", title: "Highlight a key term in green — {idea:term}", before: "{idea:", after: "}", fallback: "term", color: "var(--verd)" },
  { key: "spirit", label: "Copper term", title: "Highlight a key term in copper — {spirit:term}", before: "{spirit:", after: "}", fallback: "term", color: "var(--copper)" },
  { key: "matter", label: "Grey term", title: "Highlight a key term in grey — {matter:term}", before: "{matter:", after: "}", fallback: "term", color: "var(--ink-3)" },
  { key: "p", label: "Step number", title: "Number this step yourself — e.g. P1, P2. Steps without a number are numbered automatically.", before: "P1 ", after: "", fallback: "", color: "var(--verd)" },
  { key: "concl", label: "Conclusion", title: "Mark this line as the conclusion (∴)", before: "∴ ", after: "", fallback: "", color: "var(--copper)" },
] as const;

const DEFAULT_FMTS = ["i", "b", "code", "link", "fn", "cite", "idea", "spirit", "matter"];

/** Which formatting buttons make sense for each block type. Anything not listed gets the default set. */
const ALLOW: Partial<Record<BlockType, string[]>> = {
  code: [],
  table: [],
  steps: ["i", "code", "cite", "p", "concl"],
  list: DEFAULT_FMTS,
  h3: ["i", "code"],
  chapter: ["i"],
  plate: ["i", "b", "code", "cite"],
  quote: ["i", "cite"],
  note: ["i", "code", "link", "cite"],
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
    case "list":
      return { fontSize: 16, lineHeight: 1.6, background: "var(--panel)", padding: "12px 14px", borderRadius: 2, border: "1px solid var(--rule-2)", whiteSpace: "pre-wrap" };
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

/** Typing one of these at the very start of an empty paragraph turns it into that block type. */
function markdownShortcut(value: string): { type: BlockType; text: string } | null {
  if (/^#{1,2} $/.test(value)) return { type: "chapter", text: "" };
  if (/^#{3,} $/.test(value)) return { type: "h3", text: "" };
  if (/^[-*] $/.test(value)) return { type: "list", text: "" };
  if (/^1[.)] $/.test(value)) return { type: "list", text: "1. " };
  if (/^> $/.test(value)) return { type: "quote", text: "" };
  if (/^```$/.test(value)) return { type: "code", text: "" };
  if (/^!!! $/.test(value)) return { type: "key", text: "" };
  if (/^\| /.test(value) && value.length === 2) return { type: "table", text: "" };
  return null;
}

type Props = {
  block: Block;
  index: number;
  count: number;
  focusReq: FocusRequest | null;
  onChange: (id: string, partial: Partial<Block>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onInsertAfter: (id: string, type: BlockType) => void;
  onSplit: (id: string, before: string, after: string) => void;
  onBackspaceEmpty: (id: string) => void;
  onUpload: (file: File) => Promise<string | null>;
};

function BlockEditorInner({ block, index, count, focusReq, onChange, onRemove, onMove, onInsertAfter, onSplit, onBackspaceEmpty, onUpload }: Props) {
  const meta = BLOCK_META[block.type];
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [insertOpen, setInsertOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);

  const isText = TEXT_TYPES.includes(block.type);
  const slashQuery = isText && block.text.startsWith("/") && !block.text.includes("\n") ? block.text.slice(1) : null;
  const slashItems = slashQuery !== null ? filterPalette(slashQuery) : [];

  // Focus this block when the writer asks for it (after Enter, insert, undo, etc.)
  useEffect(() => {
    if (!focusReq || focusReq.id !== block.id) return;
    const ta = taRef.current;
    if (!ta) return;
    ta.focus();
    const pos = focusReq.pos === "start" ? 0 : focusReq.pos === "end" ? ta.value.length : focusReq.pos;
    ta.setSelectionRange(pos, pos);
  }, [focusReq, block.id]);

  function wrap(before: string, after: string, fallback: string) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      const ta = taRef.current;
      if (!ta) return;
      const s = ta.selectionStart;
      const en = ta.selectionEnd;
      const v = ta.value;
      const sel = v.slice(s, en) || fallback;
      onChange(block.id, { text: v.slice(0, s) + before + sel + after + v.slice(en) });
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(s + before.length, s + before.length + sel.length);
      });
    };
  }

  function pickType(type: BlockType) {
    onChange(block.id, { type, text: type === "list" && block.text.startsWith("/1") ? "1. " : "" });
    setSlashIndex(0);
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function handleChange(value: string) {
    if (isText && value.length > block.text.length) {
      const shortcut = markdownShortcut(value);
      if (shortcut) {
        onChange(block.id, shortcut);
        return;
      }
    }
    if (slashQuery !== null) setSlashIndex(0);
    onChange(block.id, { text: value });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const ta = e.currentTarget;

    // Slash menu navigation
    if (slashQuery !== null && slashItems.length) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % slashItems.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((i) => (i - 1 + slashItems.length) % slashItems.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickType(slashItems[slashIndex]?.type ?? slashItems[0].type);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onChange(block.id, { text: "" });
        return;
      }
    }

    // Cmd/Ctrl+Enter: new paragraph after this block, from any block type (useful to leave code/lists/tables)
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onInsertAfter(block.id, "p");
      return;
    }

    if (isText) {
      // Enter finishes the block and starts a new paragraph; Shift+Enter makes a line break inside it.
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const pos = ta.selectionStart;
        onSplit(block.id, ta.value.slice(0, pos), ta.value.slice(ta.selectionEnd));
        return;
      }
      // Backspace on an empty block removes it and moves the cursor to the previous block.
      if (e.key === "Backspace" && ta.value === "" && count > 1) {
        e.preventDefault();
        onBackspaceEmpty(block.id);
        return;
      }
    }
  }

  const allowed = FMTS.filter((f) => (ALLOW[block.type] ?? DEFAULT_FMTS).includes(f.key));
  const wide = block.type === "table";

  return (
    <div className={`blk-wrap${focused ? " focused" : ""}`}>
      <div id={`blk-${block.id}`} className={`blk${wide ? " wide" : ""}`} style={{ borderLeftColor: meta.edge }}>
        <div style={{ minWidth: 0, position: "relative" }}>
          {meta.labelHint ? (
            <input
              value={block.label || ""}
              onChange={(e) => onChange(block.id, { label: e.target.value })}
              placeholder={meta.labelHint}
              className="mono-sm blk-label"
              style={{ color: meta.accent }}
            />
          ) : null}

          {meta.plate ? (
            <>
              <label
                className="drop-zone wide"
                onDragOver={(e) => e.preventDefault()}
                onDrop={async (e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (!file) return;
                  const url = await onUpload(file);
                  if (url) onChange(block.id, { imageUrl: url });
                }}
              >
                {block.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={block.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span className="mono-sm">Click or drop an image here<br />PNG, JPG, WebP, GIF or SVG · under 5MB</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await onUpload(file);
                    if (url) onChange(block.id, { imageUrl: url });
                  }}
                />
              </label>
              <input
                value={block.imageUrl || ""}
                onChange={(e) => onChange(block.id, { imageUrl: e.target.value.trim() || undefined })}
                placeholder="…or paste an image address, e.g. /uploads/figure-1.svg"
                aria-label="Image address"
                className="mono-sm blk-label"
                style={{ color: "var(--ink-3)", marginBottom: 8 }}
              />
            </>
          ) : null}

          {focused && allowed.length > 0 ? (
            <div className="fmt-bar">
              <span className="mono-sm" style={{ color: "var(--ink-3)", alignSelf: "center", marginRight: 4 }}>Select text, then:</span>
              {allowed.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className="fmt-btn"
                  title={f.title}
                  style={{ color: f.color, ...("style" in f ? f.style : {}) }}
                  onMouseDown={wrap(f.before, f.after, f.fallback)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : null}

          {block.type === "table" ? (
            <TableEditor value={block.text} onChange={(text) => onChange(block.id, { text })} />
          ) : (
            <textarea
              ref={taRef}
              rows={Math.max(1, (block.text || "").split("\n").length)}
              value={block.text}
              placeholder={index === 0 && block.type === "lede" ? meta.hint : isText ? `${meta.hint}  ·  Type / for block types` : meta.hint}
              style={blockStyle(block.type)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}

          {slashQuery !== null ? (
            <InsertMenu
              query={slashQuery}
              highlight={slashIndex}
              title="Turn this block into…"
              onPick={pickType}
              onClose={() => onChange(block.id, { text: "" })}
            />
          ) : null}

          {meta.cite ? (
            <input
              value={block.cite || ""}
              onChange={(e) => onChange(block.id, { cite: e.target.value })}
              placeholder="Who said it, or where it is from — e.g. Berkeley, Principles §23"
              className="mono-sm blk-label"
              style={{ marginTop: 8, color: "var(--copper)" }}
            />
          ) : null}
        </div>

        <div className="mono-sm blk-tools">
          <select
            className="type-select"
            value={block.type}
            title="Change what kind of block this is"
            style={{ color: meta.accent }}
            onChange={(e) => onChange(block.id, { type: e.target.value as BlockType })}
          >
            {PALETTE.map((p) => (
              <option key={p.type} value={p.type}>{p.label}</option>
            ))}
          </select>
          <div className="blk-actions">
            <button type="button" className="ghost" title="Move up" disabled={index === 0} onClick={() => onMove(block.id, -1)}>↑</button>
            <button type="button" className="ghost" title="Move down" disabled={index === count - 1} onClick={() => onMove(block.id, 1)}>↓</button>
            <button type="button" className="ghost" title="Remove this block (you can undo)" onClick={() => onRemove(block.id)}>✕</button>
          </div>
        </div>
      </div>

      {/* Insert a block right here */}
      <div className="blk-insert">
        <button type="button" className="blk-insert-btn" title="Insert a block here" onClick={() => setInsertOpen((v) => !v)}>
          +
        </button>
        {insertOpen ? (
          <InsertMenu
            title="Insert below"
            onPick={(type) => {
              setInsertOpen(false);
              onInsertAfter(block.id, type);
            }}
            onClose={() => setInsertOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}

export const BlockEditor = memo(BlockEditorInner);
