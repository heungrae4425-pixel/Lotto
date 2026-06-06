"use client";

import { useMemo, useState } from "react";
import LottoBall from "@/components/LottoBall";
import type { FrequencyItem } from "@/lib/types";

type Method = "random" | "stats" | "balanced";
type PickMode = "include" | "exclude";

const allNumbers = Array.from({ length: 45 }, (_, index) => index + 1);

function shuffle(numbers: number[]) {
  const copy = [...numbers];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function normalizePicked(include: number[], exclude: number[]) {
  const cleanInclude = Array.from(new Set(include)).filter((number) => number >= 1 && number <= 45).slice(0, 6);
  const cleanExclude = Array.from(new Set(exclude)).filter((number) => number >= 1 && number <= 45 && !cleanInclude.includes(number));
  return { include: cleanInclude, exclude: cleanExclude };
}

function randomNumbers(include: number[], exclude: number[]) {
  const normalized = normalizePicked(include, exclude);
  const picked = new Set(normalized.include);
  const pool = shuffle(allNumbers.filter((number) => !normalized.exclude.includes(number) && !picked.has(number)));

  pool.forEach((number) => {
    if (picked.size < 6) picked.add(number);
  });

  return Array.from(picked).slice(0, 6).sort((a, b) => a - b);
}

function statsNumbers(frequency: FrequencyItem[], include: number[], exclude: number[]) {
  const normalized = normalizePicked(include, exclude);
  const max = Math.max(...frequency.map((item) => item.mainCount), 1);
  const weighted = shuffle(
    frequency
      .filter((item) => !normalized.exclude.includes(item.number) && !normalized.include.includes(item.number))
      .flatMap((item) => Array.from({ length: Math.max(1, Math.round((item.mainCount / max) * 6)) }, () => item.number))
  );
  const picked = new Set(normalized.include);

  weighted.forEach((number) => {
    if (picked.size < 6) picked.add(number);
  });

  if (picked.size < 6) {
    randomNumbers(Array.from(picked), normalized.exclude).forEach((number) => picked.add(number));
  }

  return Array.from(picked).slice(0, 6).sort((a, b) => a - b);
}

function balancedNumbers(frequency: FrequencyItem[], include: number[], exclude: number[]) {
  const normalized = normalizePicked(include, exclude);
  const picked = new Set(normalized.include);
  const topPool = shuffle([...frequency].sort((a, b) => b.mainCount - a.mainCount).slice(0, 18).map((item) => item.number));
  const lowPool = shuffle([...frequency].sort((a, b) => a.mainCount - b.mainCount).slice(0, 18).map((item) => item.number));
  const neutralPool = shuffle(allNumbers);
  const pools = [topPool, lowPool, neutralPool];

  while (picked.size < 6) {
    const pool = pools[picked.size % pools.length];
    const next = pool.find((number) => !picked.has(number) && !normalized.exclude.includes(number));
    if (next) {
      picked.add(next);
    } else {
      randomNumbers(Array.from(picked), normalized.exclude).forEach((number) => picked.add(number));
    }
  }

  return Array.from(picked).slice(0, 6).sort((a, b) => a - b);
}

function analyzeGame(numbers: number[]) {
  const odd = numbers.filter((number) => number % 2 === 1).length;
  const low = numbers.filter((number) => number <= 22).length;
  const sum = numbers.reduce((total, number) => total + number, 0);
  return `홀짝 ${odd}:${6 - odd} / 저고 ${low}:${6 - low} / 합계 ${sum}`;
}

export default function NumberGenerator({ frequency }: { frequency: FrequencyItem[] }) {
  const [method, setMethod] = useState<Method>("random");
  const [pickMode, setPickMode] = useState<PickMode>("include");
  const [include, setInclude] = useState<number[]>([]);
  const [exclude, setExclude] = useState<number[]>([]);
  const [gameCount, setGameCount] = useState(5);
  const [games, setGames] = useState<number[][]>([]);
  const [copied, setCopied] = useState(false);
  const normalized = useMemo(() => normalizePicked(include, exclude), [include, exclude]);

  const toggleNumber = (number: number) => {
    setCopied(false);
    if (pickMode === "include") {
      setInclude((current) => {
        if (current.includes(number)) return current.filter((item) => item !== number);
        if (current.length >= 6) return current;
        return [...current, number];
      });
      setExclude((current) => current.filter((item) => item !== number));
      return;
    }

    setExclude((current) => {
      if (current.includes(number)) return current.filter((item) => item !== number);
      return [...current, number];
    });
    setInclude((current) => current.filter((item) => item !== number));
  };

  const generateOne = () => {
    if (method === "stats") return statsNumbers(frequency, normalized.include, normalized.exclude);
    if (method === "balanced") return balancedNumbers(frequency, normalized.include, normalized.exclude);
    return randomNumbers(normalized.include, normalized.exclude);
  };

  const generate = () => {
    const uniqueGames = new Map<string, number[]>();
    let attempts = 0;
    while (uniqueGames.size < gameCount && attempts < gameCount * 20) {
      const game = generateOne();
      uniqueGames.set(game.join("-"), game);
      attempts += 1;
    }
    setCopied(false);
    setGames(Array.from(uniqueGames.values()));
  };

  const clear = () => {
    setInclude([]);
    setExclude([]);
    setGames([]);
    setCopied(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(games.map((game, index) => `${index + 1}게임: ${game.join(", ")}`).join("\n"));
    setCopied(true);
  };

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <h2 className="text-xl font-bold text-ink">번호 조합 만들기</h2>
          <p className="mt-1 text-sm text-slate-500">포함하거나 제외할 번호를 선택한 뒤 원하는 방식으로 생성하세요.</p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {[1, 3, 5, 10].map((count) => (
            <button
              key={count}
              className={`rounded-md px-3 py-2 text-sm font-bold ${gameCount === count ? "bg-ink text-white" : "bg-slate-100 text-slate-700"}`}
              onClick={() => setGameCount(count)}
            >
              {count}게임
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button className={`rounded-md px-4 py-3 text-sm font-bold ${method === "random" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setMethod("random")}>
          완전 랜덤
        </button>
        <button className={`rounded-md px-4 py-3 text-sm font-bold ${method === "stats" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setMethod("stats")}>
          많이 나온 번호 기반
        </button>
        <button className={`rounded-md px-4 py-3 text-sm font-bold ${method === "balanced" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}`} onClick={() => setMethod("balanced")}>
          균형형 조합
        </button>
      </div>

      <div className="mt-5 rounded-md bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button className={`rounded-md px-3 py-2 text-sm font-bold ${pickMode === "include" ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setPickMode("include")}>
              포함 선택
            </button>
            <button className={`rounded-md px-3 py-2 text-sm font-bold ${pickMode === "exclude" ? "bg-rose-600 text-white" : "bg-white text-slate-700"}`} onClick={() => setPickMode("exclude")}>
              제외 선택
            </button>
          </div>
          <p className="text-sm text-slate-500">포함 {normalized.include.length}/6개 · 제외 {normalized.exclude.length}개</p>
        </div>

        <div className="mt-4 grid grid-cols-9 gap-2 sm:grid-cols-15">
          {allNumbers.map((number) => {
            const isInclude = normalized.include.includes(number);
            const isExclude = normalized.exclude.includes(number);
            return (
              <button
                key={number}
                className={`h-9 rounded-full text-sm font-bold ${
                  isInclude ? "bg-emerald-600 text-white" : isExclude ? "bg-rose-500 text-white line-through" : "bg-white text-slate-700"
                }`}
                onClick={() => toggleNumber(number)}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button className="rounded-md bg-ink px-5 py-3 text-sm font-bold text-white" onClick={generate}>번호 생성</button>
        <button className="rounded-md bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-40" disabled={!games.length} onClick={copy}>
          {copied ? "복사 완료" : "결과 복사"}
        </button>
        <button className="rounded-md bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200" onClick={clear}>초기화</button>
      </div>

      <div className="mt-5 grid gap-3">
        {games.map((game, index) => (
          <div key={`${game.join("-")}-${index}`} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-14 text-sm font-bold text-slate-500">{index + 1}게임</span>
              {game.map((number) => <LottoBall key={number} number={number} />)}
            </div>
            <p className="mt-3 text-xs text-slate-500">{analyzeGame(game)}</p>
          </div>
        ))}
      </div>

      {!games.length ? (
        <div className="mt-5 rounded-md border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">
          아직 생성된 번호가 없습니다. 조건을 선택하고 번호 생성을 눌러보세요.
        </div>
      ) : null}

      <p className="mt-4 text-sm leading-6 text-slate-500">
        생성 결과는 오락 및 통계 참고용입니다. 특정 번호 조합의 결과를 보장하지 않습니다.
      </p>
    </section>
  );
}
