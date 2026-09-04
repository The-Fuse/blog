import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/ArticleView";
import { getPublishedBySlug, listPublished } from "@/lib/articles";

// Rendered once and cached; publishing, editing or deleting an article revalidates these paths.
export const revalidate = 3600;

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
