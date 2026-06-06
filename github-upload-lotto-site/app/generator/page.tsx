import NumberGenerator from "@/components/NumberGenerator";
import SeoTextBlock from "@/components/SeoTextBlock";
import StatCard from "@/components/StatCard";
import { calculateFrequency, getAllDraws } from "@/lib/lotto";
import { withSampleFallback } from "@/lib/sample-data";
import type { LottoDraw } from "@/lib/types";

export const metadata = {
  title: "로또번호 생성기",
  description: "완전 랜덤, 많이 나온 번호 기반, 균형형 방식으로 오락용 로또 번호 조합을 생성합니다."
};

export default async function GeneratorPage() {
  let storedDraws: LottoDraw[] = [];
  try {
    storedDraws = await getAllDraws();
  } catch {
    storedDraws = [];
  }

  const { draws, usingSample } = withSampleFallback(storedDraws);
  const frequency = calculateFrequency(draws);
  const topNumber = [...frequency].sort((a, b) => b.mainCount - a.mainCount)[0];
  const lowNumber = [...frequency].sort((a, b) => a.mainCount - b.mainCount)[0];

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold">로또번호 생성기</h1>
      <p className="mt-2 text-slate-600">포함 번호와 제외 번호를 직접 고르고, 여러 방식으로 번호 조합을 만들어볼 수 있습니다.</p>

      {usingSample ? (
        <p className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          아직 실제 데이터가 없어 통계 기반 생성은 예시 데이터로 동작합니다. 백필 후에는 Supabase에 저장된 실제 회차 통계를 사용합니다.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard title="분석 회차" value={usingSample ? "예시" : draws.length} caption="생성기 통계 기준" />
        <StatCard title="상위 빈도 번호" value={topNumber ? `${topNumber.number}번` : "-"} caption={`${topNumber?.mainCount || 0}회 출현`} />
        <StatCard title="하위 빈도 번호" value={lowNumber ? `${lowNumber.number}번` : "-"} caption={`${lowNumber?.mainCount || 0}회 출현`} />
      </div>

      <div className="mt-6">
        <NumberGenerator frequency={frequency} />
      </div>

      <div className="mt-6">
        <SeoTextBlock title="생성 방식 안내">
          <p>
            완전 랜덤은 1부터 45까지의 숫자를 같은 후보로 보고 조합합니다. 많이 나온 번호 기반은 저장된 회차에서 출현 빈도가 높은 번호가
            후보에 더 자주 들어가도록 구성합니다. 균형형 조합은 출현 빈도가 높은 번호, 낮은 번호, 전체 번호를 섞어 조합합니다.
          </p>
          <p>
            포함 번호는 반드시 결과에 들어가며, 제외 번호는 결과에서 빠집니다. 생성 결과는 오락 및 통계 참고용이며 특정 결과를 보장하지
            않습니다.
          </p>
        </SeoTextBlock>
      </div>
    </div>
  );
}
