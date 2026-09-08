"use client";

import { useState } from "react";
import { MediaPicker } from "./MediaPicker";

type Slot = "light" | "dark";

type Props = {
  light: string | null | undefined;
  dark: string | null | undefined;
  onChange: (next: { light?: string | null; dark?: string | null }) => void;
  onUpload: (file: File) => Promise<string | null>;
  /** Placeholder shown in the empty light slot. */
  hint: string;
  /** Wide (article plate) or 5:4 (cover) drop areas. */
  wide?: boolean;
};

/**
 * Light + dark image slots. Each one accepts a drop or click-to-upload, a pick from the library,
 * or a pasted address. The dark slot is optional: when empty the light image is used in both themes.
 */
export function ImageSlots({ light, dark, onChange, onUpload, hint, wide }: Props) {
  const [picking, setPicking] = useState<Slot | null>(null);
  const [addressFor, setAddressFor] = useState<Slot | null>(null);

  function set(slot: Slot, url: string | null) {
    onChange(slot === "light" ? { light: url } : { dark: url });
  }

  async function drop(slot: Slot, file: File | undefined) {
    if (!file) return;
    const url = await onUpload(file);
    if (url) set(slot, url);
  }

  function renderSlot(slot: Slot) {
    const url = slot === "light" ? light : dark;
    const isDark = slot === "dark";
    return (
      <div className={`img-slot${isDark ? " dark" : ""}`} key={slot}>
        <div className="img-slot-head mono-sm">
          <span>{isDark ? "Dark mode" : "Light mode"}</span>
          {isDark ? <span className="img-slot-opt">optional</span> : null}
        </div>
        <label
          className={`drop-zone slot${wide ? " wide" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void drop(slot, e.dataTransfer.files[0]);
          }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" />
          ) : (
            <span className="mono-sm">
              {isDark ? (
                <>
                  Uses the light image
                  <br />
                  Drop a dark version to change that
                </>
              ) : (
                hint.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 ? <br /> : null}
                    {line}
                  </span>
                ))
              )}
            </span>
          )}
          <input type="file" accept="image/*" hidden onChange={(e) => void drop(slot, e.target.files?.[0])} />
        </label>
        <div className="img-slot-actions">
          <button type="button" className="link-btn" onClick={() => setPicking(slot)}>Library…</button>
          <button type="button" className="link-btn" onClick={() => setAddressFor(addressFor === slot ? null : slot)}>Address…</button>
          {url ? (
            <button type="button" className="link-btn" onClick={() => set(slot, null)}>Remove</button>
          ) : null}
        </div>
        {addressFor === slot ? (
          <input
            autoFocus
            value={url ?? ""}
            onChange={(e) => set(slot, e.target.value.trim() || null)}
            placeholder="Paste an image address, e.g. /uploads/figure-1.svg"
            aria-label={`${isDark ? "Dark" : "Light"} image address`}
            className="mono-sm img-slot-address"
          />
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="img-slots">
        {renderSlot("light")}
        {renderSlot("dark")}
      </div>
      {picking ? (
        <MediaPicker
          title={picking === "dark" ? "Choose the dark-mode image" : "Choose an image"}
          onUpload={onUpload}
          onPick={(url) => {
            set(picking, url);
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      ) : null}
    </>
  );
}
