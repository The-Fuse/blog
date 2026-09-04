import { extractFootnotes, groupChapters, parseList, parseTable } from "@/lib/blocks";
import { looksLikeCode, tokenizeLines } from "@/lib/highlight";
import type { Block } from "@/lib/types";
import { DropLede, InlineMarkup } from "./InlineMarkup";

function Plate({ block }: { block: Block }) {
  return (
    <figure style={{ margin: "2.4em 0", padding: 0 }}>
      <div className="plate-wide">
        {block.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.imageUrl} alt={block.label || "Plate"} loading="lazy" decoding="async" />
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

function List({ text }: { text: string }) {
  const { ordered, items } = parseList(text);
  if (!items.length) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="art-list measure">
      {items.map((item, i) => (
        <li key={i}>
          <InlineMarkup text={item} />
        </li>
      ))}
    </Tag>
  );
}

function CodeBlock({ text }: { text: string }) {
  const code = text.replace(/\s+$/, "");
  if (!looksLikeCode(code)) {
    // Diagrams and file trees: monospaced, no colouring, no line numbers.
    return <pre className="code-block code-plain">{code}</pre>;
  }
  const lines = tokenizeLines(code);
  return (
    <pre className="code-block code-ide">
      <code>
        {lines.map((line, i) => (
          <span key={i} className="code-line">
            {line.length ? line.map((tok, j) => (tok.type === "plain" ? tok.text : <span key={j} className={`tok-${tok.type}`}>{tok.text}</span>)) : "\n"}
          </span>
        ))}
      </code>
    </pre>
  );
}

function Table({ block }: { block: Block }) {
  const { header, rows } = parseTable(block.text);
  if (!header.length) return null;
  return (
    <div className="art-table-wrap">
      <table className="art-table">
        {block.label ? <caption className="mono-sm">{block.label}</caption> : null}
        <thead>
          <tr>
            {header.map((h, i) => (
              <th key={i} scope="col">
                <InlineMarkup text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {header.map((_, c) =>
                c === 0 ? (
                  <th key={c} scope="row">
                    <InlineMarkup text={row[c] ?? ""} />
                  </th>
                ) : (
                  <td key={c}>
                    <InlineMarkup text={row[c] ?? ""} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BodyBlock({ block, dropCap }: { block: Block; dropCap: boolean }) {
  switch (block.type) {
    case "lede":
      return dropCap ? <DropLede text={block.text} /> : (
        <p className="measure lede">
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
          {block.text.split(/\n{2,}/).map((para, i) => (
            <p key={i} className="callout-p">
              {para.split("\n").map((line, j) => (
                <span key={j}>
                  {j > 0 ? <br /> : null}
                  <InlineMarkup text={line} />
                </span>
              ))}
            </p>
          ))}
        </div>
      );
    case "steps":
      return <Steps text={block.text} />;
    case "list":
      return <List text={block.text} />;
    case "plate":
      return <Plate block={block} />;
    case "code":
      return <CodeBlock text={block.text} />;
    case "table":
      return <Table block={block} />;
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
        <section key={ch.id} id={ch.id} className={`chapter${ch.title ? "" : " preface"}`}>
          {ch.title ? (
            <header className="chapter-head">
              <span className="chapter-kicker">
                {ch.numeral ? <span className="chapter-num">{ch.numeral}</span> : null}
                {ch.tag ? <span className="chapter-tag">{ch.tag}</span> : null}
              </span>
              <h2>{ch.title}</h2>
            </header>
          ) : null}
          {ch.notes.length ? (
            <aside className="chapter-notes" aria-label="Notes for this chapter">
              {ch.notes.map((note) => (
                <div key={note.id} className="chapter-note">
                  {note.label ? <b>{note.label}</b> : null}
                  <InlineMarkup text={note.text} />
                </div>
              ))}
            </aside>
          ) : null}
          {ch.blocks.map((block, i) => (
            <BodyBlock
              key={block.id}
              block={block}
              // Only the article's own opening gets the drop cap; chapter openings are just set larger.
              dropCap={!ch.title && block.type === "lede" && i === ch.blocks.findIndex((b) => b.type === "lede")}
            />
          ))}
        </section>
      ))}

      {extracted.notes.length > 0 ? (
        <section id="notes" className="notes" style={{ padding: "clamp(32px, 4vw, 48px) 0", fontSize: "0.86rem", color: "var(--ink-2)", lineHeight: 1.55 }}>
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
