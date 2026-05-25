"use client";

import Link from "next/link";
import { useAuthContext } from "../auth-context";
import { getInitials, MenuPanelContent } from "../oos-navigation";
import { getUserDisplayName } from "@/lib/supabase/client";

type ContentPanelData = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
  href?: string;
  cta?: string;
};

const panels: ContentPanelData[] = [
  {
    id: "bildirimler",
    title: "Bildirimler",
    body: "Henüz kritik bildirim yok. Yeni portföy onayı, arayış eşleşmesi ve ödeme hatırlatmaları burada görünür.",
    bullets: ["Bebek yalı dairesi için yeni eşleşme hazır.", "Aylık katılım ödeme tarihi yaklaşıyor.", "Yetki belgesi kontrolü bekleyen portföy var."]
  },
  {
    id: "gorevlerim",
    title: "Görevlerim",
    body: "Bugünün operasyon listesi hızlı kapatılacak danışman aksiyonlarına odaklanır.",
    bullets: ["Yeni arayışları fiyat aralığına göre gözden geçir.", "Eksik malik bilgisi olan portföyü tamamla.", "Güçlü eşleşmeleri müşteriye ilet."]
  },
  {
    id: "portfoylerim",
    title: "Portföylerim",
    body: "Aktif portföy listesi, ilan doğrulama ve portföy düzenleme akışları için ana portföy sayfasına bağlanır.",
    href: "/portfolios",
    cta: "Portföyleri Aç"
  },
  {
    id: "arayislarim",
    title: "Arayışlarım",
    body: "Müşteri ve yatırımcı talepleri, eşleşme kalitesi ve takip durumu arayış sayfasında yönetilir.",
    href: "/requests",
    cta: "Arayışları Aç"
  },
  {
    id: "eslesmeler",
    title: "Eşleşmeler",
    body: "OOS; lokasyon, bütçe, portföy tipi ve aciliyet sinyallerini bir araya getirerek güçlü adayları öne çıkarır.",
    bullets: ["Güçlü eşleşmeler üst sırada gösterilir.", "Eksik veri olan kayıtlar manuel kontrol için ayrılır.", "Danışman kendi portföy ve arayışlarına öncelik verir."]
  },
  {
    id: "odemeler",
    title: "Ödemeler",
    body: "Aylık ofis ve profesyonel katılım ödemeleri için sade takip paneli.",
    bullets: ["Aylık katılım: 7.500 TL + KDV", "Durum: ödeme yöntemi bekleniyor", "Dekont ve fatura bağlantıları burada listelenecek."]
  },
  {
    id: "vergi-hesaplayici",
    title: "Vergi Hesaplayıcı",
    body: "Komisyon geliri için KDV ve gelir vergisi etkisini hızlıca tahmin etmeye yarayan çalışma alanı.",
    bullets: ["KDV oranı varsayılan olarak %20 alınır.", "Gelir vergisi matrahı danışman beyanına göre netleştirilir.", "Sonuçlar ön bilgi niteliğindedir."]
  },
  {
    id: "harita",
    title: "Harita",
    body: "İstanbul portföylerini bölge, fiyat ve işlem tipine göre incelemek için harita çalışma paneli.",
    bullets: ["Sarıyer, Beşiktaş ve Kadıköy yoğun bölgeler olarak izlenir.", "Portföy kartları harita pinleriyle eşleşir.", "Mobilde liste öncelikli görünüm korunur."]
  },
  {
    id: "islem-ve-komisyonlar",
    title: "İşlem ve Komisyonlar",
    body: "Satış ve kiralama süreçlerinde komisyon takibi, işlem aşaması ve belge kontrolü için özet görünüm.",
    bullets: ["Yetki, teklif, kapora ve kapanış adımları ayrılır.", "Brüt komisyon ve danışman payı ayrı takip edilir.", "Eksik belge durumları görev listesine düşer."]
  },
  {
    id: "raporlar",
    title: "Raporlar",
    body: "Portföy performansı, arayış dönüşümü ve eşleşme kalitesi için sade rapor alanı.",
    bullets: ["Haftalık yeni portföy sayısı", "Aktif arayış dönüşüm oranı", "Kapanışa yaklaşan işlem listesi"]
  },
  {
    id: "hesap-ve-guvenlik",
    title: "Hesap ve Güvenlik",
    body: "Oturum, e-posta doğrulama, şifre ve cihaz güvenliği ayarları burada toplanır.",
    bullets: ["E-posta Supabase Auth üzerinden yönetilir.", "Rol bilgisi sistem tarafından atanır.", "Şifre ve oturum ayarları güvenli kanal üzerinden güncellenir."]
  },
  {
    id: "ayarlar",
    title: "Ayarlar",
    body: "Tema, bildirim ve uygulama tercihleri için kişisel çalışma ayarları.",
    bullets: ["Koyu/açık tema tercihi cihazda saklanır.", "Mobil alt navigasyon varsayılan olarak açıktır.", "Bildirim tercihleri operasyon akışına göre genişletilecek."]
  },
  {
    id: "yardim-ve-destek",
    title: "Yardım ve Destek",
    body: "Operasyon soruları, hesap desteği ve platform kullanımı için destek merkezi.",
    bullets: ["Destek: support@oceanos.example", "Çalışma saatleri: hafta içi 09:00-18:00", "Acil işlem soruları için ofis yöneticinize ulaşın."]
  },
  {
    id: "sss",
    title: "Sıkça Sorulan Sorular",
    body: "En sık gelen danışman soruları için kısa yanıtlar.",
    bullets: ["Portföy ekleme ana sayfadaki hızlı aksiyonla başlar.", "Arayış eşleşmeleri bütçe ve lokasyon uyumuna göre sıralanır.", "Vergi hesapları ön bilgi sağlar; mali müşavir teyidi gerekir."]
  },
  {
    id: "yasal-ve-kurumsal",
    title: "Yasal ve Kurumsal",
    body: "Star Girişim ve Yatırım A.Ş. kurumsal bilgileri ve yasal doküman bağlantıları.",
    bullets: ["Kullanım koşulları", "Gizlilik ve KVKK bilgilendirmesi", "Komisyon ve işlem ilkeleri"]
  }
];

