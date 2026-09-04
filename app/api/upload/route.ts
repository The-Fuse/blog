import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type) || file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "Use a PNG, JPEG, WebP, GIF, or SVG under 5MB" }, { status: 400 });
  }
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const safe = `plates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext.toLowerCase()}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safe, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return Response.json({ url: blob.url });
  }

  const filename = path.basename(safe);
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/uploads/${filename}` });
}
