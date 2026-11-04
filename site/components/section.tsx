export function Section({ title, note, children, id }: { title: string; note?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mt-14 first:mt-0">
      <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
        <h2 className="serif text-xl text-ink">{title}</h2>
        {note && <span className="text-xs text-slate">{note}</span>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
