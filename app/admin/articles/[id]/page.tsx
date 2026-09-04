import { notFound } from "next/navigation";
import { Writer } from "@/components/admin/Writer";
import { getById, listTopics } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, topics] = await Promise.all([getById(id), listTopics()]);
  if (!article) notFound();
  return <Writer article={article} topics={topics} />;
}
