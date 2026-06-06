const colorByNumber = (number: number) => {
  if (number <= 10) return "bg-amber-400 text-slate-950";
  if (number <= 20) return "bg-sky-500 text-white";
  if (number <= 30) return "bg-rose-500 text-white";
  if (number <= 40) return "bg-slate-600 text-white";
  return "bg-emerald-500 text-white";
};

export default function LottoBall({ number, bonus = false }: { number: number; bonus?: boolean }) {
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${colorByNumber(number)} ${
        bonus ? "ring-4 ring-white outline outline-2 outline-slate-300" : ""
      }`}
      aria-label={`${number}번${bonus ? " 보너스" : ""}`}
    >
      {number}
    </span>
  );
}
