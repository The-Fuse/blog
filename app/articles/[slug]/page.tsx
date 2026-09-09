import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/ArticleView";
import { getPublishedBySlug, listPublished } from "@/lib/articles";
import { articleStats } from "@/lib/format";
import { absoluteUrl, DEFAULT_SHARE_IMAGE, FEED_ALTERNATES, isShareableImage, SITE_NAME } from "@/lib/site-url";

// Articles render on first visit and are then cached; saving, publishing or deleting an article
// revalidates the affected paths. Nothing is prerendered at build so the build needs no database
// round-trips per article.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedBySlug(slug);
  if (!article) return { title: "Not found", robots: { index: false } };

  const path = `/articles/${article.slug}`;
  const description = article.dek || `${article.title} — a study edition by ${article.author}.`;
  // WhatsApp, X and LinkedIn need a raster image; an SVG cover falls back to the site card.
  const ownCover = isShareableImage(article.leadPlateUrl);
  const cover = ownCover ? absoluteUrl(article.leadPlateUrl as string) : absoluteUrl(DEFAULT_SHARE_IMAGE.url);
  const images = ownCover
    ? [{ url: cover, alt: article.leadPlateCaption || article.title }]
    : [{ ...DEFAULT_SHARE_IMAGE, url: cover, alt: article.title }];

  return {
    title: article.title,
    description,
    alternates: { canonical: path, types: FEED_ALTERNATES },
    openGraph: {
      type: "article",
      url: path,
      siteName: SITE_NAME,
      title: article.title,
      description,
      publishedTime: article.publishDate,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: article.topic,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [cover],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedBySlug(slug);
  if (!article) notFound();

  const published = await listPublished();
  const idx = published.findIndex((a) => a.id === article.id);
  const next = published[idx + 1] ?? published[idx - 1] ?? null;

  const url = absoluteUrl(`/articles/${article.slug}`);
  const cover = isShareableImage(article.leadPlateUrl) ? absoluteUrl(article.leadPlateUrl) : absoluteUrl(DEFAULT_SHARE_IMAGE.url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    image: [cover],
    datePublished: article.publishDate,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Person", name: SITE_NAME, url: absoluteUrl("/") },
    mainEntityOfPage: url,
    url,
    articleSection: article.topic,
    wordCount: articleStats(article).words,
    inLanguage: "en",
  };

  return (
    <div className="reader wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ArticleView article={article} next={next} />
    </div>
  );
}
