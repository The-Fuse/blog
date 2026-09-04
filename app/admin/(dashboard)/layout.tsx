import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCounts } from "@/lib/articles";

export const dynamic = "force-dynamic";

/** Dashboard chrome (sidebar / phone tabs) shared by the list, About and style guide pages. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const counts = await getCounts();
  return <AdminShell counts={counts}>{children}</AdminShell>;
}
