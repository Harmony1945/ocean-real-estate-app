import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";

const todayStats = [
  { label: "Aktif portföy", value: "128", detail: "12 yeni kayıt" },
  { label: "Açık talep", value: "36", detail: "8 acil talep" },
  { label: "Eşleşme", value: "24", detail: "Bugün incelenecek" }
];

const focusItems = [
  "Yüksek öncelikli alıcı taleplerini incele",
  "Yeni portföyleri hızlı filtrelerle kontrol et",
  "Bekleyen danışman takiplerini tamamla"
];

export default function HomePage() {
  return (
    <DashboardShell
      title="Ana Sayfa"
      description="Portföy, talep ve günlük takiplerin özeti."
    >
      <section className="grid gap-3 sm:grid-cols-3">
        {todayStats.map((stat) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="rounded-lg border border-graphite-100 bg-white p-5 shadow-soft">
        <SectionHeader
          eyebrow="Bugün"
          title="Danışman odağı"
          description="Saha akışına uygun kısa ve net iş listesi."
        />
        <div className="mt-5 grid gap-3">
          {focusItems.map((item, index) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-md border border-graphite-100 bg-graphite-50 p-4"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ocean-900 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm font-medium text-graphite-700">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
