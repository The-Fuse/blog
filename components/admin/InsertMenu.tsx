"use client";

import { useEffect, useRef } from "react";
import { PALETTE } from "@/lib/blocks";
import type { BlockType } from "@/lib/types";

/** Filter the block palette by a typed query (used by the slash menu and the insert button). */
export function filterPalette(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return PALETTE;
  return PALETTE.filter((p) => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.type.includes(q));
}

export function InsertMenu({
  query = "",
  highlight = 0,
  onPick,
  onClose,
  title,
}: {
  query?: string;
  highlight?: number;
  onPick: (type: BlockType) => void;
  onClose: () => void;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const items = filterPalette(query);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="insert-menu" role="menu">
      {title ? <div className="insert-menu-title">{title}</div> : null}
      {items.length === 0 ? <div className="insert-menu-empty">No block matches “{query}”</div> : null}
      {items.map((p, i) => (
        <button
          key={p.type}
          type="button"
          role="menuitem"
          className={`insert-menu-item${i === highlight ? " on" : ""}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(p.type)}
        >
          <span className="insert-menu-label">{p.label}</span>
          <span className="insert-menu-desc">{p.desc}</span>
        </button>
      ))}
    </div>
  );
}
