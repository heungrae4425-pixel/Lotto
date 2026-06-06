export default function StatCard({ title, value, caption }: { title: string; value: string | number; caption?: string }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-muted">{title}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {caption ? <p className="mt-1 text-xs text-slate-500">{caption}</p> : null}
    </section>
  );
}
