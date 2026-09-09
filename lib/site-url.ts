export const SITE_NAME = "Rohit Yadav";
export const SITE_DESCRIPTION = "Long-form essays on philosophers and on technical ideas.";

/** Feed discovery link. Metadata merges per top-level key, so any page that sets `alternates` must include this. */
export const FEED_ALTERNATES = { "application/rss+xml": "/feed.xml" };

/** The site's default share card (app/opengraph-image.tsx). */
export const DEFAULT_SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630 };

/**
 * The public origin, used for canonical links, share images and the sitemap.
 * Set SITE_URL once the site has its own domain; on Vercel the production URL is used otherwise.
 */
export function siteUrl(): URL {
  const explicit = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

/** Absolute URL for a path or an already-absolute URL (returned unchanged). */
export function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, siteUrl()).toString();
}
