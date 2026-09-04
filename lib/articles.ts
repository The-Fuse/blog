import type { Article } from "../generated/prisma/client";
import { prisma } from "./db";
import { slugify } from "./slug";
import { articleStats, readMinutes } from "./format";
import { DEFAULT_TOPICS, type ArticleDTO, type ArticleInput, type ArticleSummary, type Block, type Status } from "./types";

export function toDTO(article: Article): ArticleDTO {
  return {
    id: article.id,
    slug: article.slug,
    kicker: article.kicker,
    title: article.title,
    dek: article.dek,
    topic: article.topic,
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

/** Column list for summaries: everything except the (large) blocks JSON. */
const SUMMARY_SELECT = {
  id: true, slug: true, kicker: true, title: true, dek: true, topic: true, status: true, featured: true,
  publishDate: true, updatedAt: true, author: true, leadPlateUrl: true, leadPlateCaption: true, wordCount: true,
} as const;

type SummaryRow = Omit<Article, "blocks" | "createdAt">;

export function toSummary(a: SummaryRow): ArticleSummary {
  return {
    id: a.id,
    slug: a.slug,
    kicker: a.kicker,
    title: a.title,
    dek: a.dek,
    topic: a.topic,
    status: a.status as Status,
    featured: a.featured,
    publishDate: a.publishDate.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    author: a.author,
    leadPlateUrl: a.leadPlateUrl,
    leadPlateCaption: a.leadPlateCaption,
    words: a.wordCount,
    minutes: readMinutes(a.wordCount),
  };
}

function countWords(title: string, dek: string, blocks: Block[]) {
  return articleStats({ title, dek, blocks }).words;
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

/** Published articles without bodies, newest first. */
export async function listPublished(): Promise<ArticleSummary[]> {
  const rows = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishDate: "desc" },
    select: SUMMARY_SELECT,
  });
  return rows.map(toSummary);
}

export async function getPublishedBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: { slug, status: "published" },
  });
  return article ? toDTO(article) : null;
}

/** All articles without bodies, most recently edited first (admin list). */
export async function listAll(): Promise<ArticleSummary[]> {
  const rows = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    select: SUMMARY_SELECT,
  });
  return rows.map(toSummary);
}

/** Counts for the admin navigation, in one small query. */
export async function getCounts() {
  const groups = await prisma.article.groupBy({ by: ["status"], _count: { _all: true } });
  const published = groups.find((g) => g.status === "published")?._count._all ?? 0;
  const drafts = groups.find((g) => g.status === "draft")?._count._all ?? 0;
  return { all: published + drafts, published, drafts };
}

/** Every topic in use, plus the defaults, sorted. Used for the topic suggestions in the writer. */
export async function listTopics() {
  const rows = await prisma.article.findMany({
    select: { topic: true },
    distinct: ["topic"],
  });
  const set = new Set([...rows.map((r) => r.topic.trim()).filter(Boolean), ...DEFAULT_TOPICS]);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function getById(id: string) {
  const article = await prisma.article.findUnique({ where: { id } });
  return article ? toDTO(article) : null;
}

export async function createArticle(input: ArticleInput) {
  const title = input.title?.trim() || "Untitled";
  const slug = await uniqueSlug(title);
  const blocks: Block[] = input.blocks ?? [{ id: crypto.randomUUID(), type: "lede", text: "" }];
  const article = await prisma.article.create({
    data: {
      slug,
      title,
      kicker: input.kicker ?? "",
      dek: input.dek ?? "",
      topic: input.topic?.trim() || "General",
      status: input.status ?? "draft",
      featured: input.featured ?? false,
      publishDate: input.publishDate ? new Date(input.publishDate) : new Date(),
      author: input.author ?? "Rohit Yadav",
      leadPlateUrl: input.leadPlateUrl ?? null,
      leadPlateCaption: input.leadPlateCaption ?? "",
      blocks,
      wordCount: countWords(title, input.dek ?? "", blocks),
    },
  });
  return toDTO(article);
}

export async function deleteArticle(id: string) {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return null;
  await prisma.article.delete({ where: { id } });
  return toDTO(existing);
}

export const CONFLICT = Symbol("conflict");

export async function updateArticle(id: string, input: ArticleInput) {
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return null;

  // Refuse to overwrite a newer save from another tab or session. The editor sends the updatedAt it
  // loaded; if the row has moved on, the writer shows a reload prompt instead of clobbering the change.
  if (input.expectedUpdatedAt && input.expectedUpdatedAt !== existing.updatedAt.toISOString()) {
    return CONFLICT;
  }

  const title = input.title !== undefined ? input.title.trim() || "Untitled" : existing.title;
  const slug =
    input.title !== undefined ? await uniqueSlug(title, id) : existing.slug;

  if (input.featured) {
    await prisma.article.updateMany({
      where: { featured: true, NOT: { id } },
      data: { featured: false },
    });
  }

  const nextBlocks: Block[] = input.blocks ?? (existing.blocks as Block[]);
  const article = await prisma.article.update({
    where: { id },
    data: {
      slug,
      title,
      kicker: input.kicker ?? existing.kicker,
      dek: input.dek ?? existing.dek,
      topic: input.topic?.trim() || existing.topic,
      status: input.status ?? existing.status,
      featured: input.featured ?? existing.featured,
      publishDate: input.publishDate ? new Date(input.publishDate) : existing.publishDate,
      author: input.author ?? existing.author,
      leadPlateUrl: input.leadPlateUrl === undefined ? existing.leadPlateUrl : input.leadPlateUrl,
      leadPlateCaption: input.leadPlateCaption ?? existing.leadPlateCaption,
      blocks: nextBlocks,
      wordCount: countWords(title, input.dek ?? existing.dek, nextBlocks),
    },
  });
  return toDTO(article);
}
