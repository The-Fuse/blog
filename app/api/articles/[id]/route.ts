import { revalidatePath } from "next/cache";
import { CONFLICT, deleteArticle, getById, updateArticle } from "@/lib/articles";
import type { ArticleInput } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const article = await getById(id);
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(article);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const input = (await request.json()) as ArticleInput;
  const before = await getById(id);
  const article = await updateArticle(id, input);
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });
  if (article === CONFLICT) {
    return Response.json(
      { error: "This article was changed elsewhere since you opened it. Reload to see the latest version before saving." },
      { status: 409 },
    );
  }
  revalidatePath("/");
  revalidatePath(`/articles/${article.slug}`);
  if (before && before.slug !== article.slug) revalidatePath(`/articles/${before.slug}`);
  revalidatePath("/feed.xml");
  return Response.json(article);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const article = await deleteArticle(id);
  if (!article) return Response.json({ error: "Not found" }, { status: 404 });
  revalidatePath("/");
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/feed.xml");
  return Response.json({ ok: true });
}
