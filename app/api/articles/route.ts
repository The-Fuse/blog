import { revalidatePath } from "next/cache";
import { createArticle, listAll } from "@/lib/articles";
import type { ArticleInput } from "@/lib/types";

export async function GET() {
  return Response.json(await listAll());
}

export async function POST(request: Request) {
  const input = (await request.json()) as ArticleInput;
  const article = await createArticle(input);
  revalidatePath("/");
  revalidatePath("/feed.xml");
  return Response.json(article, { status: 201 });
}
