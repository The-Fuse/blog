import type { Metadata } from "next";
import { JetBrains_Mono, Libre_Baskerville, Newsreader } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const baskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Rohit Yadav",
    template: "%s · Rohit Yadav",
  },
  description: "Long-form study editions of philosophers and of technical ideas.",
};

const themeBoot = `(function(){try{var t=localStorage.getItem('kit-theme');var p=location.pathname;var d=p.indexOf('/articles/')===0?'light':'dark';document.documentElement.setAttribute('data-theme',t||d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${baskerville.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
