import type { MetadataRoute } from "next";

// Colours match the logo's dark teal tile so the splash screen and system bars blend in.
const BRAND_DARK = "#0e211f";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Merchant Rails",
    short_name: "Merchant Rails",
    description: "Get paid by clients anywhere in under a second.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BRAND_DARK,
    theme_color: BRAND_DARK,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
