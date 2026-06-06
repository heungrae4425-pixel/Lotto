export type LottoDraw = {
  id?: string;
  draw_no: number;
  draw_date: string;
  no1: number;
  no2: number;
  no3: number;
  no4: number;
  no5: number;
  no6: number;
  bonus_no: number;
  first_winner_count: number | null;
  first_win_amount: number | null;
  first_total_amount: number | null;
  total_sell_amount: number | null;
  created_at?: string;
  updated_at?: string;
};

export type DrawNumbers = [number, number, number, number, number, number];

export type LottoApiResponse = {
  returnValue: "success" | "fail";
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
  firstPrzwnerCo: number;
  firstWinamnt: number;
  firstAccumamnt: number;
  totSellamnt: number;
};

export type FrequencyItem = {
  number: number;
  mainCount: number;
  bonusCount: number;
  totalCount: number;
};
