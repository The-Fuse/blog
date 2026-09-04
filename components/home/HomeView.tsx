"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatMonthYear } from "@/lib/format";
import type { ArticleSummary } from "@/lib/types";

export function HomeView({ articles }: { articles: ArticleSummary[] }) {
  const [filter, setFilter] = useState("All");
  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null;
  const filters = useMemo(() => {
    const topics = [...new Set(articles.map((a) => a.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return ["All", ...topics];
  }, [articles]);
  const shown = useMemo(
    () => (filter === "All" ? articles : articles.filter((a) => a.topic === filter)),
    [articles, filter],
  );
  const countLabel = `${shown.length} ${shown.length === 1 ? "article" : "articles"}`;

  return (
    <>
      {featured ? (
        <Link href={`/articles/${featured.slug}`} className="feat">
          <div>
            <span className="mono" style={{ display: "block", color: "var(--copper)", marginBottom: 22 }}>
              Latest · {featured.topic} · {featured.minutes} min
            </span>
            <h1 style={{ fontSize: "clamp(2.6rem, 6vw, 4.4rem)", letterSpacing: "-0.02em", lineHeight: 0.98, marginBottom: "0.4em" }}>
              {featured.title}
            </h1>
            <p style={{ fontSize: "1.08rem", color: "var(--ink-2)", maxWidth: "46ch" }}>{featured.dek}</p>
            <span className="mono" style={{ display: "inline-block", marginTop: 28, color: "var(--verd)" }}>
              Read the edition →
            </span>
          </div>
          <div className="plate-ph">
            {featured.leadPlateUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured.leadPlateUrl} alt="" />
            ) : (
              <div className="plate-hatch mono-sm">lead plate</div>
            )}
          </div>
        </Link>
      ) : null}

      <section id="latest" style={{ padding: "40px 0 0", scrollMarginTop: 24 }}>
        <div className="filter-row">
          <span className="mono" style={{ color: "var(--copper)" }}>
            {countLabel}
          </span>
          <div className="filters mono">
            {filters.map((name) => (
              <button
                key={name}
                type="button"
                className={`filter-btn${filter === name ? " on" : ""}`}
                onClick={() => setFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {shown.map((p) => (
            <Link key={p.id} href={`/articles/${p.slug}`} className="post-row">
              <span className="post-thumb" aria-hidden="true">
                {p.leadPlateUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.leadPlateUrl} alt="" />
                ) : null}
              </span>
              <span>
                <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "1.45rem", lineHeight: 1.2 }}>
                  {p.title}
                </span>
                <span style={{ display: "block", fontSize: "0.95rem", color: "var(--ink-3)", marginTop: 4 }}>{p.dek}</span>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--ink-3)", marginTop: 6 }}>
                  {formatMonthYear(p.publishDate)}
                </span>
              </span>
              <span className="post-row-meta mono-sm" style={{ color: "var(--copper)", whiteSpace: "nowrap" }}>
                {p.topic} · {p.minutes} min
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
