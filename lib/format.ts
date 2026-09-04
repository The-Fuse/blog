export function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function wordCount(parts: string[]) {
  return parts.join(" ").split(/\s+/).filter(Boolean).length;
}

export function readMinutes(words: number) {
  return Math.max(1, Math.round(words / 220));
}

export function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function articleStats(article: { title: string; dek: string; blocks: { text?: string }[] }) {
  const words = wordCount([article.title, article.dek, ...article.blocks.map((b) => b.text || "")]);
  return { words, minutes: readMinutes(words) };
}

export function roman(n: number) {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}
