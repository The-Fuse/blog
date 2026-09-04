/** Skeleton for the style guide: a few titled specimen blocks. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading style guide">
      <div className="skeleton-bar" style={{ width: 220, height: 30, marginTop: 8 }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ marginTop: 36 }}>
          <div className="skeleton-bar" style={{ width: 120, height: 10 }} />
          <div className="skeleton-bar" style={{ width: 260, height: 24, marginTop: 10 }} />
          <div className="skeleton-bar" style={{ width: "100%", height: 120, marginTop: 14 }} />
        </div>
      ))}
    </div>
  );
}
