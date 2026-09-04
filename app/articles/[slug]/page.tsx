import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article/BlockRenderer";
import { ProgressBar } from "@/components/article/ProgressBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getPublishedBySlug, listPublished } from "@/lib/articles";
import { groupChapters } from "@/lib/blocks";
import { articleStats, formatShortDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedBySlug(slug);
  if (!article) return { title: "Not found" };
  return { title: article.title, description: article.dek };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedBySlug(slug);
  if (!article) notFound();

  const published = await listPublished();
  const idx = published.findIndex((a) => a.id === article.id);
  const next = published[idx + 1] ?? published[idx - 1] ?? null;
  const stats = articleStats(article);
  const toc = groupChapters(article.blocks).filter((c) => c.title);

  return (
    <div className="reader wrap">
      <ProgressBar />
      <header className="reader-header">
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="reader-chrome">
            <Link href="/">← Rohit Yadav</Link>
            <span>{article.author}</span>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span>{stats.minutes} min read</span>
              <ThemeToggle />
            </div>
          </div>
          <div className="hero">
            <div>
              {article.kicker ? (
                <span className="mono" style={{ display: "block", color: "var(--warm)", marginBottom: 28, fontFamily: "var(--font-article-mono)" }}>
                  {article.kicker}
                </span>
              ) : null}
              <h1
                style={{
                  fontSize: "clamp(3rem, 7.5vw, 5.6rem)",
                  lineHeight: 0.95,
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
                <span>{article.topic}</span>
                <span>Revised {formatShortDate(article.publishDate)}</span>
              </div>
            </div>
            <figure style={{ margin: 0 }}>
              <div className="plate-ph">
                {article.leadPlateUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.leadPlateUrl} alt="" />
                ) : (
                  <div className="plate-hatch mono-sm" style={{ fontFamily: "var(--font-article-mono)" }}>
                    lead plate
                  </div>
                )}
              </div>
              {article.leadPlateCaption ? (
                <figcaption style={{ marginTop: 12, fontSize: "0.86rem", color: "var(--ink-2)", lineHeight: 1.5 }}>
                  {article.leadPlateCaption}
                </figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(20px, 5vw, 64px) 96px", width: "100%" }}>
        {toc.length > 0 ? (
          <nav aria-label="Contents" style={{ padding: "clamp(36px, 5vw, 64px) 0", borderBottom: "1px solid var(--rule)" }}>
            <div className="mono" style={{ color: "var(--warm)", marginBottom: 16, fontFamily: "var(--font-article-mono)" }}>
              Contents
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0 40px" }}>
              {toc.map((t) => (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: "1px solid var(--rule-2)",
                    textDecoration: "none",
                    color: "var(--ink)",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-article-mono)", fontSize: 11, color: "var(--warm)" }}>{t.numeral}</span>
                  <span style={{ fontSize: "1.05rem", lineHeight: 1.3 }}>
                    {t.title}
                    {t.tag ? (
                      <span style={{ display: "block", fontSize: "0.8rem", color: "var(--ink-3)", marginTop: 2 }}>{t.tag}</span>
                    ) : null}
                  </span>
                </a>
              ))}
            </div>
          </nav>
        ) : null}

        <ArticleBody blocks={article.blocks} />
      </main>

      <footer style={{ borderTop: "1px solid var(--rule)", background: "var(--panel)", padding: "clamp(36px, 5vw, 56px) clamp(20px, 5vw, 64px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end", fontSize: "0.88rem", color: "var(--ink-2)" }}>
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
          <Link href="/" className="mono-sm" style={{ color: "var(--ink-3)", textDecoration: "none", fontFamily: "var(--font-article-mono)" }}>
            ← All articles
          </Link>
        </div>
      </footer>
    </div>
  );
}
