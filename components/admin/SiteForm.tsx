"use client";

import { useState } from "react";
import type { SiteDTO } from "@/lib/site";
import { AdminShell } from "./AdminShell";

export function SiteForm({ site, counts }: { site: SiteDTO; counts: { all: number; published: number; drafts: number } }) {
  const [form, setForm] = useState(site);
  const [state, setState] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");

  function set<K extends keyof SiteDTO>(key: K, value: SiteDTO[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setState("dirty");
  }

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/site", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      setForm((await res.json()) as SiteDTO);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  return (
    <AdminShell counts={counts}>
      <div className="writer-top">
        <div className="writer-top-left">
          <div>
            <span className="mono-sm" style={{ color: "var(--copper)" }}>Site</span>
            <h1 style={{ fontSize: "1.8rem", letterSpacing: "-0.015em", marginTop: 4 }}>About &amp; site</h1>
          </div>
        </div>
        <div className="writer-top-right mono">
          <span className={`save-state${state === "error" ? " error" : ""}`}>
            {state === "dirty" ? "Unsaved changes" : state === "saving" ? "Saving…" : state === "saved" ? "Saved and live" : state === "error" ? "Save failed — try again" : ""}
          </span>
          <button type="button" className="primary-btn" disabled={state !== "dirty" && state !== "error"} onClick={save}>
            Save changes
          </button>
        </div>
      </div>

      <p className="writer-intro">
        This text appears in the <b>About</b> section at the bottom of the home page. Changes go live as soon as you save.
      </p>

      <div className="site-form">
        <label className="site-field">
          <span className="field-label">Section heading</span>
          <input value={form.aboutHeading} onChange={(e) => set("aboutHeading", e.target.value)} placeholder="About" />
        </label>
        <label className="site-field">
          <span className="field-label">About text</span>
          <textarea
            rows={6}
            value={form.aboutText}
            onChange={(e) => set("aboutText", e.target.value)}
            placeholder="Who you are and what this site is about. Leave a blank line between paragraphs."
          />
          <span className="field-help">Leave a blank line between paragraphs.</span>
        </label>
        <label className="site-field">
          <span className="field-label">Short note under the text (optional)</span>
          <input value={form.aboutNote} onChange={(e) => set("aboutNote", e.target.value)} placeholder="e.g. New edition roughly every month." />
        </label>
        <label className="site-field">
          <span className="field-label">Contact email (optional)</span>
          <input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="you@example.com" />
          <span className="field-help">Shown as an email link next to the RSS link. Leave empty to show only the RSS link.</span>
        </label>
      </div>
    </AdminShell>
  );
}
