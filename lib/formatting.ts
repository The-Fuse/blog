/**
 * Toggle an inline format on a text selection.
 *
 * - Plain selection → wrap it: `text` → `**text**`, selecting the inner text.
 * - Already wrapped (markers just outside the selection, or included in it) → unwrap.
 * - Empty selection → insert `before + fallback + after` with the fallback selected.
 * - Prefix-only markers (after === "", e.g. "§" or "∴ ") toggle at the start of the selection.
 * - Links (`[text](url)`) unwrap whatever address was typed.
 */
export function toggleFormat(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  fallback: string,
): { next: string; selStart: number; selEnd: number } {
  const sel = value.slice(start, end);
  const isLink = before === "[";

  // Markers around the selection
  // A single "*" must not be mistaken for one star of a surrounding "**": check the run is exactly one long.
  const runClash = before.length === 1 && after === before && (value[start - before.length - 1] === before || value[end + after.length] === after);
  const leadOk = !runClash && start >= before.length && value.slice(start - before.length, start) === before;
  const trailingLink = isLink ? /^\]\([^)]*\)/.exec(value.slice(end))?.[0] ?? null : null;
  const trailOk = after === "" ? true : isLink ? trailingLink !== null : value.slice(end, end + after.length) === after;
  if (sel.length > 0 && leadOk && trailOk) {
    const removeAfter = after === "" ? 0 : isLink ? (trailingLink as string).length : after.length;
    const next = value.slice(0, start - before.length) + sel + value.slice(end + removeAfter);
    return { next, selStart: start - before.length, selEnd: start - before.length + sel.length };
  }

  // Markers inside the selection
  if (isLink) {
    const m = /^\[([\s\S]*)\]\([^)]*\)$/.exec(sel);
    if (m) {
      const inner = m[1];
      return { next: value.slice(0, start) + inner + value.slice(end), selStart: start, selEnd: start + inner.length };
    }
  } else if (sel.length >= before.length + after.length && sel.startsWith(before) && (after === "" || sel.endsWith(after))) {
    const inner = after === "" ? sel.slice(before.length) : sel.slice(before.length, sel.length - after.length);
    return { next: value.slice(0, start) + inner + value.slice(end), selStart: start, selEnd: start + inner.length };
  }

  // Wrap
  const text = sel || fallback;
  const next = value.slice(0, start) + before + text + after + value.slice(end);
  return { next, selStart: start + before.length, selEnd: start + before.length + text.length };
}
