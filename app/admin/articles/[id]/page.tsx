import { notFound } from "next/navigation";
import { Writer } from "@/components/admin/Writer";
import { getById } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getById(id);
  if (!article) notFound();
  return <Writer article={article} />;
}
