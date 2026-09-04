"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; numeral: string; title: string; tag: string };

/**
 * "Contents" for the article. Sticky on wide screens and highlights the chapter in view;
 * a plain list at the top of the article on narrow screens.
 */
export function TocNav({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = items.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        if (visible.size) {
          // The visible chapter closest to the top of the viewport is the current one.
          const top = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          setActive(top);
        }
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: [0, 0.1, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav className="toc-side" aria-label="Contents">
      <div className="toc-head">Contents</div>
      <ol>
        {items.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`} className={active === t.id ? "on" : ""} aria-current={active === t.id ? "true" : undefined}>
              <span className="toc-n">{t.numeral}</span>
              <span className="toc-t">{t.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
