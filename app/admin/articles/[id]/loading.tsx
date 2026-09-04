export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Opening the writer">
      <div className="skeleton-bar" style={{ width: "100%", height: 42 }} />
      <div className="skeleton-bar" style={{ width: "60%", height: 40, marginTop: 40 }} />
      <div className="skeleton-bar" style={{ width: "90%", height: 18, marginTop: 16 }} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-bar" style={{ width: `${88 - i * 6}%`, height: 16, marginTop: 14 }} />
      ))}
    </div>
  );
}
