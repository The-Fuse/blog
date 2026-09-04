import Link from "next/link";
import { ArticleBody } from "@/components/article/BlockRenderer";
import { ProgressBar } from "@/components/article/ProgressBar";
import { TocNav } from "@/components/article/TocNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { groupChapters } from "@/lib/blocks";
import { articleStats, formatShortDate } from "@/lib/format";
import type { ArticleDTO } from "@/lib/types";

type Props = {
  article: ArticleDTO;
  /** The article to link to at the bottom. Omitted in the admin preview. */
  next?: { slug: string; title: string } | null;
  /** Show the top bar (back link, theme toggle, reading progress). Off in the admin preview. */
  chrome?: boolean;
};

/**
 * The full public article layout: header, contents, body, footer.
 * Used by the public article page and by the live preview in the admin writer,
 * so what the writer sees is exactly what readers get.
 */
export function ArticleView({ article, next = null, chrome = true }: Props) {
  const stats = articleStats(article);
  const toc = groupChapters(article.blocks).filter((c) => c.title);

  return (
    <>
      {chrome ? <ProgressBar /> : null}
      <div className="reader-chrome-bar">
        <div className="reader-frame">
          <div className="reader-chrome">
            {chrome ? <Link href="/">← Rohit Yadav</Link> : <span>Rohit Yadav</span>}
            <span>{article.topic}</span>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span>{stats.minutes} min read</span>
              {chrome ? <ThemeToggle /> : null}
            </div>
          </div>
        </div>
      </div>
      <header className="reader-header">
        <div className="reader-frame">
          <div className={`hero${article.leadPlateUrl || !chrome ? "" : " solo"}`}>
            <div>
              {article.kicker ? (
                <span className="mono" style={{ display: "block", color: "var(--warm)", marginBottom: 28, fontFamily: "var(--font-article-mono)" }}>
                  {article.kicker}
                </span>
              ) : null}
              <h1
                style={{
                  fontSize: "clamp(2.6rem, 5.2vw, 4.4rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                  fontStyle: "italic",
                  fontWeight: 300,
                  marginBottom: "0.35em",
                }}
              >
                {article.title}
              </h1>
              <p style={{ fontSize: "1.15rem", color: "var(--ink-2)", maxWidth: "46ch", lineHeight: 1.5 }}>
                {article.dek}
              </p>
              <div
                style={{
                  marginTop: 32,
                  paddingTop: 16,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  fontSize: "0.9rem",
                  color: "var(--ink-3)",
                }}
              >
                <span>
                  Written by <span style={{ color: "var(--ink)" }}>{article.author}</span>
                </span>
                <span>Published {formatShortDate(article.publishDate)}</span>
              </div>
            </div>
            {/* Readers only see a cover when there is one. The admin preview keeps the placeholder so the writer can see where it would go. */}
            {article.leadPlateUrl || !chrome ? (
              <figure style={{ margin: 0 }}>
                <div className="plate-ph">
                  {article.leadPlateUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.leadPlateUrl} alt="" />
                  ) : (
                    <div className="plate-hatch mono-sm" style={{ fontFamily: "var(--font-article-mono)" }}>
                      cover image (optional)
                    </div>
                  )}
                </div>
                {article.leadPlateCaption ? (
                  <figcaption style={{ marginTop: 12, fontSize: "0.86rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                    {article.leadPlateCaption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </div>
        </div>
      </header>

      <div className="reader-body">
        <TocNav items={toc.map((t) => ({ id: t.id, numeral: t.numeral, title: t.title, tag: t.tag }))} />
        <main className="reader-column">
          <ArticleBody blocks={article.blocks} />
        </main>
      </div>

      <footer style={{ borderTop: "1px solid var(--rule)", background: "var(--panel)", padding: "clamp(36px, 5vw, 56px) clamp(20px, 5vw, 64px)" }}>
        <div className="reader-frame" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end", fontSize: "0.88rem", color: "var(--ink-2)" }}>
          <div>
            {next ? (
              <>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "0.4em", fontFamily: "var(--font-article)" }}>Next in the series</h3>
                <Link href={`/articles/${next.slug}`} style={{ fontSize: "1.05rem" }}>
                  {next.title} →
                </Link>
              </>
            ) : null}
          </div>
          {chrome ? (
            <Link href="/" className="mono-sm" style={{ color: "var(--ink-3)", textDecoration: "none", fontFamily: "var(--font-article-mono)" }}>
              ← All articles
            </Link>
          ) : (
            <span className="mono-sm" style={{ color: "var(--ink-3)", fontFamily: "var(--font-article-mono)" }}>End of preview</span>
          )}
        </div>
      </footer>
    </>
  );
}
