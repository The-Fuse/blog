import { SiteForm } from "@/components/admin/SiteForm";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const site = await getSite();
  return <SiteForm site={site} />;
}
