"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ThemeToggle } from "../ThemeToggle";
import { useConfirm } from "./ConfirmDialog";

type Counts = { all: number; published: number; drafts: number };

/**
 * Chrome for the dashboard pages (article list, About & site, style guide).
 * Desktop: a fixed sidebar. Phones: a compact header with a tab row, a ⋯ menu and a floating "+" button.
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
  const [confirm, confirmDialog] = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function signOut() {
    setMenuOpen(false);
    const ok = await confirm({ title: "Sign out?", message: "You will need your password to get back in.", confirmLabel: "Sign out" });
    if (!ok) return;
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

      {/* Phone header: brand, ⋯ menu, scrollable tabs */}
      <header className="admin-topbar">
        <div className="admin-topbar-row">
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
            Rohit Yadav <span className="mono-sm" style={{ color: "var(--copper)", marginLeft: 6 }}>Admin</span>
          </span>
          <div ref={menuRef} className="row-menu-wrap">
            <button type="button" className="row-menu-btn" aria-label="More options" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>⋯</button>
            {menuOpen ? (
              <div className="row-menu" role="menu">
                <Link href="/" role="menuitem" className="row-menu-link" onClick={() => setMenuOpen(false)}>View site</Link>
                <div className="row-menu-theme">
                  <span>Appearance</span>
                  <ThemeToggle />
                </div>
                <button type="button" role="menuitem" className="danger" onClick={signOut}>Sign out…</button>
              </div>
            ) : null}
          </div>
        </div>
        <nav className="admin-tabs">{nav}</nav>
      </header>

      <main className="admin-main">{children}</main>

      {/* Floating "new article" button on phones */}
      <Link href="/admin/articles/new" className="admin-fab" aria-label="New article" title="New article">+</Link>

      {confirmDialog}
    </div>
  );
}
