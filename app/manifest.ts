import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Camino B2",
    short_name: "Camino B2",
    description: "Cross-device Spanish vocabulary and grammar trainer",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#111827",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
