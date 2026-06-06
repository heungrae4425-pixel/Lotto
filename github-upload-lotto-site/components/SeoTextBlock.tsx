export default function SeoTextBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 leading-8 text-slate-700 shadow-sm">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm md:text-base">{children}</div>
    </section>
  );
}
