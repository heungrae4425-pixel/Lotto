import SeoTextBlock from "@/components/SeoTextBlock";

export const metadata = {
  title: "로또 많이 나온 번호 통계 읽는 법",
  description: "로또 6/45 많이 나온 번호를 통계 참고 관점에서 읽는 방법을 설명합니다."
};

export default function FrequentNumbersPage() {
  return (
    <div className="container-page py-8">
      <SeoTextBlock title="많이 나온 번호는 어떻게 해석할까">
        <p>많이 나온 번호는 과거 회차에서 특정 번호가 당첨번호로 포함된 횟수를 세어 정리한 값입니다. 이 값은 전체 흐름을 빠르게 살펴보는 데 도움이 됩니다.</p>
        <p>무작위 추첨에서는 각 회차가 독립적으로 진행됩니다. 과거에 자주 나온 번호가 다음 회차에서도 더 유리하다고 단정할 수 없고, 적게 나온 번호가 곧 등장해야 한다고 볼 수도 없습니다.</p>
        <p>통계를 볼 때는 분석 범위를 함께 확인해야 합니다. 전체 회차 기준 순위와 최근 10회, 30회, 50회 기준 순위는 서로 다를 수 있습니다.</p>
        <p>번호별 빈도 차이는 시간이 지나며 계속 변합니다. 새로운 회차가 추가되면 상위 번호가 바뀔 수 있고, 같은 번호라도 전체 기준과 최근 기준에서 다르게 보일 수 있습니다.</p>
        <p>이 사이트는 공개 데이터를 보기 쉽게 정리한 통계 콘텐츠이며, 이용자는 오락과 학습 목적으로만 확인하는 것이 좋습니다.</p>
      </SeoTextBlock>
    </div>
  );
}
