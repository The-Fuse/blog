import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner mono">
        <Link href="/" className="brand">
          Rohit Yadav
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/#latest">Articles</Link>
          <Link href="/#about">About</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
