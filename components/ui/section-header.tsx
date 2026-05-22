type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description
}: SectionHeaderProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-graphite-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-graphite-500">{description}</p>
    </div>
  );
}
