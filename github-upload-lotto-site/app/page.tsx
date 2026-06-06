import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import DrawCard from "@/components/DrawCard";
import LottoBall from "@/components/LottoBall";
import RecentDraws from "@/components/RecentDraws";
import SeoTextBlock from "@/components/SeoTextBlock";
import StatCard from "@/components/StatCard";
import { calculateFrequency, calculateHighLow, calculateOddEven, drawNumbers, getAllDraws } from "@/lib/lotto";
import { withSampleFallback } from "@/lib/sample-data";
import { absoluteUrl } from "@/lib/seo";
import type { LottoDraw } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "로또 6/45 당첨번호 조회와 번호 통계",
  description: "최신 로또 6/45 당첨번호, 보너스 번호, 1등 당첨금, 최근 회차 목록, 많이 나온 번호와 미출현 번호 통계를 확인하세요.",
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export default async function HomePage() {
  let storedDraws: LottoDraw[] = [];
  try {
    storedDraws = await getAllDraws();
  } catch {
    storedDraws = [];
  }

  const { draws, usingSample } = withSampleFallback(storedDraws);
  const latest = draws[0];
  const recent = draws.slice(0, 10);
  const frequency = calculateFrequency(draws);
  const topNumbers = [...frequency].sort((a, b) => b.mainCount - a.mainCount).slice(0, 10);
  const missingNumbers = [...frequency].sort((a, b) => a.mainCount - b.mainCount).slice(0, 10);
  const latestNumbers = latest ? drawNumbers(latest) : [];
  const oddEven = latest ? calculateOddEven(latestNumbers).label : "-";
  const highLow = latest ? calculateHighLow(latestNumbers).label : "-";
  const jsonLd = latest
    ? {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `${latest.draw_no}회 로또 6/45 당첨번호`,
        description: `${latest.draw_no}회 로또 당첨번호, 보너스 번호, 추첨일, 1등 당첨금과 번호 통계`,
        url: absoluteUrl(`/draw/${latest.draw_no}`),
        datePublished: latest.draw_date,
        inLanguage: "ko-KR"
      }
    : null;

  return (
    <div className="container-page py-8">
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      <AdSlot label="메인 상단 광고 영역" />
      {usingSample ? <SetupNotice /> : null}

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-ink">로또 6/45 당첨번호 조회와 번호 통계</h1>
            <p className="mt-2 text-slate-600">
              최신 회차 당첨번호부터 회차별 상세 정보, 번호 출현 빈도, 홀짝 비율, 번호 합계까지 한 곳에서 확인할 수 있습니다.
            </p>
          </div>

          <DrawCard draw={latest} />
          <AdSlot label="본문 중간 광고 영역" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="저장 회차" value={usingSample ? "예시" : storedDraws.length} caption={usingSample ? "백필 전 미리보기" : "DB 기준"} />
            <StatCard title="최신 회차" value={latest?.draw_no || "-"} caption={latest?.draw_date || "-"} />
            <StatCard title="홀짝 비율" value={oddEven} caption="최신 회차 기준" />
            <StatCard title="고저 비율" value={highLow} caption="1~22 / 23~45" />
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">최근 10회 로또 당첨번호</h2>
              <Link href="/draws" className="text-sm font-bold text-sky-700">전체 회차 보기</Link>
            </div>
            <RecentDraws draws={recent} />
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link className="rounded-md border border-slate-200 bg-white p-4 text-sm font-bold shadow-sm" href="/stats">번호별 출현 빈도</Link>
            <Link className="rounded-md border border-slate-200 bg-white p-4 text-sm font-bold shadow-sm" href="/generator">로또번호 생성기</Link>
            <Link className="rounded-md border border-slate-200 bg-white p-4 text-sm font-bold shadow-sm" href="/insights/frequent-numbers">많이 나온 번호 분석</Link>
            <Link className="rounded-md border border-slate-200 bg-white p-4 text-sm font-bold shadow-sm" href="/insights/lotto-probability">로또 확률 기초</Link>
          </section>

          <SeoTextBlock title="로또 당첨번호와 통계를 함께 보는 이유">
            <p>
              로또 6/45 당첨번호는 회차별로 공개되는 번호 6개와 보너스 번호, 추첨일, 1등 당첨자 수, 1등 당첨금, 총 판매금액으로 구성됩니다.
              이 사이트는 공개 데이터를 회차별로 정리하고, 번호별 출현 빈도와 합계, 홀짝 비율, 고저 비율을 함께 보여줍니다.
            </p>
            <p>
              번호 통계는 과거 회차를 이해하기 위한 참고 자료입니다. 많이 나온 번호나 오랫동안 나오지 않은 번호를 확인할 수 있지만,
              특정 번호 조합의 결과를 보장하지 않습니다. 모든 콘텐츠는 오락 및 통계 참고용으로 제공됩니다.
            </p>
          </SeoTextBlock>
        </div>

        <aside className="space-y-6">
          <AdSlot label="사이드바 광고 영역" />
          <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold">많이 나온 번호 TOP 10</h2>
            <div className="mt-3 flex flex-wrap gap-2">{topNumbers.map((item) => <LottoBall key={item.number} number={item.number} />)}</div>
            <Link href="/insights/frequent-numbers" className="mt-3 block text-sm font-bold text-sky-700">자세히 보기</Link>
          </section>
          <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold">적게 나온 번호 참고</h2>
            <div className="mt-3 flex flex-wrap gap-2">{missingNumbers.map((item) => <LottoBall key={item.number} number={item.number} />)}</div>
            <Link href="/insights/missing-numbers" className="mt-3 block text-sm font-bold text-sky-700">미출현 번호 보기</Link>
          </section>
        </aside>
      </section>
    </div>
  );
}

function SetupNotice() {
  return (
    <section className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
      <strong>초기 데이터가 아직 없습니다.</strong> 화면이 비어 보이지 않도록 예시 데이터를 표시 중입니다.
      Supabase 설정 후 <code className="rounded bg-white px-1">/api/admin/backfill?secret=CRON_SECRET&start=1&max=300</code>을 실행하면 실제 회차로 바뀝니다.
    </section>
  );
}
