import { revalidatePath } from "next/cache";
import { getById, updateArticle } from "@/lib/articles";
import type { ArticleInput } from "@/lib/types";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const article = await getById(id);
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(article);
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const input = (await request.json()) as ArticleInput;
  const article = await updateArticle(id, input);
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });
  revalidatePath("/");
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/feed.xml");
  return Response.json(article);
}
