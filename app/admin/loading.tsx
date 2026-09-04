export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading">
      <div className="skeleton-bar" style={{ width: "40%", height: 28 }} />
      <div className="skeleton-bar" style={{ width: "100%", height: 44, marginTop: 20 }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-bar" style={{ width: "55%", height: 20 }} />
          <div className="skeleton-bar" style={{ width: "80%", height: 14, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}
