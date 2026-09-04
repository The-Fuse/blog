const TOKEN =
  /(\*\*[^*]+\*\*|\*[^*]+\*|\{idea:[^}]+\}|\{spirit:[^}]+\}|\{matter:[^}]+\}|\[[^\]]+\]\([^)]+\)|\[\[fn:\d+\]\]|§[A-Za-z]+\s*\d+)/g;

export function InlineMarkup({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ fontWeight: 500, color: "var(--ink)" }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        const idea = part.match(/^\{idea:(.+)\}$/);
        if (idea) return <span key={i} className="pill idea">{idea[1]}</span>;
        const spirit = part.match(/^\{spirit:(.+)\}$/);
        if (spirit) return <span key={i} className="pill spirit">{spirit[1]}</span>;
        const matter = part.match(/^\{matter:(.+)\}$/);
        if (matter) return <span key={i} className="pill matter">{matter[1]}</span>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) return <a key={i} href={link[2]}>{link[1]}</a>;
        const fn = part.match(/^\[\[fn:(\d+)\]\]$/);
        if (fn) {
          return (
            <sup key={i} style={{ fontSize: "0.7em", lineHeight: 0 }}>
              <a href={`#fn${fn[1]}`} style={{ textDecoration: "none", color: "var(--warm)" }}>
                {fn[1]}
              </a>
            </sup>
          );
        }
        if (part.startsWith("§")) {
          return (
            <span key={i} style={{ fontFamily: "var(--font-article-mono)", fontSize: "0.85em", color: "var(--warm)" }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function DropLede({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const first = trimmed[0];
  const rest = trimmed.slice(1);
  return (
    <p className="measure" style={{ fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.55 }}>
      <span className="dropcap">{first}</span>
      <InlineMarkup text={rest} />
    </p>
  );
}

