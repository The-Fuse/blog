import { SiteForm } from "@/components/admin/SiteForm";
import { listAll } from "@/lib/articles";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const [site, articles] = await Promise.all([getSite(), listAll()]);
  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
  };
  return <SiteForm site={site} counts={counts} />;
}
