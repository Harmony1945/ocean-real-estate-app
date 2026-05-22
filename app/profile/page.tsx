import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";

export default function ProfilePage() {
  return (
    <DashboardShell
      title="Profil"
      description="Danışman bilgileri, ekip ayarları ve uygulama tercihleri."
    >
      <EmptyState
        label="Profil"
        title="Kullanıcı profili hazırlanacak"
        description="Kimlik doğrulama eklenince rol, ekip ve iletişim bilgileri burada yönetilecek."
      />
    </DashboardShell>
  );
}
