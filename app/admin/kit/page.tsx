import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { listAll } from "@/lib/articles";

const labels = [
  "Palette",
  "Type",
  "Chapter frame",
  "Headings & labels",
  "Plate",
  "Quotation",
  "Callouts",
  "Premise steps",
  "Table",
  "Q&A and glossary",
  "Cards and pills",
  "Code",
  "Contents and notes",
  "House rules",
];

const palette = [
  { name: "ground", bg: "var(--ground)", use: "Page" },
  { name: "panel", bg: "var(--panel)", use: "Plates, cards, callouts" },
  { name: "ink / ink-2 / ink-3", bg: "linear-gradient(90deg,var(--ink) 33%,var(--ink-2) 33% 66%,var(--ink-3) 66%)", use: "Text hierarchy" },
  { name: "rule", bg: "var(--rule)", use: "Hairlines only" },
  { name: "verd", bg: "var(--verd)", use: "Ideas · links · key" },
  { name: "copper", bg: "var(--copper)", use: "Spirits · labels · numbers" },
  { name: "vermilion", bg: "var(--verm)", use: "Warnings" },
  { name: "matter", bg: "var(--matter)", use: "The denied position" },
];

const type = [
  { label: "Display / H1", style: { fontFamily: "var(--font-display)", fontSize: "3rem", lineHeight: 0.96, letterSpacing: "-0.02em" }, sample: "Esse est percipi." },
  { label: "Display / H2", style: { fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.014em" }, sample: "The whole system turns on one distinction" },
  { label: "Lede", style: { fontSize: "1.12rem", color: "var(--ink-2)", lineHeight: 1.55 }, sample: "Berkeley divides everything that exists into two kinds." },
  { label: "Body 17 / 1.62", style: { fontSize: 17 }, sample: "Ideas are wholly passive; spirits are wholly active. Nothing belongs to both." },
  { label: "Utility", style: { fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--copper)" }, sample: "Plate II · Legend" },
];

const callouts = [
  { label: "Key", color: "var(--verd)", wash: "var(--verd-wash)", text: "Berkeley denies matter; he does not deny bodies." },
  { label: "Common error", color: "var(--verm)", wash: "var(--verm-wash)", text: "The master argument shows what you cannot conceive, not what cannot exist." },
  { label: "Examiners ask", color: "var(--copper)", wash: "var(--copper-wash)", text: "“Do the four arguments stand or fall together?” Run each without the others." },
];

const steps = [
  { label: "P1", color: "var(--verd)", border: "var(--verd-soft)", bg: "var(--verd-wash)", text: "To conceive a tree unperceived I must form an idea of it." },
  { label: "P2", color: "var(--verd)", border: "var(--verd-soft)", bg: "var(--verd-wash)", text: "In forming the idea, I perceive it." },
  { label: "∴", color: "var(--copper)", border: "var(--copper-soft)", bg: "var(--copper-wash)", text: "No sensible thing can be conceived existing unperceived." },
];

const rows = [
  { q: "Primary qualities", a: "Resemble the object", b: "Relative to the perceiver, like all the rest" },
  { q: "Substance", a: "Something, I know not what", b: "A word without content" },
  { q: "Scepticism", a: "A standing risk", b: "Dissolved with the veil" },
];

const qa = [
  { q: "Does the table exist when I leave the room?", a: "Yes — in the mind of God and any other perceiver. What is denied is existence in no mind at all." },
  { q: "Is Berkeley a sceptic?", a: "He insists he is the opposite: removing the hidden original removes the gap scepticism lives in." },
];

const gloss = [
  { term: "Idea", ref: "PHK §1", def: "Any object of perception. Passive; exists only in being perceived." },
  { term: "Spirit", ref: "PHK §2", def: "A perceiving, willing being. Known by notion, not idea." },
  { term: "Notion", ref: "PHK §142", def: "Understanding of spirits and relations without an idea." },
];

const toc = [
  { n: "I", t: "How to read this document", s: "The visual grammar" },
  { n: "II", t: "A life and its works", s: "Kilkenny to Cloyne" },
  { n: "III", t: "The inheritance", s: "Locke and the veil" },
  { n: "IV", t: "Against abstract ideas", s: "The demolition" },
];

const rules = [
  "One accent word per title, italic, verd. Never two.",
  "Prose never exceeds 70ch; only plates, tables and card grids go wide.",
  "Colour is semantic: verd ideas, copper spirits, vermilion warnings. No decorative colour.",
  "Every label — kicker, caption head, table caption, pill — uses the same tracked mono.",
  "Separate with hairlines and space, not backgrounds. Panels only for plates, cards, callouts.",
  "The margin carries apparatus (sources, names, cross-refs); the body carries argument.",
  "One drop cap per chapter, on the lede only. One callout per section at most.",
];

function Spec({
  id,
  kicker,
  title,
  blurb,
  last,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  blurb: ReactNode;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="kit-spec" style={last ? { borderBottom: "none" } : undefined}>
      <aside className="kit-spec-l">
        <span className="mono-sm" style={{ display: "block", color: "var(--copper)" }}>{kicker}</span>
        <h2 style={{ fontSize: "1.7rem", margin: "8px 0 12px" }}>{title}</h2>
        <p style={{ fontSize: "0.88rem", color: "var(--ink-3)", lineHeight: 1.5 }}>{blurb}</p>
      </aside>
      <div>{children}</div>
    </section>
  );
}

export const metadata = { title: "Format kit" };
export const dynamic = "force-dynamic";

export default async function KitPage() {
  const articles = await listAll();
  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
  };

  return (
    <AdminShell counts={counts}>
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, flexWrap: "wrap", paddingBottom: 10, borderBottom: "1px solid var(--rule)", color: "var(--ink-3)" }}>
        <span>Article kit · v1</span>
        <span>Study-edition format</span>
        <span>{labels.length} blocks</span>
      </div>

      <div className="hero" style={{ padding: "clamp(36px, 5vw, 64px) 0", alignItems: "end", gridTemplateColumns: "1.1fr 0.9fr", gap: 48 }}>
        <div>
          <span className="mono" style={{ display: "block", color: "var(--copper)", marginBottom: 22 }}>
            Foundations · blocks · rules
          </span>
          <h1 style={{ fontSize: "clamp(2.8rem, 6.5vw, 4.8rem)", letterSpacing: "-0.02em", lineHeight: 0.96, marginBottom: "0.35em" }}>
            Every block <span style={{ fontStyle: "italic", color: "var(--verd)" }}>an article</span> can be built from.
          </h1>
          <p style={{ fontSize: "1.08rem", color: "var(--ink-2)", maxWidth: "50ch" }}>
            One column of argument, one column of apparatus. Each block below is shown once as a live specimen, with its name, when to use it, and the rules that keep the page quiet.
          </p>
        </div>
        <nav aria-label="Blocks" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px", fontSize: "0.9rem" }}>
          {labels.map((t, i) => (
            <a key={t} href={`#b${i + 1}`} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--rule-2)", textDecoration: "none", color: "var(--ink)" }}>
              <span className="mono-sm" style={{ color: "var(--copper)" }}>{String(i + 1).padStart(2, "0")}</span>
              {t}
            </a>
          ))}
        </nav>
      </div>

      <Spec
        id="b1"
        kicker="01 · FOUNDATION"
        title="Palette"
        blurb={<>Three semantic hues, never decorative. <b style={{ color: "var(--ink-2)" }}>Verd</b> = ideas, links, key. <b style={{ color: "var(--ink-2)" }}>Copper</b> = spirits, labels, numbering. <b style={{ color: "var(--ink-2)" }}>Vermilion</b> = warnings only. Grey <b style={{ color: "var(--ink-2)" }}>matter</b> is the empty position. Both themes ship; the toggle above switches them.</>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
          {palette.map((c) => (
            <div key={c.name}>
              <div style={{ height: 64, borderRadius: 2, border: "1px solid var(--rule-2)", background: c.bg }} />
              <div className="mono-sm" style={{ color: "var(--ink-2)", marginTop: 8, letterSpacing: "0.08em" }}>{c.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--ink-3)" }}>{c.use}</div>
            </div>
          ))}
        </div>
      </Spec>

      <Spec
        id="b2"
        kicker="02 · FOUNDATION"
        title="Type"
        blurb={<>Three voices. <b style={{ color: "var(--ink-2)" }}>Display</b> (Baskerville) for titles and quotes, italics carry emphasis. <b style={{ color: "var(--ink-2)" }}>Body</b> (Charter) at 17–18px, measure 70ch. <b style={{ color: "var(--ink-2)" }}>Utility</b> (mono, 10–11px, tracked caps) for every label, number and caption head.</>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {type.map((t) => (
            <div key={t.label} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, alignItems: "baseline", borderBottom: "1px solid var(--rule-2)", paddingBottom: 16 }}>
              <span className="mono-sm" style={{ color: "var(--ink-3)", letterSpacing: "0.1em" }}>{t.label}</span>
              <span style={t.style}>{t.sample}</span>
            </div>
          ))}
        </div>
      </Spec>

      <Spec
        id="b3"
        kicker="03 · STRUCTURE"
        title="Chapter frame"
        blurb={<>Every chapter is a two-column grid: a 186px <b style={{ color: "var(--ink-2)" }}>margin</b> (sticky numeral, tag, notes) and the <b style={{ color: "var(--ink-2)" }}>body</b>, whose prose is capped at 70ch while figures may go wide. Chapters are separated by a single hairline and generous vertical space, never by colour.</>}
      >
        <div className="chapdemo" style={{ display: "grid", gridTemplateColumns: "186px minmax(0, 1fr)", gap: "0 40px", border: "1px dashed var(--rule)", padding: 28, borderRadius: 2 }}>
          <div>
            <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "2.6rem", color: "var(--copper)", lineHeight: 1 }}>VII</span>
            <span className="mono" style={{ display: "block", color: "var(--ink-3)", margin: "6px 0 20px" }}>Master argument</span>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", lineHeight: 1.5, borderLeft: "2px solid var(--copper-soft)", paddingLeft: 11, marginBottom: 14 }}>
              <b className="mono-sm" style={{ display: "block", color: "var(--ink-2)", marginBottom: 3 }}>Margin note</b>
              Apparatus, not argument: sources, names, cross-references.
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.4rem)", letterSpacing: "-0.014em", marginBottom: "0.5em" }}>
              Chapter title, with <em style={{ color: "var(--verd)" }}>one</em> italic verd word
            </h2>
            <p style={{ fontSize: "1.1rem", color: "var(--ink-2)", lineHeight: 1.55, maxWidth: "70ch" }}>
              <span style={{ float: "left", fontFamily: "var(--font-display)", fontSize: "3.5em", lineHeight: 0.82, padding: "0.06em 0.1em 0 0", color: "var(--verd)" }}>T</span>
              he lede is the only paragraph with a drop cap. It runs slightly larger and lighter than body text and states the chapter&apos;s claim in full before any evidence arrives.
            </p>
            <p style={{ maxWidth: "70ch", margin: 0 }}>
              Body paragraphs follow at 17px, 1.62 line height, 70ch. Emphasis is <em>italic</em>; <strong style={{ fontWeight: 600 }}>bold</strong> is rare and reserved for the sentence to memorise. Links are <a href="#b3">verd, hairline-underlined</a>.
            </p>
          </div>
        </div>
      </Spec>

      <Spec
        id="b4"
        kicker="04 · TEXT"
        title="Headings & labels"
        blurb={<>H3 carries a 26px copper tick above it — the only ornament. H4 is body-face, semibold. Utility labels (kicker, caption head, table caption) are all the same mono style so the eye learns one signal.</>}
      >
        <div style={{ maxWidth: "70ch" }}>
          <span className="mono" style={{ display: "block", color: "var(--copper)", marginBottom: 24 }}>Kicker · utility label</span>
          <h3 style={{ fontSize: "1.32rem", margin: "0 0 0.55em" }}>
            <span style={{ display: "block", width: 26, height: 1, background: "var(--copper)", marginBottom: "0.75em" }} />
            H3 — section within a chapter
          </h3>
          <p style={{ color: "var(--ink-2)" }}>Introduces a move in the argument. Keep to five words where possible.</p>
          <h4 style={{ fontFamily: "inherit", fontSize: "1rem", fontWeight: 600, margin: "1.4em 0 0.35em" }}>H4 — a sub-point, body face</h4>
          <p style={{ color: "var(--ink-2)", margin: 0 }}>Used inside cards and for short runs of related paragraphs.</p>
        </div>
      </Spec>

      <Spec
        id="b5"
        kicker="05 · MEDIA"
        title="Plate"
        blurb={<>A panel with hairline border and 20px padding holds the diagram; caption sits below a rule with a numbered mono head (<b style={{ color: "var(--ink-2)" }}>Plate IV · Title</b>). Default width is the measure; add <b style={{ color: "var(--ink-2)" }}>wide</b> to span the body column. Diagrams follow the visual grammar: ideas filled, spirits outlined, matter dashed.</>}
      >
        <figure style={{ margin: 0, background: "var(--panel)", border: "1px solid var(--rule-2)", borderRadius: 2, padding: "20px 20px 16px" }}>
          <div className="mono" style={{ aspectRatio: "900 / 280", display: "grid", placeItems: "center", border: "1px dashed var(--rule)", background: "repeating-linear-gradient(135deg, var(--panel-2) 0 10px, var(--panel) 10px 20px)", color: "var(--ink-3)", textAlign: "center", padding: 20, letterSpacing: "0.1em" }}>
            diagram · svg using the visual grammar<br />filled = idea · outline = spirit · dashed = matter
          </div>
          <figcaption style={{ marginTop: 14, paddingTop: 11, borderTop: "1px solid var(--rule-2)", fontSize: "0.86rem", color: "var(--ink-2)", lineHeight: 1.5, maxWidth: "84ch" }}>
            <span className="mono-sm" style={{ display: "block", color: "var(--copper)", marginBottom: 4 }}>Plate IV · Wide</span>
            Captions do work: they state what the reader should <b style={{ color: "var(--ink)", fontWeight: 600 }}>see</b>, then what it proves. Two to four sentences.
          </figcaption>
        </figure>
      </Spec>

      <Spec
        id="b6"
        kicker="06 · TEXT"
        title="Quotation"
        blurb="Display face, 3px verd rule, mono citation in copper. For primary sources only — never for the author's own emphasis."
      >
        <blockquote style={{ margin: 0, padding: "2px 0 2px 22px", borderLeft: "3px solid var(--verd)", fontFamily: "var(--font-display)", fontSize: "1.16rem", lineHeight: 1.5, maxWidth: "70ch" }}>
          <p style={{ marginBottom: "0.5em" }}>“Take away the sensations of softness, moisture, redness, tartness, and you take away the cherry.”</p>
          <cite className="mono-sm" style={{ display: "block", color: "var(--copper)", fontStyle: "normal", marginTop: "0.7em" }}>Three Dialogues III</cite>
        </blockquote>
      </Spec>

      <Spec
        id="b7"
        kicker="07 · ASIDES"
        title="Callouts"
        blurb={<>Three variants, one shape. <b style={{ color: "var(--ink-2)" }}>Key</b> for the claim to remember, <b style={{ color: "var(--ink-2)" }}>Warn</b> for the common error, <b style={{ color: "var(--ink-2)" }}>Exam</b> for how a question is likely to be asked. At most one per chapter section.</>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: "70ch" }}>
          {callouts.map((c) => (
            <div key={c.label} style={{ border: "1px solid var(--rule-2)", borderLeft: `3px solid ${c.color}`, background: c.wash, padding: "16px 18px", borderRadius: 2 }}>
              <span className="mono-sm" style={{ display: "block", color: c.color, marginBottom: 8 }}>{c.label}</span>
              <p style={{ margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </Spec>

      <Spec
        id="b8"
        kicker="08 · ARGUMENT"
        title="Premise steps"
        blurb={<>Numbered P1…Pn in verd chips; the conclusion takes a copper <b style={{ color: "var(--ink-2)" }}>∴</b>. Use whenever an argument is being reconstructed, so it can be attacked premise by premise.</>}
      >
        <ol style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: "70ch" }}>
          {steps.map((s) => (
            <li key={s.label} style={{ display: "grid", gridTemplateColumns: "38px 1fr", gap: 12, marginBottom: "0.75em", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: s.color, border: `1px solid ${s.border}`, background: s.bg, borderRadius: 2, padding: "1px 0", textAlign: "center" }}>{s.label}</span>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
      </Spec>

      <Spec
        id="b9"
        kicker="09 · DATA"
        title="Table"
        blurb="Mono caption above, hairline rows, no vertical rules, no zebra. Row heads semibold at 22%. Hover tints the row. Max width 1000px; scrolls horizontally on small screens."
      >
        <div style={{ overflowX: "auto", maxWidth: 1000 }}>
          <table className="kit-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
            <caption className="mono-sm" style={{ textAlign: "left", color: "var(--copper)", paddingBottom: 9 }}>Table · Berkeley against Locke</caption>
            <thead>
              <tr>
                {["Question", "Locke", "Berkeley"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 12px", borderBottom: "1.5px solid var(--ink)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-2)", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.q}>
                  <th style={{ textAlign: "left", padding: "9px 12px 9px 0", borderBottom: "1px solid var(--rule-2)", fontWeight: 600, width: "22%", verticalAlign: "top" }}>{r.q}</th>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid var(--rule-2)", verticalAlign: "top", color: "var(--ink-2)" }}>{r.a}</td>
                  <td style={{ padding: "9px 0 9px 12px", borderBottom: "1px solid var(--rule-2)", verticalAlign: "top", color: "var(--ink-2)" }}>{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Spec>

      <Spec
        id="b10"
        kicker="10 · REVISION"
        title="Q&A and glossary"
        blurb={<>Q&A: collapsed by default, copper marker, answer under a rule. Prints open. <b style={{ color: "var(--ink-2)" }}>Glossary</b>: term in display face with a mono citation, definition beside it; stacks on mobile.</>}
      >
        <div style={{ maxWidth: "84ch" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36, maxWidth: "70ch" }}>
            {qa.map((q) => (
              <details key={q.q} style={{ border: "1px solid var(--rule-2)", background: "var(--panel)", borderRadius: 2, padding: "12px 16px" }}>
                <summary style={{ fontWeight: 600, display: "flex", gap: 10, alignItems: "baseline", cursor: "pointer" }}>
                  <span style={{ color: "var(--copper)", fontSize: "0.8em" }}>▸</span>
                  {q.q}
                </summary>
                <p style={{ margin: "11px 0 0", paddingTop: 11, borderTop: "1px solid var(--rule-2)", fontSize: "0.94rem", color: "var(--ink-2)" }}>{q.a}</p>
              </details>
            ))}
          </div>
          <dl style={{ margin: 0 }}>
            {gloss.map((g) => (
              <div key={g.term} className="two" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 18, padding: "11px 0", borderTop: "1px solid var(--rule-2)" }}>
                <dt style={{ fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "1.06rem" }}>
                  {g.term}
                  <small className="mono-sm" style={{ display: "block", color: "var(--copper)", fontWeight: 400, marginTop: 2, fontSize: 9 }}>{g.ref}</small>
                </dt>
                <dd style={{ margin: 0, color: "var(--ink-2)", fontSize: "0.94rem" }}>{g.def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Spec>

      <Spec
        id="b11"
        kicker="11 · COMPARE"
        title="Cards and pills"
        blurb={<>A two-up grid of panels for side-by-side positions; each carries a mono eyebrow. <b style={{ color: "var(--ink-2)" }}>Pills</b> tag a term with its ontological kind inline — idea, spirit, matter — and nothing else.</>}
      >
        <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28, maxWidth: 1000 }}>
          <div style={{ border: "1px solid var(--rule-2)", background: "var(--panel)", padding: "15px 17px", borderRadius: 2 }}>
            <span className="mono-sm" style={{ display: "block", color: "var(--copper)", marginBottom: 8 }}>Hylas</span>
            <h4 style={{ fontFamily: "inherit", fontSize: "1rem", fontWeight: 600, margin: "0 0 0.35em" }}>Matter supports qualities</h4>
            <p style={{ margin: 0, fontSize: "0.94rem", color: "var(--ink-2)" }}>Something must bear the redness and the roundness.</p>
          </div>
          <div style={{ border: "1px solid var(--rule-2)", background: "var(--panel)", padding: "15px 17px", borderRadius: 2 }}>
            <span className="mono-sm" style={{ display: "block", color: "var(--copper)", marginBottom: 8 }}>Philonous</span>
            <h4 style={{ fontFamily: "inherit", fontSize: "1rem", fontWeight: 600, margin: "0 0 0.35em" }}>“Support” means nothing here</h4>
            <p style={{ margin: 0, fontSize: "0.94rem", color: "var(--ink-2)" }}>Not as pillars support a roof; then in what sense?</p>
          </div>
        </div>
        <p style={{ margin: 0, maxWidth: "70ch" }}>
          A <span className="pill idea" style={{ border: "1px solid var(--verd-soft)" }}>idea</span> is perceived, a{" "}
          <span className="pill spirit" style={{ border: "1px solid var(--copper-soft)" }}>spirit</span> perceives, and{" "}
          <span className="pill matter" style={{ border: "1px solid var(--matter)" }}>matter</span> is struck out.
        </p>
      </Spec>

      <Spec
        id="b12"
        kicker="12 · TECHNICAL"
        title="Code"
        blurb="For technical articles. Same panel as a plate, mono at 13px, tokens tinted with the three hues only (keywords copper, names verd, comments ink-3). Optional caption as with plates."
      >
        <pre style={{ margin: 0, padding: "18px 20px", background: "var(--panel)", border: "1px solid var(--rule-2)", borderRadius: 2, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.6, overflowX: "auto", maxWidth: "70ch" }}>
          <span style={{ color: "var(--ink-3)" }}>{"// esse est percipi, as a getter"}</span>
          {"\n"}
          <span style={{ color: "var(--copper)" }}>const</span>
          {" cherry = {\n  "}
          <span style={{ color: "var(--copper)" }}>get</span>{" "}
          <span style={{ color: "var(--verd)" }}>redness</span>
          {"() { "}
          <span style={{ color: "var(--copper)" }}>return</span>
          {" perceive("}
          <span style={{ color: "var(--ink-2)" }}>&quot;sight&quot;</span>
          {") },\n};"}
        </pre>
      </Spec>

      <Spec
        id="b13"
        kicker="13 · NAVIGATION"
        title="Contents and notes"
        blurb={<>Contents: roman numeral, display title, one-line subtitle; auto-fills columns. <b style={{ color: "var(--ink-2)" }}>Footnotes</b>: copper superscript in text, list at chapter end with a return arrow.</>}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0 34px", marginBottom: 32 }}>
          {toc.map((t) => (
            <a key={t.n} href="#b13" style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--rule-2)", textDecoration: "none", color: "var(--ink)", alignItems: "baseline" }}>
              <span className="mono-sm" style={{ color: "var(--copper)" }}>{t.n}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.02rem", lineHeight: 1.25 }}>
                {t.t}
                <span style={{ display: "block", fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--ink-3)", marginTop: 2 }}>{t.s}</span>
              </span>
            </a>
          ))}
        </div>
        <p style={{ maxWidth: "70ch" }}>
          The margin is apparatus, not argument.
          <sup style={{ fontSize: "0.7em", lineHeight: 0 }}>
            <a href="#b13" style={{ textDecoration: "none", color: "var(--copper)" }}>1</a>
          </sup>
        </p>
        <p style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 8, margin: 0, fontSize: "0.86rem", color: "var(--ink-2)", maxWidth: "70ch" }}>
          <span style={{ color: "var(--copper)" }}>1</span>
          <span>Following the Luce–Jessop edition. <a href="#b13" style={{ color: "var(--ink-3)" }}>↩</a></span>
        </p>
      </Spec>

      <Spec
        id="b14"
        kicker="14 · RULES"
        title="House rules"
        blurb="What keeps every article looking like the same edition."
        last
      >
        <ol style={{ margin: 0, padding: 0, listStyle: "none", maxWidth: "70ch" }}>
          {rules.map((t, i) => (
            <li key={t} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--rule-2)" }}>
              <span className="mono-sm" style={{ color: "var(--copper)", paddingTop: 6 }}>{String(i + 1).padStart(2, "0")}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </Spec>
    </AdminShell>
  );
}
