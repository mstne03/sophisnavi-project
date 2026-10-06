import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sophisnavi Project",
    short_name: "Sophisnavi",
    description: "Sophisnavi Project",
    start_url: "/",
    display: "standalone",
    background_color: "#02040a",
    theme_color: "#02040a",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
