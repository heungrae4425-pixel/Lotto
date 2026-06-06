import { getServerSupabase } from "@/lib/supabase";
import type { DrawNumbers, FrequencyItem, LottoDraw } from "@/lib/types";

const LOTTO_RESULT_URL = "https://www.dhlottery.co.kr/lt645/result";
const LOTTO_RESULT_API_URL = "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do";

export function drawNumbers(draw: LottoDraw): DrawNumbers {
  return [draw.no1, draw.no2, draw.no3, draw.no4, draw.no5, draw.no6];
}

type LottoResultApiItem = {
  ltEpsd: number;
  tm1WnNo: number;
  tm2WnNo: number;
  tm3WnNo: number;
  tm4WnNo: number;
  tm5WnNo: number;
  tm6WnNo: number;
  bnsWnNo: number;
  ltRflYmd: string;
  rnk1WnNope: number;
  rnk1WnAmt: number;
  rnk1SumWnAmt: number;
  wholEpsdSumNtslAmt: number;
  rlvtEpsdSumNtslAmt: number;
};

function formatYmd(value: string) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function mapResultApiItem(item: LottoResultApiItem): LottoDraw {
  return {
    draw_no: Number(item.ltEpsd),
    draw_date: formatYmd(String(item.ltRflYmd)),
    no1: Number(item.tm1WnNo),
    no2: Number(item.tm2WnNo),
    no3: Number(item.tm3WnNo),
    no4: Number(item.tm4WnNo),
    no5: Number(item.tm5WnNo),
    no6: Number(item.tm6WnNo),
    bonus_no: Number(item.bnsWnNo),
    first_winner_count: Number(item.rnk1WnNope || 0),
    first_win_amount: Number(item.rnk1WnAmt || 0),
    first_total_amount: Number(item.rnk1SumWnAmt || 0),
    total_sell_amount: Number(item.wholEpsdSumNtslAmt || item.rlvtEpsdSumNtslAmt || 0)
  };
}

