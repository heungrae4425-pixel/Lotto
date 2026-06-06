import { getAllDraws, drawNumbers, formatKRW } from "@/lib/lotto";
import { absoluteUrl, siteName } from "@/lib/seo";
import type { LottoDraw } from "@/lib/types";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  let draws: LottoDraw[] = [];
  try {
    draws = (await getAllDraws()).slice(0, 30);
  } catch {
    draws = [];
  }

  const items = draws
    .map((draw) => {
      const title = `${draw.draw_no}회 로또 당첨번호`;
      const description = `${draw.draw_no}회 당첨번호 ${drawNumbers(draw).join(", ")} + 보너스 ${draw.bonus_no}, 1등 당첨금 ${formatKRW(draw.first_win_amount)}`;
      return `
        <item>
          <title>${escapeXml(title)}</title>
          <link>${absoluteUrl(`/draw/${draw.draw_no}`)}</link>
          <guid>${absoluteUrl(`/draw/${draw.draw_no}`)}</guid>
          <description>${escapeXml(description)}</description>
          <pubDate>${new Date(draw.draw_date).toUTCString()}</pubDate>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(siteName)}</title>
        <link>${absoluteUrl("/")}</link>
        <description>${escapeXml("로또 6/45 최신 당첨번호와 회차별 통계")}</description>
        <language>ko-KR</language>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8"
    }
  });
}
