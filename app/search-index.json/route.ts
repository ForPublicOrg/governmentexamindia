import { exams } from "@/lib/exams";
import { toSearchDoc } from "@/lib/search";

export const dynamic = "force-static";
export const revalidate = false;

export function GET() {
  return Response.json(exams.map(toSearchDoc), {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
