/**
 * Small language-agnostic tokenizer for code blocks. Articles don't record a language per block,
 * so this colours the things that look the same in most languages: comments, strings, numbers,
 * keywords, type names, function calls, annotations and command-line flags.
 */

export type TokenType = "kw" | "str" | "num" | "com" | "type" | "fn" | "attr" | "punct" | "plain";
export type Token = { type: TokenType; text: string };

const KEYWORDS = new Set(
  (
    "fun val var class interface object data sealed enum private public internal protected override open abstract " +
    "import package return if else when for while do break continue in is as get set const lateinit by init this super " +
    "null true false try catch finally throw suspend inline companion typealias where " +
    "function const let async await new export default from extends implements type instanceof typeof void yield " +
    "def elif except lambda pass with not and or None True False " +
    "static final int long float double boolean String void " +
    "echo export cd for done then fi local"
  ).split(/\s+/),
);

const TOKEN_RE = new RegExp(
  [
    String.raw`\/\*[\s\S]*?\*\/`, // block comment
    String.raw`"(?:[^"\\\n]|\\.)*"`, // strings
    String.raw`'(?:[^'\\\n]|\\.)*'`,
    "`(?:[^`\\\\]|\\\\.)*`",
    String.raw`(?<!:)\/\/[^\n]*`, // line comment, but not the // in https://
    String.raw`(?<=^|\s)#[^\n]*`, // shell / python comment
    String.raw`@[A-Za-z_]\w*`, // annotation
    String.raw`(?<![\w-])--?[A-Za-z][\w-]*`, // command-line flag
    String.raw`\b\d[\w.]*`, // number
    String.raw`[A-Za-z_$][\w$]*`, // identifier
    String.raw`[{}()\[\];,.<>=+\-*/%!&|?:^~]+`, // punctuation
    String.raw`\s+|.`, // anything else
  ].join("|"),
  "gm",
);

/**
 * Blocks that are drawings or file trees rather than code: box-drawing characters, arrows,
 * or almost no syntax characters. Those are shown plain.
 */
export function looksLikeCode(text: string): boolean {
  const drawing = (text.match(/[─-╿←-⇿■-◿]/g) || []).length;
  if (drawing >= 4) return false;
  // File trees and column listings: most lines are "path   description" with aligned columns.
  const lines = text.split("\n").filter((l) => l.trim());
  const listing = lines.filter((l) => /^\s*[\w.\-/…]+\/?\s{2,}\S/.test(l)).length;
  if (lines.length >= 3 && listing / lines.length >= 0.4) return false;
  const syntax = (text.match(/[{}()=;"'`]/g) || []).length;
  const shellComment = /(^|\n)\s*#\s/.test(text);
  return syntax >= 3 || shellComment;
}

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    const t = m[0];
    if (t.length === 0) {
      TOKEN_RE.lastIndex++;
      continue;
    }
    out.push({ type: classify(t, text, m.index), text: t });
  }
  return out;
}

function classify(t: string, src: string, at: number): TokenType {
  const c = t[0];
  if (t.startsWith("/*") || t.startsWith("//") || c === "#") return "com";
  if (c === '"' || c === "'" || c === "`") return "str";
  if (c === "@") return "attr";
  if (/^--?[A-Za-z]/.test(t)) return "attr";
  if (/^\d/.test(t)) return "num";
  if (/^[A-Za-z_$]/.test(t)) {
    if (KEYWORDS.has(t)) return "kw";
    // a call: identifier immediately followed by "("
    const after = src.slice(at + t.length, at + t.length + 2);
    if (/^\s?\(/.test(after)) return "fn";
    if (/^[A-Z]/.test(t) && !/^[A-Z0-9_]+$/.test(t)) return "type"; // CamelCase, not CONSTANT
    return "plain";
  }
  if (/^[{}()\[\];,.<>=+\-*/%!&|?:^~]+$/.test(t)) return "punct";
  return "plain";
}

/** Tokens grouped by line, so the renderer can number lines. */
export function tokenizeLines(text: string): Token[][] {
  const lines: Token[][] = [[]];
  for (const tok of tokenize(text)) {
    const parts = tok.text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ type: tok.type, text: part });
    });
  }
  // Drop a trailing empty line left by a final newline
  if (lines.length > 1 && lines[lines.length - 1].length === 0) lines.pop();
  return lines;
}
