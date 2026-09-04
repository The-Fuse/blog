import { roman } from "./format";
import type { Block, BlockType } from "./types";

export type ChapterGroup = {
  id: string;
  title: string;
  numeral: string;
  tag: string;
  notes: Block[];
  blocks: Block[];
};

export function newBlock(type: BlockType): Block {
  return { id: crypto.randomUUID(), type, text: "" };
}

export function extractFootnotes(blocks: Block[]) {
  const notes: { n: number; text: string }[] = [];
  const rewritten = blocks.map((block) => {
    const text = (block.text || "").replace(/\^\[([^\]]+)\]/g, (_, note: string) => {
      notes.push({ n: notes.length + 1, text: note });
      return `[[fn:${notes.length}]]`;
    });
    return { ...block, text };
  });
  return { blocks: rewritten, notes };
}

export function groupChapters(blocks: Block[]): ChapterGroup[] {
  const chapters: ChapterGroup[] = [];
  let current: ChapterGroup | null = null;

  const start = (block: Block, index: number) => {
    current = {
      id: block.id,
      title: block.text || "Untitled",
      numeral: block.cite?.trim() || roman(index),
      tag: block.label || "",
      notes: [],
      blocks: [],
    };
    chapters.push(current);
  };

  let numbered = 0;
  for (const block of blocks) {
    if (block.type === "chapter") {
      // Number only real chapters, so an untitled preface never shifts the first chapter to "II".
      start(block, ++numbered);
      continue;
    }
    // Content before the first chapter (or an article with no chapters at all) goes in an
    // untitled, unnumbered preface section so nothing invented shows up on the page.
    if (!current) {
      current = { id: "preface", title: "", numeral: "", tag: "", notes: [], blocks: [] };
      chapters.push(current);
    }
    const chapter = chapters[chapters.length - 1];
    if (block.type === "note") chapter.notes.push(block);
    else chapter.blocks.push(block);
  }

  return chapters;
}

/**
 * How each block type is described inside the writer.
 * `kind` is the short name shown on the block, `hint` is the placeholder for its text,
 * `labelHint` is the placeholder for its optional small heading.
 * Everything here is written for someone who has never seen the site's design language.
 */
export const BLOCK_META: Record<
  BlockType,
  {
    kind: string;
    edge: string;
    accent: string;
    hint: string;
    labelHint?: string;
    cite?: boolean;
    plate?: boolean;
  }
> = {
  chapter: {
    kind: "Chapter",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "Chapter title — starts a new numbered section",
    labelHint: "Short tag shown beside the chapter number (optional) — e.g. How to read this",
  },
  lede: {
    kind: "Opening paragraph",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "Opening paragraph — state the main point of this chapter in a few sentences. Shown larger, with a big first letter.",
  },
  p: {
    kind: "Paragraph",
    edge: "transparent",
    accent: "var(--ink-3)",
    hint: "Write a paragraph…",
  },
  h3: {
    kind: "Heading",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "Heading for a section inside this chapter",
  },
  quote: {
    kind: "Quote",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "The quoted text…",
    cite: true,
  },
  key: {
    kind: "Key point",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "The one thing the reader should remember from this chapter.",
    labelHint: "Small heading for this box (optional) — e.g. Remember this",
  },
  warn: {
    kind: "Warning",
    edge: "var(--verm)",
    accent: "var(--verm)",
    hint: "A common mistake, and why it is wrong.",
    labelHint: "Small heading for this box (optional) — e.g. Common mistake",
  },
  exam: {
    kind: "Exam tip",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "How this topic tends to be asked in an exam, and how to answer.",
    labelHint: "Small heading for this box (optional) — e.g. Exam tip",
  },
  steps: {
    kind: "Numbered steps",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "One step per line. The last line is shown as the conclusion. Start a line with ∴ to mark it as the conclusion yourself.",
  },
  list: {
    kind: "Bullet list",
    edge: "var(--ink-3)",
    accent: "var(--ink-3)",
    hint: "One item per line. Start every line with a number (1. 2. 3.) to get a numbered list instead of bullets.",
  },
  plate: {
    kind: "Image",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "Caption — say what the image shows and why it matters.",
    labelHint: "Image title (optional) — e.g. Figure 1 · The two kinds of thing",
    plate: true,
  },
  code: {
    kind: "Code",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "Paste code here. Shown exactly as typed, in a monospaced font.",
  },
  table: {
    kind: "Table",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "Fill in the cells. Use the buttons below the table to add rows and columns.",
    labelHint: "Table title (optional) — e.g. Table · Berkeley against Locke",
  },
  note: {
    kind: "Side note",
    edge: "var(--rule)",
    accent: "var(--ink-3)",
    hint: "A short note shown in the margin beside the chapter — sources, names, cross-references.",
    labelHint: "Note heading (optional) — e.g. Source",
  },
};

/** The “Add a block” menu, in the order shown. `desc` is the one-line explanation under each button. */
export const PALETTE: { type: BlockType; label: string; desc: string }[] = [
  { type: "chapter", label: "Chapter", desc: "Starts a new numbered section" },
  { type: "lede", label: "Opening paragraph", desc: "Larger intro text with a big first letter" },
  { type: "p", label: "Paragraph", desc: "Normal body text" },
  { type: "h3", label: "Heading", desc: "Sub-heading inside a chapter" },
  { type: "quote", label: "Quote", desc: "Quoted text with a source line" },
  { type: "key", label: "Key point", desc: "Green box for the main takeaway" },
  { type: "warn", label: "Warning", desc: "Red box for a common mistake" },
  { type: "exam", label: "Exam tip", desc: "Copper box for how it might be asked" },
  { type: "list", label: "Bullet list", desc: "Simple bullets, or a numbered list, one per line" },
  { type: "steps", label: "Argument steps", desc: "Premises P1, P2… ending in a conclusion ∴" },
  { type: "plate", label: "Image", desc: "Picture with a caption" },
  { type: "code", label: "Code", desc: "Monospaced code block" },
  { type: "table", label: "Table", desc: "Rows and columns you fill in cell by cell" },
  { type: "note", label: "Side note", desc: "Small note in the margin" },
];

/**
 * Parse a list block's text: one item per line. If every line starts with a number
 * (`1.` or `1)`) the list is ordered and the numbers are stripped; leading `-`, `*`, `•` are stripped too.
 */
export function parseList(text: string): { ordered: boolean; items: string[] } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const ordered = lines.length > 0 && lines.every((l) => /^\d+[.)]\s+/.test(l));
  const items = lines.map((l) => l.replace(/^(?:\d+[.)]|[-*•])\s+/, ""));
  return { ordered, items };
}

/**
 * Parse a table block's text. One row per line, cells separated by `|`.
 * Leading/trailing bars and Markdown separator rows (`|---|---|`) are ignored.
 */
export function parseTable(text: string): { header: string[]; rows: string[][] } {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(l));
  const cells = (line: string) => {
    let l = line;
    if (l.startsWith("|")) l = l.slice(1);
    if (l.endsWith("|")) l = l.slice(0, -1);
    return l.split("|").map((c) => c.trim());
  };
  const [head, ...body] = lines.map(cells);
  return { header: head ?? [], rows: body };
}
