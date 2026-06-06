import type { Metadata } from "next";
import FrequencyChart from "@/components/FrequencyChart";
import LottoBall from "@/components/LottoBall";
import SeoTextBlock from "@/components/SeoTextBlock";
import StatCard from "@/components/StatCard";
import SumDistributionChart from "@/components/SumDistributionChart";
import { calculateFrequency, calculateOddEven, calculateSum, drawNumbers, getAllDraws } from "@/lib/lotto";
import { withSampleFallback } from "@/lib/sample-data";
import { absoluteUrl } from "@/lib/seo";
import type { LottoDraw } from "@/lib/types";

export const metadata: Metadata = {
  title: "로또 번호 통계 - 출현 빈도와 번호 합계",
  description: "로또 6/45 번호별 출현 빈도, 보너스 번호 빈도, 홀짝 비율, 번호 합계 분포를 최근 회차 기준으로 확인하세요.",
  alternates: {
    canonical: absoluteUrl("/stats")
  }
};

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const params = await searchParams;
  const range = Number(params.range || 50);
  let storedDraws: LottoDraw[] = [];

  try {
    storedDraws = await getAllDraws();
  } catch {
    storedDraws = [];
  }

  const fallback = withSampleFallback(storedDraws);
  const draws = fallback.draws.slice(0, range);
  const frequency = calculateFrequency(draws);
  const most = [...frequency].sort((a, b) => b.mainCount - a.mainCount)[0];
  const least = [...frequency].sort((a, b) => a.mainCount - b.mainCount)[0];
  const oddCount = draws.reduce((sum, draw) => sum + calculateOddEven(drawNumbers(draw)).odd, 0);
  const totalNumbers = draws.length * 6;
  const sums = draws.map((draw) => calculateSum(drawNumbers(draw)));
  const sumAverage = sums.length ? Math.round(sums.reduce((sum, value) => sum + value, 0) / sums.length) : 0;
  const sumBuckets = [
    { range: "21-80", count: sums.filter((sum) => sum <= 80).length },
    { range: "81-120", count: sums.filter((sum) => sum >= 81 && sum <= 120).length },
    { range: "121-160", count: sums.filter((sum) => sum >= 121 && sum <= 160).length },
    { range: "161-200", count: sums.filter((sum) => sum >= 161 && sum <= 200).length },
    { range: "201-255", count: sums.filter((sum) => sum >= 201).length }
  ];

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">로또 번호 통계</h1>
      <p className="mt-2 text-slate-600">번호별 출현 빈도와 회차별 요약 지표를 최근 회차 기준으로 시각화합니다.</p>

      {fallback.usingSample ? (
        <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          아직 실제 데이터가 없어 예시 데이터로 차트를 보여주고 있습니다. 백필 후 실제 통계로 자동 변경됩니다.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {[10, 30, 50, 100].map((value) => (
          <a key={value} href={`/stats?range=${value}`} className={`rounded-md px-4 py-2 text-sm font-bold ${range === value ? "bg-ink text-white" : "bg-white text-slate-700"}`}>
            최근 {value}회
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="분석 회차" value={draws.length} />
        <StatCard title="가장 많이 나온 번호" value={most ? `${most.number}번` : "-"} caption={`${most?.mainCount || 0}회`} />
        <StatCard title="가장 적게 나온 번호" value={least ? `${least.number}번` : "-"} caption={`${least?.mainCount || 0}회`} />
        <StatCard title="평균 번호 합계" value={sumAverage || "-"} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-bold">번호별 출현 빈도</h2>
        <FrequencyChart data={frequency} />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-xl font-bold">번호 합계 분포</h2>
        <SumDistributionChart data={sumBuckets} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">상위 번호</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...frequency].sort((a, b) => b.mainCount - a.mainCount).slice(0, 10).map((item) => <LottoBall key={item.number} number={item.number} />)}
          </div>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">홀짝 비율 통계</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            선택 구간의 전체 당첨번호 중 홀수는 {oddCount}개, 짝수는 {Math.max(0, totalNumbers - oddCount)}개입니다.
          </p>
        </section>
      </div>

      <div className="mt-6">
        <SeoTextBlock title="로또 통계 해석 안내">
          <p>
            출현 빈도, 홀짝 비율, 번호 합계는 공개된 과거 회차를 보기 쉽게 요약한 값입니다.
            통계는 데이터 흐름을 살펴보는 데 유용하지만 특정 결과를 약속하는 근거가 되지 않습니다.
          </p>
        </SeoTextBlock>
      </div>
    </div>
  );
}
