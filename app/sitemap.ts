import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site-url";

// Refreshed hourly and whenever an article is published, edited or deleted.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listPublished();
  const newest = articles[0] ? new Date(articles[0].updatedAt) : new Date();
  return [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "weekly", priority: 1 },
    ...articles.map((a) => ({
      url: absoluteUrl(`/articles/${a.slug}`),
      lastModified: new Date(a.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
