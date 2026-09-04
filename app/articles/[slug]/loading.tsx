export default function Loading() {
  return (
    <div className="skeleton-page reader" aria-busy="true" aria-label="Loading article" style={{ maxWidth: 940, margin: "0 auto" }}>
      <div className="skeleton-bar" style={{ width: "100%", height: 14 }} />
      <div className="skeleton-bar" style={{ width: "70%", height: 56, marginTop: 56 }} />
      <div className="skeleton-bar" style={{ width: "85%", height: 18, marginTop: 20 }} />
      <div className="skeleton-bar" style={{ width: "60%", height: 18, marginTop: 10 }} />
    </div>
  );
}
