export default function AdSlot({ label = "광고 영역" }: { label?: string }) {
  return (
    <aside className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-400">
      {label}
      {/*
        Google AdSense example:
        <ins className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto"
          data-full-width-responsive="true" />
      */}
    </aside>
  );
}
