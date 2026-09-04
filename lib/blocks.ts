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

  for (const block of blocks) {
    if (block.type === "chapter") {
      start(block, chapters.length + 1);
      continue;
    }
    if (!current) start({ id: "preface", type: "chapter", text: "", label: "" }, 1);
    const chapter = chapters[chapters.length - 1];
    if (block.type === "note") chapter.notes.push(block);
    else chapter.blocks.push(block);
  }

  return chapters;
}

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
    hint: "Chapter title — one italic verd word if you can.",
    labelHint: "Margin tag — e.g. How to read this",
  },
  lede: {
    kind: "Lede",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "Lede — the chapter’s claim in full, before evidence. Gets the drop cap.",
  },
  p: {
    kind: "Text",
    edge: "transparent",
    accent: "var(--ink-3)",
    hint: "Body paragraph…",
  },
  h3: {
    kind: "Heading",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "Section heading",
  },
  quote: {
    kind: "Quote",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "Primary-source quotation…",
    cite: true,
  },
  key: {
    kind: "Key",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "The claim to remember.",
    labelHint: "Label — e.g. The single sentence to memorise",
  },
  warn: {
    kind: "Warning",
    edge: "var(--verm)",
    accent: "var(--verm)",
    hint: "The common error.",
    labelHint: "Label — e.g. Common error",
  },
  exam: {
    kind: "Exam",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "How a question is likely to be asked.",
    labelHint: "Label — e.g. Examiners ask",
  },
  steps: {
    kind: "Steps",
    edge: "var(--verd)",
    accent: "var(--verd)",
    hint: "One premise per line. Last line is the conclusion (∴).",
  },
  plate: {
    kind: "Plate",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "Caption — what to see, then what it proves.",
    labelHint: "Plate number · title",
    plate: true,
  },
  code: {
    kind: "Code",
    edge: "var(--copper)",
    accent: "var(--copper)",
    hint: "// code",
  },
  note: {
    kind: "Margin",
    edge: "var(--rule)",
    accent: "var(--ink-3)",
    hint: "Margin note — sources, names, cross-references. Apparatus, not argument.",
    labelHint: "Note head — e.g. Citation style",
  },
};

export const PALETTE: { type: BlockType; label: string }[] = [
  { type: "chapter", label: "Chapter" },
  { type: "p", label: "Paragraph" },
  { type: "h3", label: "Heading" },
  { type: "lede", label: "Lede" },
  { type: "quote", label: "Quotation" },
  { type: "key", label: "Key callout" },
  { type: "warn", label: "Warning" },
  { type: "exam", label: "Exam note" },
  { type: "steps", label: "Premise steps" },
  { type: "plate", label: "Plate" },
  { type: "code", label: "Code" },
  { type: "note", label: "Margin note" },
];
