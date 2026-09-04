/** Skeleton for the About & site form. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading site settings">
      <div className="skeleton-bar" style={{ width: 200, height: 30, marginTop: 8 }} />
      <div className="skeleton-bar" style={{ width: "100%", height: 64, marginTop: 24 }} />
      <div className="site-form">
        {[44, 150, 44, 44].map((h, i) => (
          <div key={i}>
            <div className="skeleton-bar" style={{ width: 140, height: 10, marginBottom: 8 }} />
            <div className="skeleton-bar" style={{ width: "100%", height: h }} />
          </div>
        ))}
      </div>
    </div>
  );
}
