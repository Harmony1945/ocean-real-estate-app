type EmptyStateProps = {
  label: string;
  title: string;
  description: string;
};

export function EmptyState({ label, title, description }: EmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-graphite-100 bg-white p-6 shadow-soft md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-500">
        {label}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-graphite-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-500">
        {description}
      </p>
    </section>
  );
}
