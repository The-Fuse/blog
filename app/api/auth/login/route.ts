import { cookies } from "next/headers";
import { createSessionToken, passwordsMatch, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!body.password || !expected || !passwordsMatch(body.password, expected)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = await createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return Response.json({ ok: true });
}
