import DrawCard from "@/components/DrawCard";
import type { LottoDraw } from "@/lib/types";

export default function RecentDraws({ draws }: { draws: LottoDraw[] }) {
  return (
    <div className="grid gap-4">
      {draws.map((draw) => <DrawCard key={draw.draw_no} draw={draw} />)}
    </div>
  );
}
