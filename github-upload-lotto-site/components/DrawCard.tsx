import Link from "next/link";
import LottoBall from "@/components/LottoBall";
import { drawNumbers, formatKRW } from "@/lib/lotto";
import type { LottoDraw } from "@/lib/types";

export default function DrawCard({ draw }: { draw: LottoDraw }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/draw/${draw.draw_no}`} className="text-lg font-bold text-ink">
            {draw.draw_no}회 로또 당첨번호
          </Link>
          <p className="mt-1 text-sm text-muted">추첨일 {draw.draw_date}</p>
        </div>
        <p className="text-sm font-semibold text-slate-600">1등 {formatKRW(draw.first_win_amount)}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {drawNumbers(draw).map((number) => <LottoBall key={number} number={number} />)}
        <span className="px-1 text-slate-400">+</span>
        <LottoBall number={draw.bonus_no} bonus />
      </div>
    </article>
  );
}
