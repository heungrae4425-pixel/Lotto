import { NextResponse } from "next/server";
import { calculateFrequency, calculateOddEven, calculateSum, drawNumbers, getAllDraws } from "@/lib/lotto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = Math.min(1000, Math.max(1, Number(searchParams.get("range") || 100)));
  const draws = (await getAllDraws()).slice(0, range);
  const frequency = calculateFrequency(draws);
  const sums = draws.map((draw) => calculateSum(drawNumbers(draw)));
  const sumBuckets = [
    { range: "21-80", count: sums.filter((sum) => sum <= 80).length },
    { range: "81-120", count: sums.filter((sum) => sum >= 81 && sum <= 120).length },
    { range: "121-160", count: sums.filter((sum) => sum >= 121 && sum <= 160).length },
    { range: "161-200", count: sums.filter((sum) => sum >= 161 && sum <= 200).length },
    { range: "201-255", count: sums.filter((sum) => sum >= 201).length }
  ];
  const oddEven = draws.reduce(
    (acc, draw) => {
      const value = calculateOddEven(drawNumbers(draw));
      acc.odd += value.odd;
      acc.even += value.even;
      return acc;
    },
    { odd: 0, even: 0 }
  );

  return NextResponse.json({
    range,
    drawCount: draws.length,
    frequency,
    mostFrequent: [...frequency].sort((a, b) => b.mainCount - a.mainCount).slice(0, 10),
    leastFrequent: [...frequency].sort((a, b) => a.mainCount - b.mainCount).slice(0, 10),
    oddEven,
    sumDistribution: {
      min: sums.length ? Math.min(...sums) : 0,
      max: sums.length ? Math.max(...sums) : 0,
      average: sums.length ? Math.round(sums.reduce((a, b) => a + b, 0) / sums.length) : 0,
      buckets: sumBuckets
    }
  });
}
