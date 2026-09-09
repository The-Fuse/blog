import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-url";

// Default share card: used for the home page and for any article without a shareable cover.
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f5efe3",
          color: "#15110d",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 26, letterSpacing: 6, color: "#8a6a3a" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#2f6f5e" }} />
          STUDY EDITIONS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 132, lineHeight: 1, letterSpacing: -4 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 40, lineHeight: 1.3, color: "#4a4238", maxWidth: 980 }}>{SITE_DESCRIPTION}</div>
        </div>
        <div style={{ height: 6, width: 220, background: "#2f6f5e" }} />
      </div>
    ),
    { ...size },
  );
}
