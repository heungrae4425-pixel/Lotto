import SeoTextBlock from "@/components/SeoTextBlock";

export const metadata = {
  title: "로또 홀짝 비율 통계",
  description: "로또 당첨번호의 홀수와 짝수 비율을 통계 참고 관점에서 설명합니다."
};

export default function OddEvenRatioPage() {
  return (
    <div className="container-page py-8">
      <SeoTextBlock title="홀짝 비율 통계 이해하기">
        <p>로또 6/45 한 회차의 당첨번호 6개는 홀수와 짝수의 조합으로 표현할 수 있습니다. 홀수 3개와 짝수 3개라면 3:3, 홀수 4개와 짝수 2개라면 4:2로 정리합니다.</p>
        <p>홀짝 비율은 회차별 번호 구성을 빠르게 이해하는 기초 지표입니다. 숫자 자체를 하나씩 보지 않아도 해당 회차가 균형형인지, 한쪽으로 치우친 조합인지 볼 수 있습니다.</p>
        <p>다만 홀짝 비율은 미래 결과를 설명하는 기준이 아닙니다. 특정 기간에 3:3 조합이 자주 보였다고 해서 다음 회차에도 같은 비율이 나와야 하는 것은 아닙니다.</p>
        <p>번호 합계, 고저 비율, 연속번호 여부 같은 다른 지표와 함께 보면 회차별 특성을 더 풍부하게 살펴볼 수 있습니다.</p>
        <p>이 사이트는 로또 번호를 정보성 자료로 다룹니다. 모든 통계는 참고용이며 특정 조합을 권장하지 않습니다.</p>
      </SeoTextBlock>
    </div>
  );
}
