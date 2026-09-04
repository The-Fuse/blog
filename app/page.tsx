import { HomeView } from "@/components/home/HomeView";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { listPublished } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const articles = await listPublished();
  return (
    <div className="wrap">
      <Header />
      <main className="page">
        <HomeView articles={articles} />
        <section id="about" className="about">
          <span className="mono" style={{ color: "var(--copper)" }}>
            About
          </span>
          <div style={{ maxWidth: "60ch" }}>
            <p style={{ fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.55, marginBottom: "1em" }}>
              Long-form study editions of philosophers and of technical ideas — arguments set out as arguments, with every diagram drawn in one visual grammar.
            </p>
            <p style={{ color: "var(--ink-3)", fontSize: "0.95rem" }}>
              New edition roughly every month. <a href="mailto:editors@studyeditions.local">Subscribe by email</a> or follow the{" "}
              <a href="/feed.xml">RSS feed</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
