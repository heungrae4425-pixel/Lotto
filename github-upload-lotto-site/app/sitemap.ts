import type { MetadataRoute } from "next";
import { getAllDraws, getSiteUrl } from "@/lib/lotto";
import type { LottoDraw } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  let draws: LottoDraw[] = [];
  try {
    draws = await getAllDraws();
  } catch {
    draws = [];
  }

  const staticPages = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/draws", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/stats", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/generator", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/insights/frequent-numbers", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/insights/missing-numbers", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/insights/odd-even-ratio", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/insights/lotto-probability", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/rss.xml", priority: 0.4, changeFrequency: "daily" as const }
  ].map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority
  }));

  const drawPages = draws.map((draw) => ({
    url: `${siteUrl}/draw/${draw.draw_no}`,
    lastModified: new Date(draw.updated_at || draw.draw_date),
    changeFrequency: "weekly" as const,
    priority: draw.draw_no === draws[0]?.draw_no ? 0.9 : 0.65
  }));

  return [...staticPages, ...drawPages];
}
