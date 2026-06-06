import type { MetadataRoute } from "next";
import { absoluteUrl, siteDescription, siteName } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: "로또 통계",
    description: siteDescription,
    start_url: absoluteUrl("/"),
    display: "standalone",
    background_color: "#f7f9fc",
    theme_color: "#172033",
    lang: "ko-KR"
  };
}
