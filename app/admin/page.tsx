import { ArticleList } from "@/components/admin/ArticleList";
import { listAll } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const articles = await listAll();
  return <ArticleList articles={articles} />;
}
