import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getPublishedBySlug } from "@/lib/articles";
import { absoluteUrl, DEFAULT_SHARE_IMAGE } from "@/lib/site-url";

/**
 * Share image for one article: the cover re-encoded as a small 1200×630 JPEG.
 * WhatsApp, X and LinkedIn refuse SVG and large files (WhatsApp stops around 300–600 KB), so the
 * original cover (SVG or a multi-megabyte PNG) is rasterised, fitted on the paper colour without
 * cropping, and compressed. Cached for a day; saving the article revalidates it, and the article page
 * links to it with a per-save version query so stale copies are never reused.
 */
export const revalidate = 86400;

const WIDTH = 1200;
const HEIGHT = 630;
const PAPER = { r: 245, g: 239, b: 227 };

async function loadCover(url: string): Promise<Buffer | null> {
  if (url.startsWith("/")) {
    // Local upload: only ever read inside public/uploads.
    const file = path.basename(url);
    if (!url.startsWith("/uploads/") || !file) return null;
    return readFile(path.join(process.cwd(), "public", "uploads", file));
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

export async function GET(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const article = await getPublishedBySlug(slug);
  const fallback = () => NextResponse.redirect(absoluteUrl(DEFAULT_SHARE_IMAGE.url), 307);
  if (!article?.leadPlateUrl) return fallback();

  try {
    const input = await loadCover(article.leadPlateUrl);
    if (!input) return fallback();
    // `density` only matters for SVG: rasterise it large enough that the fit below never upscales.
    const jpeg = await sharp(input, { density: 288 })
      .resize(WIDTH, HEIGHT, { fit: "contain", background: PAPER })
      .flatten({ background: PAPER })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    // No hand-set Cache-Control: the framework caches this for `revalidate` and the article's save
    // purges it. The URL also carries a version query, so caches never outlive a cover change.
    return new Response(new Uint8Array(jpeg), {
      headers: { "Content-Type": "image/jpeg", "Content-Length": String(jpeg.length) },
    });
  } catch {
    return fallback();
  }
}
