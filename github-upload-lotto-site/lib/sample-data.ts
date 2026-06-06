import type { LottoDraw } from "@/lib/types";

export const sampleDraws: LottoDraw[] = [
  {
    draw_no: 1,
    draw_date: "2002-12-07",
    no1: 10,
    no2: 23,
    no3: 29,
    no4: 33,
    no5: 37,
    no6: 40,
    bonus_no: 16,
    first_winner_count: 0,
    first_win_amount: 0,
    first_total_amount: 0,
    total_sell_amount: 3681782000
  },
  {
    draw_no: 2,
    draw_date: "2002-12-14",
    no1: 9,
    no2: 13,
    no3: 21,
    no4: 25,
    no5: 32,
    no6: 42,
    bonus_no: 2,
    first_winner_count: 1,
    first_win_amount: 2002006800,
    first_total_amount: 2002006800,
    total_sell_amount: 4904274000
  },
  {
    draw_no: 3,
    draw_date: "2002-12-21",
    no1: 11,
    no2: 16,
    no3: 19,
    no4: 21,
    no5: 27,
    no6: 31,
    bonus_no: 30,
    first_winner_count: 1,
    first_win_amount: 2000000000,
    first_total_amount: 2000000000,
    total_sell_amount: 4729342000
  },
  {
    draw_no: 4,
    draw_date: "2002-12-28",
    no1: 14,
    no2: 27,
    no3: 30,
    no4: 31,
    no5: 40,
    no6: 42,
    bonus_no: 2,
    first_winner_count: 0,
    first_win_amount: 0,
    first_total_amount: 0,
    total_sell_amount: 5271464000
  },
  {
    draw_no: 5,
    draw_date: "2003-01-04",
    no1: 16,
    no2: 24,
    no3: 29,
    no4: 40,
    no5: 41,
    no6: 42,
    bonus_no: 3,
    first_winner_count: 0,
    first_win_amount: 0,
    first_total_amount: 0,
    total_sell_amount: 6277102000
  }
];

export function withSampleFallback(draws: LottoDraw[]) {
  return draws.length > 0 ? { draws, usingSample: false } : { draws: [...sampleDraws].sort((a, b) => b.draw_no - a.draw_no), usingSample: true };
}
