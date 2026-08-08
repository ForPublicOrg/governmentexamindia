import type { MetadataRoute } from "next";
import { examTypeOptions, indiaRegions } from "@/lib/discovery";
import { exams } from "@/lib/exams";
import { lastVerifiedIso } from "@/lib/lifecycle";

export const dynamic = "force-static";

const baseUrl = "https://governmentexamindia.com";

// `trailingSlash: true` serves every route at a path ending in "/" and only
// 308s the slashless form to it, but Next does not apply that setting to
// sitemap entries. Building the slash in here keeps the sitemap pointing at the
// URLs that actually return 200: a sitemap of redirects spends crawl budget
// without ever handing a crawler something it can index.
function canonical(path: string) {
  return `${baseUrl}${path}/`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/exams", "/states", "/exam-types", "/calendar", "/updates", "/methodology"];
  return [
    ...staticRoutes.map((path) => ({ url: canonical(path) })),
    // Each record's own review date, not the build's. Stamping every page with
    // the build date would tell crawlers the whole catalogue changed daily.
    ...exams.map((item) => ({
      url: canonical(`/exams/${item.slug}`),
      lastModified: lastVerifiedIso(item.lastVerified),
    })),
    ...indiaRegions.map((region) => ({ url: canonical(`/states/${region.slug}`) })),
    ...examTypeOptions.map((type) => ({ url: canonical(`/exam-types/${type.slug}`) })),
  ];
}
