import { extractFootnotes, groupChapters } from "@/lib/blocks";
import type { Block } from "@/lib/types";
import { DropLede, InlineMarkup } from "./InlineMarkup";

function Plate({ block }: { block: Block }) {
  return (
    <figure style={{ margin: "2.4em 0", padding: 0 }}>
      <div className="plate-wide">
        {block.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.imageUrl} alt={block.label || "Plate"} />
        ) : (
          <span className="mono-sm" style={{ color: "var(--ink-3)", padding: 24, textAlign: "center" }}>
            wide plate · full column width
          </span>
        )}
      </div>
      <figcaption
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid var(--rule-2)",
          fontSize: "0.86rem",
          color: "var(--ink-2)",
          lineHeight: 1.5,
          maxWidth: "84ch",
        }}
      >
        {block.label ? (
          <span className="mono-sm" style={{ display: "block", color: "var(--warm)", marginBottom: 4 }}>
            {block.label}
          </span>
        ) : null}
        <InlineMarkup text={block.text} />
      </figcaption>
    </figure>
  );
}

function Steps({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <ol style={{ listStyle: "none", padding: 0, margin: "0 0 1.2em", maxWidth: "68ch" }}>
      {lines.map((line, i) => {
        const isConcl = /^[∴]/.test(line) || i === lines.length - 1 && lines.length > 1;
        const label = line.match(/^(P\d+|∴)\s+(.*)$/);
        const mark = label ? label[1] : isConcl ? "∴" : `P${i + 1}`;
        const body = label ? label[2] : line.replace(/^[∴]\s*/, "");
        return (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, marginBottom: "0.8em", alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "var(--font-article-mono)",
                fontSize: 11,
                color: isConcl ? "var(--warm)" : "var(--accent)",
                border: "1px solid var(--rule)",
                background: "var(--panel)",
                borderRadius: 2,
                padding: "2px 0",
                textAlign: "center",
              }}
            >
              {mark}
            </span>
            <span>
              <InlineMarkup text={body} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function BodyBlock({ block, dropCap }: { block: Block; dropCap: boolean }) {
  switch (block.type) {
    case "lede":
      return dropCap ? <DropLede text={block.text} /> : (
        <p className="measure" style={{ fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.55 }}>
          <InlineMarkup text={block.text} />
        </p>
      );
    case "p":
      return (
        <p className="measure">
          <InlineMarkup text={block.text} />
        </p>
      );
    case "h3":
      return (
        <h3 className="measure" style={{ fontSize: "1.35rem", margin: "2.2em 0 0.6em" }}>
          <span style={{ display: "block", width: 24, height: 1, background: "var(--warm)", marginBottom: "0.8em" }} />
          <InlineMarkup text={block.text} />
        </h3>
      );
    case "quote":
      return (
        <blockquote className="quote">
          <p style={{ marginBottom: "0.5em" }}>
            <InlineMarkup text={block.text} />
          </p>
          {block.cite ? (
            <cite
              style={{
                display: "block",
                fontFamily: "var(--font-article-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--warm)",
                fontStyle: "normal",
                marginTop: "0.8em",
              }}
            >
              {block.cite}
            </cite>
          ) : null}
        </blockquote>
      );
    case "key":
    case "warn":
    case "exam":
      return (
        <div className={`callout ${block.type === "key" ? "" : block.type}`}>
          {block.label ? (
            <span
              className="mono-sm"
              style={{
                display: "block",
                color: block.type === "warn" ? "var(--alert)" : block.type === "exam" ? "var(--warm)" : "var(--accent)",
                marginBottom: 8,
              }}
            >
              {block.label}
            </span>
          ) : null}
          <p style={{ margin: 0 }}>
            <InlineMarkup text={block.text} />
          </p>
        </div>
      );
    case "steps":
      return <Steps text={block.text} />;
    case "plate":
      return <Plate block={block} />;
    case "code":
      return <pre className="code-block">{block.text}</pre>;
    default:
      return null;
  }
}

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  const extracted = extractFootnotes(blocks);
  const chapters = groupChapters(extracted.blocks);

  return (
    <>
      {chapters.map((ch) => (
        <section key={ch.id} id={ch.id} className="chapter">
          <aside className="marg">
            {ch.numeral ? (
              <span style={{ display: "block", fontSize: "2.4rem", lineHeight: 1, color: "var(--warm)", fontStyle: "italic", fontWeight: 300 }}>
                {ch.numeral}
              </span>
            ) : null}
            {ch.tag ? (
              <span
                className="mono"
                style={{ display: "block", color: "var(--ink-3)", margin: "10px 0 24px" }}
              >
                {ch.tag}
              </span>
            ) : null}
            {ch.notes.map((note) => (
              <div
                key={note.id}
                style={{
                  fontSize: "0.82rem",
                  color: "var(--ink-3)",
                  lineHeight: 1.5,
                  borderLeft: "1px solid var(--rule)",
                  paddingLeft: 12,
                  marginBottom: 16,
                }}
              >
                {note.label ? (
                  <b
                    style={{
                      display: "block",
                      fontFamily: "var(--font-article-mono)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--ink-2)",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {note.label}
                  </b>
                ) : null}
                <InlineMarkup text={note.text} />
              </div>
            ))}
          </aside>
          <div style={{ minWidth: 0 }}>
            {ch.title ? (
              <h2 className="measure" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", letterSpacing: "-0.015em", lineHeight: 1.15, marginBottom: "0.6em" }}>
                {ch.title}
              </h2>
            ) : null}
            {ch.blocks.map((block, i) => (
              <BodyBlock key={block.id} block={block} dropCap={block.type === "lede" && i === ch.blocks.findIndex((b) => b.type === "lede")} />
            ))}
          </div>
        </section>
      ))}

      {extracted.notes.length > 0 ? (
        <section id="notes" style={{ padding: "clamp(32px, 4vw, 48px) 0", maxWidth: "68ch", fontSize: "0.86rem", color: "var(--ink-2)", lineHeight: 1.55 }}>
          <span className="mono-sm" style={{ display: "block", color: "var(--warm)", marginBottom: 12 }}>
            Notes
          </span>
          {extracted.notes.map((note) => (
            <p key={note.n} id={`fn${note.n}`} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 8, margin: "0 0 0.6em" }}>
              <span style={{ color: "var(--warm)" }}>{note.n}</span>
              <span>{note.text}</span>
            </p>
          ))}
        </section>
      ) : null}
    </>
  );
}
