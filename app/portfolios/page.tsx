import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function PortfoliosPage() {
  return (
    <DashboardShell
      title="Portföyler"
      description="Aktif portföyleri hızlı arama ve filtrelerle yönetin."
    >
      <EmptyState
        label="Portföy yönetimi"
        title="Portföy listesi hazırlanacak"
        description="Bir sonraki adımda portföy kartları, filtreler ve detay sayfası eklenecek."
      />
    </DashboardShell>
  );
}
