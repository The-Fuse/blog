import { revalidatePath } from "next/cache";
import { getSite, updateSite, type SiteInput } from "@/lib/site";

export async function GET() {
  return Response.json(await getSite());
}

export async function PUT(request: Request) {
  const input = (await request.json()) as SiteInput;
  const site = await updateSite(input);
  revalidatePath("/");
  return Response.json(site);
}
