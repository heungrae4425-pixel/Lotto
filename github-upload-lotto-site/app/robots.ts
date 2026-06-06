import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/lotto";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/admin", "/api/cron", "/api/debug"]
    },
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/rss.xml`]
  };
}
