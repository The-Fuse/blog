"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "../ThemeToggle";

type Counts = { all: number; published: number; drafts: number };

export function AdminShell({
  counts,
  view,
  onView,
  outline,
  children,
}: {
  counts?: Counts;
  view?: string;
  onView?: (v: string) => void;
  outline?: { text: string; indent: string }[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const writing = pathname.startsWith("/admin/articles");
  const onKit = pathname.startsWith("/admin/kit");
  const items = [
    { key: "all", label: "All articles", count: counts?.all, href: "/admin" },
    { key: "published", label: "Published", count: counts?.published, href: "/admin?view=published" },
    { key: "drafts", label: "Drafts", count: counts?.drafts, href: "/admin?view=drafts" },
    { key: "editor", label: "Write new", count: "", href: "/admin/articles/new" },
    { key: "kit", label: "Format kit", count: "", href: "/admin/kit" },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", display: "block" }}>Rohit Yadav</span>
          <span className="mono-sm" style={{ color: "var(--copper)" }}>Admin</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "0.95rem" }}>
          {items.map((n) => {
            const on = onKit ? n.key === "kit" : writing ? n.key === "editor" : (view || "all") === n.key;
            return (
              <Link
                key={n.key}
                href={n.href}
                className={`admin-nav-btn${on ? " on" : ""}`}
                onClick={(e) => {
                  if (["all", "published", "drafts"].includes(n.key) && onView && pathname === "/admin") {
                    e.preventDefault();
                    onView(n.key);
                  }
                }}
              >
                <span>{n.label}</span>
                <span className="mono-sm" style={{ color: "var(--ink-3)" }}>{n.count ?? ""}</span>
              </Link>
            );
          })}
        </nav>
        {outline?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="mono-sm" style={{ color: "var(--copper)", marginBottom: 4 }}>Outline</span>
            {outline.map((o, i) => (
              <span key={i} style={{ fontSize: "0.82rem", color: "var(--ink-3)", paddingLeft: o.indent, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {o.text}
              </span>
            ))}
          </div>
        ) : null}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }} className="mono-sm">
          <Link href="/" style={{ color: "var(--ink-3)", textDecoration: "none" }}>View site →</Link>
          <button
            type="button"
            className="ghost"
            style={{ alignSelf: "flex-start", letterSpacing: "0.12em", textTransform: "uppercase" }}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/admin/login");
            }}
          >
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
