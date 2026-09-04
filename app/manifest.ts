import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rohit Yadav",
    short_name: "Rohit Yadav",
    description: "Long-form study editions of philosophers and of technical ideas.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5efe3",
    theme_color: "#15110d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
