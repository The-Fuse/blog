import { HomeView } from "@/components/home/HomeView";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { listPublished } from "@/lib/articles";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [articles, site] = await Promise.all([listPublished(), getSite()]);
  return (
    <div className="wrap">
      <Header />
      <main className="page">
        <HomeView articles={articles} />
        <section id="about" className="about">
          <span className="mono" style={{ color: "var(--copper)" }}>
            {site.aboutHeading}
          </span>
          <div style={{ maxWidth: "60ch" }}>
            {site.aboutText.split(/\n{2,}/).map((para, i) => (
              <p key={i} style={{ fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.55, marginBottom: "1em" }}>
                {para}
              </p>
            ))}
            <p style={{ color: "var(--ink-3)", fontSize: "0.95rem" }}>
              {site.aboutNote ? `${site.aboutNote} ` : null}
              {site.contactEmail ? (
                <>
                  <a href={`mailto:${site.contactEmail}`}>Email {site.contactEmail}</a> or follow the{" "}
                </>
              ) : (
                <>Follow the </>
              )}
              <a href="/feed.xml">RSS feed</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
