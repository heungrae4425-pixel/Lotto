import type { Metadata } from "next";
import Link from "next/link";
import LottoBall from "@/components/LottoBall";
import SeoTextBlock from "@/components/SeoTextBlock";
import StatCard from "@/components/StatCard";
import { calculateHighLow, calculateOddEven, calculateSum, drawNumbers, formatKRW, getDrawByNo, hasConsecutive } from "@/lib/lotto";
import { sampleDraws } from "@/lib/sample-data";
import { absoluteUrl } from "@/lib/seo";

type Props = { params: Promise<{ drawNo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { drawNo } = await params;
  return {
    title: `${drawNo}회 로또 당첨번호 조회 - 추첨일, 1등 당첨금, 번호 분석`,
    description: `${drawNo}회 로또 당첨번호, 보너스 번호, 1등 당첨자 수, 당첨금, 홀짝 비율과 번호 합계를 확인하세요.`,
    alternates: {
      canonical: absoluteUrl(`/draw/${drawNo}`)
    },
    openGraph: {
      title: `${drawNo}회 로또 당첨번호`,
      description: `${drawNo}회 로또 6/45 당첨번호와 회차별 통계`,
      url: absoluteUrl(`/draw/${drawNo}`),
      type: "article",
      locale: "ko_KR"
    }
  };
}

export default async function DrawDetailPage({ params }: Props) {
  const { drawNo } = await params;
  const requestedNo = Number(drawNo);
  let draw = null;

  try {
    draw = await getDrawByNo(requestedNo);
  } catch {
    draw = null;
  }

  const usingSample = !draw;
  draw = draw || sampleDraws.find((item) => item.draw_no === requestedNo) || sampleDraws[0];

  const numbers = drawNumbers(draw);
  const oddEven = calculateOddEven(numbers);
  const highLow = calculateHighLow(numbers);
  const sum = calculateSum(numbers);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${draw.draw_no}회 로또 당첨번호`,
    description: `${draw.draw_no}회 로또 6/45 당첨번호, 보너스 번호, 추첨일, 1등 당첨금과 기초 통계`,
    url: absoluteUrl(`/draw/${draw.draw_no}`),
    datePublished: draw.draw_date,
    inLanguage: "ko-KR",
    keywords: ["로또", "로또 당첨번호", `${draw.draw_no}회 로또`, "로또 6/45"]
  };

  return (
    <div className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/draws" className="text-sm font-semibold text-sky-700">회차 목록</Link>
      <h1 className="mt-3 text-3xl font-bold">{draw.draw_no}회 로또 당첨번호</h1>
      <p className="mt-2 text-slate-600">추첨일 {draw.draw_date}</p>

      {usingSample ? (
        <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          해당 회차가 아직 DB에 없어 예시 회차를 표시하고 있습니다. 초기 백필 후 실제 회차 상세가 표시됩니다.
        </p>
      ) : null}

      <section className="mt-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {numbers.map((number) => <LottoBall key={number} number={number} />)}
          <span className="px-2 text-slate-400">보너스</span>
          <LottoBall number={draw.bonus_no} bonus />
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="1등 당첨자 수" value={`${draw.first_winner_count ?? "-"}명`} />
        <StatCard title="1등 당첨금" value={formatKRW(draw.first_win_amount)} />
        <StatCard title="총 판매금액" value={formatKRW(draw.total_sell_amount)} />
        <StatCard title="번호 합계" value={sum} />
        <StatCard title="홀짝 비율" value={oddEven.label} />
        <StatCard title="고저 비율" value={highLow.label} caption="1~22 / 23~45" />
        <StatCard title="연속번호" value={hasConsecutive(numbers) ? "있음" : "없음"} />
        <StatCard title="1등 총액" value={formatKRW(draw.first_total_amount)} />
      </div>

      <div className="mt-6">
        <SeoTextBlock title={`${draw.draw_no}회 로또 번호 분석`}>
          <p>
            {draw.draw_no}회 로또 당첨번호는 {numbers.join(", ")}이며 보너스 번호는 {draw.bonus_no}입니다.
            이 회차의 번호 합계는 {sum}, 홀짝 비율은 {oddEven.label}, 고저 비율은 {highLow.label}입니다.
          </p>
          <p>
            회차별 분석은 공개된 당첨번호를 보기 쉽게 정리한 참고 정보입니다. 번호 통계는 과거 결과를 설명하는 자료이며,
            특정 결과를 보장하지 않습니다.
          </p>
        </SeoTextBlock>
      </div>

      <nav className="mt-8 flex justify-between gap-3 text-sm font-semibold text-sky-700">
        <Link href={`/draw/${Math.max(1, draw.draw_no - 1)}`}>이전 회차</Link>
        <Link href={`/draw/${draw.draw_no + 1}`}>다음 회차</Link>
      </nav>
    </div>
  );
}
