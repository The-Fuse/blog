import { del, list } from "@vercel/blob";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./db";
import type { Block, MediaDTO } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const BLOB_PREFIX = "plates/";

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || null;
}

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/** Display name for a stored key like "plates/1788508028069-o9rjpt.jpg" → "1788508028069-o9rjpt.jpg". */
function nameFromKey(key: string) {
  return key.slice(key.lastIndexOf("/") + 1);
}

export type NewMedia = { url: string; key: string; name: string; contentType: string; size: number };

/** Remembers an upload. Safe to call again for the same URL. */
export async function recordMedia(m: NewMedia) {
  return prisma.media.upsert({
    where: { url: m.url },
    update: { key: m.key, name: m.name, contentType: m.contentType, size: m.size },
    create: m,
  });
}

/**
 * Adds rows for files that exist in storage but were uploaded before the library existed.
 * Reads the Blob store (production) or public/uploads (local) and only ever inserts.
 */
async function reconcileFromStorage() {
  const known = new Set((await prisma.media.findMany({ select: { url: true } })).map((m) => m.url));
  const missing: NewMedia[] = [];
  const token = blobToken();

  if (token) {
    let cursor: string | undefined;
    do {
      const page = await list({ token, prefix: BLOB_PREFIX, cursor, limit: 1000 });
      for (const b of page.blobs) {
        if (known.has(b.url)) continue;
        const ext = path.extname(b.pathname).toLowerCase();
        missing.push({ url: b.url, key: b.pathname, name: nameFromKey(b.pathname), contentType: MIME[ext] ?? "", size: b.size });
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  } else {
    let files: string[] = [];
    try {
      files = await readdir(UPLOAD_DIR);
    } catch {
      files = [];
    }
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (!MIME[ext]) continue;
      const url = `/uploads/${f}`;
      if (known.has(url)) continue;
      const s = await stat(path.join(UPLOAD_DIR, f));
      missing.push({ url, key: f, name: f, contentType: MIME[ext], size: s.size });
    }
  }

  if (missing.length) await prisma.media.createMany({ data: missing, skipDuplicates: true });
}

/** Which articles reference each image URL, from covers and plate blocks. */
async function usageByUrl() {
  const rows = await prisma.article.findMany({
    select: { id: true, title: true, leadPlateUrl: true, leadPlateDarkUrl: true, blocks: true },
  });
  const usage = new Map<string, { id: string; title: string }[]>();
  const add = (url: string | null | undefined, a: { id: string; title: string }) => {
    if (!url) return;
    const list = usage.get(url) ?? [];
    if (!list.some((x) => x.id === a.id)) list.push(a);
    usage.set(url, list);
  };
  for (const r of rows) {
    const a = { id: r.id, title: r.title };
    add(r.leadPlateUrl, a);
    add(r.leadPlateDarkUrl, a);
    for (const b of (r.blocks as Block[]) ?? []) {
      add(b.imageUrl, a);
      add(b.imageDarkUrl, a);
    }
  }
  return usage;
}

/** Every uploaded image, newest first, with the articles that use it. */
export async function listMedia(): Promise<MediaDTO[]> {
  await reconcileFromStorage();
  const [rows, usage] = await Promise.all([
    prisma.media.findMany({ orderBy: { createdAt: "desc" } }),
    usageByUrl(),
  ]);
  return rows.map((m) => ({
    id: m.id,
    url: m.url,
    name: m.name,
    contentType: m.contentType,
    size: m.size,
    createdAt: m.createdAt.toISOString(),
    usedIn: usage.get(m.url) ?? [],
  }));
}

/** Removes the file from storage and forgets it. Returns false when the id is unknown. */
export async function deleteMedia(id: string) {
  const m = await prisma.media.findUnique({ where: { id } });
  if (!m) return false;
  const token = blobToken();
  if (token && /^https?:\/\//.test(m.url)) {
    await del(m.url, { token });
  } else if (m.url.startsWith("/uploads/")) {
    // Only ever delete inside public/uploads, whatever the stored key says.
    const target = path.join(UPLOAD_DIR, path.basename(m.url));
    await unlink(target).catch((err: NodeJS.ErrnoException) => {
      if (err.code !== "ENOENT") throw err;
    });
  }
  await prisma.media.delete({ where: { id } });
  return true;
}