export default function MenuRoutePage() {
  const { user, profile, onLogout } = useAuthContext();
  const displayName = getUserDisplayName(user, profile) || "OOS Advisor";

  return (
    <main className="min-h-screen bg-stone-50 px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-20 text-slate-950 dark:bg-black dark:text-slate-100 sm:px-6 md:bg-slate-950 md:pt-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-500">Ocean Operating System</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Menü</h1>
        </header>

        <section className="md:liquid-glass-strong md:rounded-[2rem] md:p-3">
          <MenuPanelContent
            displayName={displayName}
            email={user?.email || "Kurulum bekleniyor"}
            initials={getInitials(displayName)}
            company={profile?.company || "Şirket bilgisi bekleniyor"}
            phone={profile?.phone || "Telefon bilgisi bekleniyor"}
            onLogout={onLogout}
          />
        </section>

        <section className="mt-10 grid gap-4">
          <ProfilePanel
            displayName={displayName}
            email={user?.email || "Kurulum bekleniyor"}
            phone={profile?.phone || "Telefon bilgisi bekleniyor"}
            company={profile?.company || "Şirket bilgisi bekleniyor"}
          />
          {panels.map((panel) => (
            <ContentPanel key={panel.id} panel={panel} />
          ))}
        </section>

        <footer className="pb-2 pt-8 text-center text-xs leading-5 text-slate-400 dark:text-slate-600">
          Star Girişim ve Yatırım A.Ş. · OOS danışman çalışma alanı
        </footer>
      </div>
    </main>
  );
}

function ProfilePanel({
  displayName,
  email,
  phone,
  company
}: {
  displayName: string;
  email: string;
  phone: string;
  company: string;
}) {
  return (
    <article id="profilim" className="scroll-mt-24 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Profilim</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-100">{displayName}</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Info label="E-posta" value={email} />
        <Info label="Telefon" value={phone} />
        <Info label="Şirket" value={company} />
        <Info label="Rol" value="Danışman" />
      </dl>
    </article>
  );
}

function ContentPanel({ panel }: { panel: ContentPanelData }) {
  return (
    <article id={panel.id} className="scroll-mt-24 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">{panel.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{panel.body}</p>
      {panel.bullets ? (
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {panel.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {panel.href && panel.cta ? (
        <Link href={panel.href} className="btn-secondary mt-4">
          {panel.cta}
        </Link>
      ) : null}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.04]">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 truncate font-medium text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}
