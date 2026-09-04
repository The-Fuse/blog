import { ArticleList } from "@/components/admin/ArticleList";
import { listAll } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const [articles, params] = await Promise.all([listAll(), searchParams]);
  const view = params.view === "published" || params.view === "drafts" ? params.view : "all";
  return <ArticleList articles={articles} view={view} />;
}
