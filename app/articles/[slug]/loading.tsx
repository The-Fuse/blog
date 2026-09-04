import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Reader loading state: the real top bar, then a skeleton of the hero, contents and text column. */
export default function Loading() {
  return (
    <div className="reader wrap" aria-busy="true" aria-label="Loading article">
      <div className="reader-chrome-bar">
        <div className="reader-frame">
          <div className="reader-chrome">
            <Link href="/">← Rohit Yadav</Link>
            <span className="skeleton-bar" style={{ width: 90, height: 10 }} />
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span className="skeleton-bar" style={{ width: 70, height: 10 }} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
      <header className="reader-header">
        <div className="reader-frame">
          <div className="hero">
            <div>
              <div className="skeleton-bar" style={{ width: "80%", height: 52 }} />
              <div className="skeleton-bar" style={{ width: "60%", height: 52, marginTop: 10 }} />
              <div className="skeleton-bar" style={{ width: "90%", height: 18, marginTop: 28 }} />
              <div className="skeleton-bar" style={{ width: "75%", height: 18, marginTop: 10 }} />
              <div className="skeleton-bar" style={{ width: 240, height: 12, marginTop: 40 }} />
            </div>
            <div className="skeleton-bar" style={{ aspectRatio: "5 / 4", width: "100%" }} />
          </div>
        </div>
      </header>
      <div className="reader-body">
        <aside className="toc-side">
          <div className="toc-head">Contents</div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-bar" style={{ width: `${60 + (i % 3) * 14}%`, height: 12, margin: "14px 0" }} />
          ))}
        </aside>
        <main className="reader-column">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <div key={i} className="skeleton-bar" style={{ width: i % 5 === 4 ? "55%" : `${86 + (i % 3) * 5}%`, height: 16, marginTop: i % 5 === 0 ? 34 : 12 }} />
          ))}
        </main>
      </div>
    </div>
  );
}
