import { listPublished } from "@/lib/articles";

// Rendered once and cached; publishing, editing or deleting an article revalidates these paths.
export const revalidate = 3600;

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const articles = await listPublished();
  const items = articles
    .map((a) => {
      const minutes = a.minutes;
      return `<item>
        <title>${esc(a.title)}</title>
        <link>${origin}/articles/${a.slug}</link>
        <guid>${origin}/articles/${a.slug}</guid>
        <pubDate>${new Date(a.publishDate).toUTCString()}</pubDate>
        <category>${esc(a.topic)}</category>
        <description>${esc(a.dek)} (${minutes} min)</description>
      </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Rohit Yadav</title>
    <link>${origin}</link>
    <description>Long-form study editions of philosophers and of technical ideas.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
