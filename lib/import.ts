import type { Block, BlockType } from "./types";

export type ImportResult = {
  /** A `# Title` on the very first line, if present. The writer uses it as the article title when that is empty. */
  title: string | null;
  blocks: Block[];
};

function make(type: BlockType, text: string): Block {
  return { id: crypto.randomUUID(), type, text };
}

/**
 * Turn pasted plain text or Markdown into blocks.
 *
 * Rules (kept deliberately small, and documented in the writer):
 * - Blank line          → new paragraph
 * - `# Title` (first line only) → article title
 * - `# ` or `## `       → chapter
 * - `### ` and deeper   → heading
 * - `> text`            → quote
 * - ``` fenced ```      → code
 * - `-` / `*` lists      → bullet list; `1.` lists → numbered list (one item per line)
 * - `| a | b |` rows      → table (first row is the header; `|---|` separator rows are dropped)
 * - `!!! key Label` line  → the next paragraph becomes a Key point box (also `warn`, `exam`)
 * - The first paragraph of the document and of each chapter becomes the opening paragraph.
 */
export function textToBlocks(raw: string): ImportResult {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let title: string | null = null;

  let para: string[] = [];
  let quote: string[] = [];
  let list: string[] = [];
  let table: string[] = [];
  let code: string[] | null = null;
  let openingPending = true;
  // `!!! key Label` / `!!! warn Label` / `!!! exam Label` on its own line makes the next paragraph a callout box.
  let pendingCallout: { type: BlockType; label: string } | null = null;

  const push = (type: BlockType, text: string) => {
    const t = text.trim();
    if (!t) return;
    blocks.push(make(type, t));
    openingPending = false;
  };
  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(" ").trim();
    para = [];
    if (!text) return;
    if (pendingCallout) {
      const block = make(pendingCallout.type, text);
      if (pendingCallout.label) block.label = pendingCallout.label;
      blocks.push(block);
      openingPending = false;
      pendingCallout = null;
      return;
    }
    push(openingPending ? "lede" : "p", text);
  };
  const flushQuote = () => {
    if (!quote.length) return;
    push("quote", quote.join(" "));
    quote = [];
  };
  const flushList = () => {
    if (!list.length) return;
    push("list", list.join("\n"));
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    push("table", table.join("\n"));
    table = [];
  };
  const flushAll = () => {
    flushPara();
    flushQuote();
    flushList();
    flushTable();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (code !== null) {
      if (/^```/.test(line.trim())) {
        blocks.push(make("code", code.join("\n")));
        openingPending = false;
        code = null;
      } else {
        code.push(line);
      }
      continue;
    }

    const t = line.trim();

    if (/^```/.test(t)) {
      flushAll();
      code = [];
      continue;
    }
    if (!t) {
      flushAll();
      continue;
    }

    const callout = t.match(/^!!!\s*(key|warn|exam|note)\b\s*(.*)$/i);
    if (callout) {
      flushAll();
      const kind = callout[1].toLowerCase();
      pendingCallout = { type: (kind === "note" ? "key" : kind) as BlockType, label: callout[2].trim() };
      continue;
    }

    const heading = t.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 1 && title === null && blocks.length === 0) {
        title = text;
      } else if (level <= 2) {
        blocks.push(make("chapter", text));
        openingPending = true;
      } else {
        push("h3", text);
      }
      continue;
    }

    const quoted = t.match(/^>\s?(.*)$/);
    if (quoted) {
      flushPara();
      flushList();
      flushTable();
      quote.push(quoted[1]);
      continue;
    }

    // Markdown-style table row: `| a | b |` or `a | b`. A run of these becomes one table block.
    // A bare `a | b` line only counts when a table is already open or the next line also looks like a row,
    // so a sentence that happens to contain one `|` stays a paragraph.
    const nextHasBar = (lines[i + 1] ?? "").includes("|");
    if (t.includes("|") && (t.startsWith("|") || table.length > 0 || nextHasBar)) {
      flushPara();
      flushQuote();
      flushList();
      table.push(t);
      continue;
    }

    // List item. Numbered markers are kept in the text so the list block renders as an ordered list.
    const item = t.match(/^(\d+[.)]|[-*•])\s+(.+)$/);
    if (item) {
      flushPara();
      flushQuote();
      flushTable();
      list.push(/^\d/.test(item[1]) ? `${item[1]} ${item[2]}` : item[2]);
      continue;
    }

    // Plain line: continues the current paragraph (or quote/list if one is open without a blank line).
    flushTable();
    if (quote.length) {
      quote.push(t);
    } else if (list.length) {
      list[list.length - 1] += ` ${t}`;
    } else {
      para.push(t);
    }
  }

  if (code !== null) {
    blocks.push(make("code", code.join("\n")));
  }
  flushAll();

  return { title, blocks };
}