export async function fetchLottoDraw(drawNo: number): Promise<LottoDraw | null> {
  const response = await fetch(`${LOTTO_RESULT_API_URL}?srchLtEpsd=${drawNo}`, {
    cache: "no-store",
    headers: {
      "user-agent": "Mozilla/5.0 lotto-645-content-site/1.0",
      accept: "application/json,text/plain,*/*",
      referer: `${LOTTO_RESULT_URL}?drwNo=${drawNo}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch draw ${drawNo}: ${response.status}`);
  }

  const payload = (await response.json()) as { data?: { list?: LottoResultApiItem[] } };
  const item = payload.data?.list?.find((entry) => Number(entry.ltEpsd) === drawNo);
  if (!item) {
    return null;
  }

  return mapResultApiItem(item);
}

export async function fetchLatestDrawNoFromResultPage(): Promise<number> {
  const response = await fetch(LOTTO_RESULT_URL, {
    cache: "no-store",
    headers: {
      "user-agent": "Mozilla/5.0 lotto-645-content-site/1.0",
      accept: "text/html,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lotto result page: ${response.status}`);
  }

  const html = await response.text();
  const matches = [
    ...Array.from(html.matchAll(/drwNo=(\d{1,5})/g)),
    ...Array.from(html.matchAll(/value=["']?(\d{1,5})["']?/g)),
    ...Array.from(html.matchAll(/(\d{1,5})\s*\uD68C/g))
  ];
  const drawNos = matches
    .map((match) => Number(match[1]))
    .filter((drawNo) => Number.isInteger(drawNo) && drawNo > 0 && drawNo < 10000);

  const latestDrawNo = Math.max(...drawNos);
  if (!Number.isFinite(latestDrawNo)) {
    throw new Error("Could not find latest draw number from lotto result page.");
  }

  return latestDrawNo;
}

export async function upsertDraw(draw: LottoDraw) {
  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("lotto_draws")
    .upsert(draw, { onConflict: "draw_no" });

  if (error) {
    throw error;
  }
}

export async function getLatestDraw(): Promise<LottoDraw | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("lotto_draws")
    .select("*")
    .order("draw_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getDrawByNo(drawNo: number): Promise<LottoDraw | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("lotto_draws")
    .select("*")
    .eq("draw_no", drawNo)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getDraws(limit = 30, offset = 0, search?: string): Promise<{ draws: LottoDraw[]; count: number }> {
  const supabase = getServerSupabase();
  let query = supabase
    .from("lotto_draws")
    .select("*", { count: "exact" })
    .order("draw_no", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const drawNo = Number(search);
    if (Number.isInteger(drawNo)) {
      query = query.eq("draw_no", drawNo);
    }
  }

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  return { draws: data || [], count: count || 0 };
}

export async function getAllDraws(): Promise<LottoDraw[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("lotto_draws")
    .select("*")
    .order("draw_no", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function backfillDraws(startDraw = 1, waitMs = 180, maxDraws = Number.POSITIVE_INFINITY, endDraw?: number) {
  let saved = 0;
  let lastChecked = startDraw - 1;

  for (let drawNo = startDraw; ; drawNo += 1) {
    if (endDraw && drawNo > endDraw) {
      return { saved, latestDrawNo: endDraw, stoppedAt: null, nextStart: null, lastChecked, completed: true };
    }

    if (saved >= maxDraws) {
      return { saved, latestDrawNo: endDraw || null, stoppedAt: null, nextStart: drawNo, lastChecked, completed: false };
    }

    const draw = await fetchLottoDraw(drawNo);
    lastChecked = drawNo;
    if (!draw) {
      return { saved, latestDrawNo: endDraw || null, stoppedAt: drawNo, nextStart: null, lastChecked, completed: false };
    }

    await upsertDraw(draw);
    saved += 1;
    await delay(waitMs);
  }
}

export async function updateLatestDraw(waitMs = 180) {
  const latestPublishedDrawNo = await fetchLatestDrawNoFromResultPage();
  const latest = await getLatestDraw();
  const startDraw = latest ? latest.draw_no + 1 : 1;
  return backfillDraws(startDraw, waitMs, Number.POSITIVE_INFINITY, latestPublishedDrawNo);
}

export async function backfillDrawsFromResultPage(startDraw = 1, waitMs = 180, maxDraws = 100) {
  const latestPublishedDrawNo = await fetchLatestDrawNoFromResultPage();
  return backfillDraws(startDraw, waitMs, maxDraws, latestPublishedDrawNo);
}

export function calculateOddEven(numbers: number[]) {
  const odd = numbers.filter((number) => number % 2 === 1).length;
  return { odd, even: numbers.length - odd, label: `${odd}:${numbers.length - odd}` };
}

export function calculateHighLow(numbers: number[]) {
  const low = numbers.filter((number) => number <= 22).length;
  return { low, high: numbers.length - low, label: `${low}:${numbers.length - low}` };
}

export function calculateSum(numbers: number[]) {
  return numbers.reduce((sum, number) => sum + number, 0);
}

export function hasConsecutive(numbers: number[]) {
  const sorted = [...numbers].sort((a, b) => a - b);
  return sorted.some((number, index) => index > 0 && number - sorted[index - 1] === 1);
}

export function calculateFrequency(draws: LottoDraw[]): FrequencyItem[] {
  const items = Array.from({ length: 45 }, (_, index) => ({
    number: index + 1,
    mainCount: 0,
    bonusCount: 0,
    totalCount: 0
  }));

  draws.forEach((draw) => {
    drawNumbers(draw).forEach((number) => {
      items[number - 1].mainCount += 1;
      items[number - 1].totalCount += 1;
    });
    items[draw.bonus_no - 1].bonusCount += 1;
  });

  return items;
}

export function generateRandomNumbers(exclude: number[] = [], include: number[] = []): number[] {
  const included = Array.from(new Set(include.filter((number) => number >= 1 && number <= 45))).slice(0, 6);
  const excluded = new Set(exclude);
  const pool = Array.from({ length: 45 }, (_, index) => index + 1).filter(
    (number) => !excluded.has(number) && !included.includes(number)
  );

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return [...included, ...pool.slice(0, 6 - included.length)].sort((a, b) => a - b);
}

export function generateStatsBasedNumbers(frequency: FrequencyItem[], exclude: number[] = [], include: number[] = []) {
  const excluded = new Set(exclude);
  const maxCount = Math.max(...frequency.map((item) => item.mainCount), 1);
  const weightedPool = frequency
    .filter((item) => !excluded.has(item.number) && !include.includes(item.number))
    .flatMap((item) => Array.from({ length: Math.max(1, Math.round((item.mainCount / maxCount) * 5)) }, () => item.number));

  const picked = new Set(include.filter((number) => number >= 1 && number <= 45).slice(0, 6));
  while (picked.size < 6 && weightedPool.length > 0) {
    picked.add(weightedPool[Math.floor(Math.random() * weightedPool.length)]);
  }

  if (picked.size < 6) {
    generateRandomNumbers(exclude, Array.from(picked)).forEach((number) => picked.add(number));
  }

  return Array.from(picked).slice(0, 6).sort((a, b) => a - b);
}

export function formatKRW(amount?: number | null) {
  if (amount === null || amount === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(amount);
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;

  return Boolean(secret && (bearer === secret || querySecret === secret));
}
