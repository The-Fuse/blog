"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "../ThemeToggle";

type Counts = { all: number; published: number; drafts: number };

/**
 * Chrome for the dashboard pages (article list, About & site, style guide).
 * Desktop: a fixed sidebar. Phones: a compact header with a scrollable tab row.
 * The article writer has its own focused layout and does not use this.
 */
export function AdminShell({
  counts,
  view,
  onView,
  children,
}: {
  counts?: Counts;
  view?: string;
  onView?: (v: string) => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const onKit = pathname.startsWith("/admin/kit");
  const onSite = pathname.startsWith("/admin/site");
  const items = [
    { key: "all", label: "All articles", count: counts?.all, href: "/admin" },
    { key: "published", label: "Published", count: counts?.published, href: "/admin?view=published" },
    { key: "drafts", label: "Drafts", count: counts?.drafts, href: "/admin?view=drafts" },
    { key: "site", label: "About & site", count: undefined, href: "/admin/site" },
    { key: "kit", label: "Style guide", count: undefined, href: "/admin/kit" },
  ];
  const isOn = (key: string) => (onKit ? key === "kit" : onSite ? key === "site" : (view || "all") === key);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const nav = items.map((n) => (
    <Link
      key={n.key}
      href={n.href}
      className={`admin-nav-btn${isOn(n.key) ? " on" : ""}`}
      onClick={(e) => {
        if (["all", "published", "drafts"].includes(n.key) && onView && pathname === "/admin") {
          e.preventDefault();
          onView(n.key);
        }
      }}
    >
      <span>{n.label}</span>
      {n.count !== undefined ? <span className="mono-sm admin-nav-count">{n.count}</span> : null}
    </Link>
  ));

  return (
    <div className="admin-shell">
      {/* Desktop sidebar */}
      <aside className="admin-side">
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", display: "block" }}>Rohit Yadav</span>
          <span className="mono-sm" style={{ color: "var(--copper)" }}>Admin</span>
        </div>
        <Link href="/admin/articles/new" className="primary-btn admin-new">+ New article</Link>
        <nav className="admin-nav">{nav}</nav>
        <div className="admin-side-foot mono-sm">
          <Link href="/" style={{ color: "var(--ink-3)", textDecoration: "none" }}>View site →</Link>
          <button type="button" className="ghost" style={{ letterSpacing: "0.12em", textTransform: "uppercase" }} onClick={signOut}>Sign out</button>
          <ThemeToggle />
        </div>
      </aside>

      {/* Phone header: brand row + scrollable tabs */}
      <header className="admin-topbar">
        <div className="admin-topbar-row">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>Rohit Yadav <span className="mono-sm" style={{ color: "var(--copper)", marginLeft: 6 }}>Admin</span></span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/admin/articles/new" className="primary-btn">+ New</Link>
            <ThemeToggle />
            <button type="button" className="ghost mono-sm" onClick={signOut}>Sign out</button>
          </div>
        </div>
        <nav className="admin-tabs">{nav}</nav>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
