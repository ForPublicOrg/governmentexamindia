import type { MetadataRoute } from "next";
import { examTypeOptions, indiaRegions } from "@/lib/discovery";
import { exams } from "@/lib/exams";

const baseUrl = "https://governmentexamindia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/exams", "/states", "/exam-types", "/calendar", "/updates", "/methodology"];
  return [
    ...staticRoutes.map((path) => ({ url: `${baseUrl}${path}` })),
    ...exams.map((item) => ({ url: `${baseUrl}/exams/${item.slug}` })),
    ...indiaRegions.map((region) => ({ url: `${baseUrl}/states/${region.slug}` })),
    ...examTypeOptions.map((type) => ({ url: `${baseUrl}/exam-types/${type.slug}` })),
  ];
}
