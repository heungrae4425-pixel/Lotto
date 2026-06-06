import { getSiteUrl } from "@/lib/lotto";

export const siteName = "로또.site";
export const siteDescription = "로또 6/45 회차별 당첨번호, 보너스 번호, 1등 당첨금, 번호 빈도와 통계 분석을 제공하는 정보성 사이트입니다.";

export function absoluteUrl(path = "") {
  const siteUrl = getSiteUrl();
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: absoluteUrl("/"),
    description: siteDescription,
    inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/draws")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/")
  };
}
