import { SiteForm } from "@/components/admin/SiteForm";
import { getCounts } from "@/lib/articles";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const [site, counts] = await Promise.all([getSite(), getCounts()]);
  return <SiteForm site={site} counts={counts} />;
}
