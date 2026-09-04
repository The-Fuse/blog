import type { Article } from "../generated/prisma/client";
import { prisma } from "./db";
import { slugify } from "./slug";
import type { ArticleDTO, ArticleInput, Block, Status, Topic } from "./types";

export function toDTO(article: Article): ArticleDTO {
  return {
    id: article.id,
    slug: article.slug,
    kicker: article.kicker,
    title: article.title,
    dek: article.dek,
    topic: article.topic as Topic,
    status: article.status as Status,
    featured: article.featured,
    publishDate: article.publishDate.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    author: article.author,
    leadPlateUrl: article.leadPlateUrl,
    leadPlateCaption: article.leadPlateCaption,
    blocks: (article.blocks as Block[]) ?? [],
  };
}

export async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (true) {
    const found = await prisma.article.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function listPublished() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishDate: "desc" },
  });
  return articles.map(toDTO);
}

export async function getPublishedBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: { slug, status: "published" },
  });
  return article ? toDTO(article) : null;
}

export async function listAll() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return articles.map(toDTO);
}

export async function getById(id: string) {
  const article = await prisma.article.findUnique({ where: { id } });
  return article ? toDTO(article) : null;
}

export async function createArticle(input: ArticleInput) {
  const title = input.title?.trim() || "Untitled";
  const slug = await uniqueSlug(title);
  const article = await prisma.article.create({
    data: {
      slug,
      title,
      kicker: input.kicker ?? "",
      dek: input.dek ?? "",
      topic: input.topic ?? "Philosophy",
      status: input.status ?? "draft",
      featured: input.featured ?? false,
      publishDate: input.publishDate ? new Date(input.publishDate) : new Date(),
      author: input.author ?? "Rohit Yadav",
      leadPlateUrl: input.leadPlateUrl ?? null,
      leadPlateCaption: input.leadPlateCaption ?? "",
      blocks: input.blocks ?? [{ id: crypto.randomUUID(), type: "lede", text: "" }],
    },
  });
  return toDTO(article);
}

export async function updateArticle(id: string, input: ArticleInput) {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return null;

  const title = input.title !== undefined ? input.title.trim() || "Untitled" : existing.title;
  const slug =
    input.title !== undefined ? await uniqueSlug(title, id) : existing.slug;

  if (input.featured) {
    await prisma.article.updateMany({
      where: { featured: true, NOT: { id } },
      data: { featured: false },
    });
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      slug,
      title,
      kicker: input.kicker ?? existing.kicker,
      dek: input.dek ?? existing.dek,
      topic: input.topic ?? existing.topic,
      status: input.status ?? existing.status,
      featured: input.featured ?? existing.featured,
      publishDate: input.publishDate ? new Date(input.publishDate) : existing.publishDate,
      author: input.author ?? existing.author,
      leadPlateUrl: input.leadPlateUrl === undefined ? existing.leadPlateUrl : input.leadPlateUrl,
      leadPlateCaption: input.leadPlateCaption ?? existing.leadPlateCaption,
      blocks: input.blocks ?? (existing.blocks as Block[]),
    },
  });
  return toDTO(article);
}
