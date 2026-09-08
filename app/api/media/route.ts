import { listMedia } from "@/lib/media";

export async function GET() {
  return Response.json(await listMedia());
}
