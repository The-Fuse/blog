import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/ArticleView";
import { getPublishedBySlug, listPublished } from "@/lib/articles";

// Published articles are prerendered at build and cached; new or edited ones render on demand
// and are cached too. Saving, publishing or deleting an article revalidates the affected paths.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const published = await listPublished();
    return published.map((a) => ({ slug: a.slug }));
  } catch {
    return []; // database unreachable at build time: fall back to rendering on demand
  }
}

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

  return (
    <div className="reader wrap">
      <ArticleView article={article} next={next} />
    </div>
  );
}
