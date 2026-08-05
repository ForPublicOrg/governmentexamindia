import type { MetadataRoute } from "next";
import { examTypeOptions, indiaRegions } from "@/lib/discovery";
import { exams } from "@/lib/exams";
import { lastVerifiedIso } from "@/lib/lifecycle";

export const dynamic = "force-static";

const baseUrl = "https://governmentexamindia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/exams", "/states", "/exam-types", "/calendar", "/updates", "/methodology"];
  return [
    ...staticRoutes.map((path) => ({ url: `${baseUrl}${path}` })),
    // Each record's own review date, not the build's. Stamping every page with
    // the build date would tell crawlers the whole catalogue changed daily.
    ...exams.map((item) => ({
      url: `${baseUrl}/exams/${item.slug}`,
      lastModified: lastVerifiedIso(item.lastVerified),
    })),
    ...indiaRegions.map((region) => ({ url: `${baseUrl}/states/${region.slug}` })),
    ...examTypeOptions.map((type) => ({ url: `${baseUrl}/exam-types/${type.slug}` })),
  ];
}
