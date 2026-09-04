import Link from "next/link";

/** Writer loading state: the real top bar shape, then a skeleton of the title, subtitle and blocks. */
export default function Loading() {
  return (
    <div className="wr" aria-busy="true" aria-label="Opening the writer">
      <header className="wr-bar">
        <div className="wr-bar-group">
          <Link href="/admin" className="wr-icon" aria-label="Back to all articles" style={{ display: "grid", placeItems: "center", textDecoration: "none" }}>←</Link>
          <span className="skeleton-bar" style={{ width: 54, height: 22, borderRadius: 999 }} />
        </div>
        <div className="wr-bar-group">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="skeleton-bar" style={{ width: 38, height: 38, borderRadius: 6 }} />
          ))}
          <span className="skeleton-bar" style={{ width: 120, height: 38, borderRadius: 2 }} />
        </div>
      </header>
      <div className="wr-body">
        <main className="wr-canvas">
          <div className="wr-doc">
            <div className="wr-head">
              <div className="skeleton-bar" style={{ width: 200, height: 12 }} />
              <div className="skeleton-bar" style={{ width: "70%", height: 44, marginTop: 16 }} />
              <div className="skeleton-bar" style={{ width: "88%", height: 18, marginTop: 18 }} />
            </div>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="skeleton-bar" style={{ width: i % 4 === 3 ? "58%" : `${84 + (i % 3) * 5}%`, height: 17, marginTop: i % 4 === 0 ? 32 : 12 }} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
