/** Skeleton for the article list: heading, search box, then rows. The shell around it stays visible. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading articles">
      <div className="list-head">
        <div className="skeleton-bar" style={{ width: 180, height: 30 }} />
        <div className="skeleton-bar" style={{ width: 220, height: 38 }} />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-bar" style={{ width: `${48 + (i % 3) * 9}%`, height: 20 }} />
          <div className="skeleton-bar" style={{ width: `${70 + (i % 2) * 12}%`, height: 13, marginTop: 9 }} />
          <div className="skeleton-bar" style={{ width: 160, height: 10, marginTop: 9 }} />
        </div>
      ))}
    </div>
  );
}
