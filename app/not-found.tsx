import Link from "next/link";
import { Header } from "@/components/site/Header";

export default function NotFound() {
  return (
    <div className="wrap">
      <Header />
      <main className="page" style={{ paddingTop: 80 }}>
        <span className="mono" style={{ color: "var(--copper)" }}>404</span>
        <h1 style={{ fontSize: "2.4rem", margin: "12px 0 16px" }}>This edition is not on the shelf.</h1>
        <p style={{ color: "var(--ink-2)" }}>
          <Link href="/">← All articles</Link>
        </p>
      </main>
    </div>
  );
}
