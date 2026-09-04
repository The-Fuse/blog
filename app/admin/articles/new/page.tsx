import { Writer } from "@/components/admin/Writer";
import { listTopics } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const topics = await listTopics();
  return <Writer topics={topics} />;
}
