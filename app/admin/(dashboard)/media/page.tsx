import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const media = await listMedia();
  return <MediaLibrary initial={media} />;
}
