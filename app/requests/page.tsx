import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function RequestsPage() {
  return (
    <DashboardShell
      title="Talepler"
      description="Alıcı ve danışman arayışlarını tek ekranda takip edin."
    >
      <EmptyState
        label="Talep yönetimi"
        title="Talep akışı hazırlanacak"
        description="Eşleşme altyapısı gelmeden önce talep kartları ve temel durumlar kurulacak."
      />
    </DashboardShell>
  );
}
