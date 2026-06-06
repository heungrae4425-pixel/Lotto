import type { Metadata } from "next";
import Link from "next/link";
import DrawCard from "@/components/DrawCard";
import SeoTextBlock from "@/components/SeoTextBlock";
import { getDraws } from "@/lib/lotto";
import { withSampleFallback } from "@/lib/sample-data";
import { absoluteUrl } from "@/lib/seo";
import type { LottoDraw } from "@/lib/types";

export const metadata: Metadata = {
  title: "로또 회차별 당첨번호 목록",
  description: "로또 6/45 회차별 당첨번호를 최신순으로 조회하고 회차 번호로 검색하세요.",
  alternates: {
    canonical: absoluteUrl("/draws")
  }
};

export default async function DrawsPage({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const limit = 20;
  const q = params.q || "";
  let storedDraws: LottoDraw[] = [];
  let count = 0;

  try {
    const result = await getDraws(limit, (page - 1) * limit, q);
    storedDraws = result.draws;
    count = result.count;
  } catch {
    storedDraws = [];
    count = 0;
  }

  const { draws, usingSample } = withSampleFallback(storedDraws);
  const totalPages = usingSample ? 1 : Math.max(1, Math.ceil(count / limit));

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">로또 회차별 당첨번호 목록</h1>
      <p className="mt-2 text-slate-600">최신 회차부터 과거 회차까지 로또 6/45 당첨번호와 보너스 번호를 확인할 수 있습니다.</p>

      {usingSample ? (
        <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          아직 저장된 회차가 없어 예시 회차를 보여주고 있습니다. 초기 백필 후 실제 목록으로 바뀝니다.
        </p>
      ) : null}

      <form className="mt-5 flex gap-2">
        <input name="q" defaultValue={q} className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="예: 1226" />
        <button className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-white">검색</button>
      </form>

      <div className="mt-6 grid gap-4">{draws.map((draw) => <DrawCard key={draw.draw_no} draw={draw} />)}</div>

      <div className="mt-8 flex items-center justify-between text-sm font-semibold text-sky-700">
        <Link href={`/draws?page=${Math.max(1, page - 1)}${q ? `&q=${q}` : ""}`}>이전</Link>
        <span className="text-slate-500">{page} / {totalPages}</span>
        <Link href={`/draws?page=${Math.min(totalPages, page + 1)}${q ? `&q=${q}` : ""}`}>다음</Link>
      </div>

      <div className="mt-8">
        <SeoTextBlock title="회차별 로또 당첨번호 조회 안내">
          <p>
            회차 목록에서는 각 회차의 당첨번호 6개와 보너스 번호, 추첨일, 1등 당첨금을 빠르게 확인할 수 있습니다.
            특정 회차를 찾고 싶다면 회차 번호를 검색한 뒤 상세 페이지에서 홀짝 비율, 고저 비율, 번호 합계까지 함께 확인하세요.
          </p>
        </SeoTextBlock>
      </div>
    </div>
  );
}
