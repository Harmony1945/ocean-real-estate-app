type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="rounded-lg border border-graphite-100 bg-white p-5 shadow-soft">
      <p className="text-sm font-semibold text-graphite-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-graphite-900">{value}</p>
      <p className="mt-2 text-sm font-medium text-ocean-600">{detail}</p>
    </article>
  );
}
