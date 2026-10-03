import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * What a phone or desktop browser needs to offer "Install app": a name, a
 * standalone window, a start page and 192/512px icons. The maskable icon is a
 * separate full-bleed render (see tools/build-icons.mjs) because Android crops
 * launcher icons to its own shape and would otherwise shrink the rounded tile
 * onto a white disc.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Government Exam India",
    short_name: "Exam India",
    description:
      "Central and state government exams across India: timelines, eligibility, vacancies and official sources.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    lang: "en-IN",
    dir: "ltr",
    background_color: "#f7f5ef",
    theme_color: "#f7f5ef",
    categories: ["education", "government", "reference"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search exams", short_name: "Search", url: "/search/" },
      { name: "Exam calendar", short_name: "Calendar", url: "/calendar/" },
      { name: "Exams by state", short_name: "States", url: "/states/" },
    ],
  };
}
