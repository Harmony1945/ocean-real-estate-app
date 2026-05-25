export type MenuPageSlug =
  | "profile"
  | "notifications"
  | "tasks"
  | "matches"
  | "payments"
  | "tax-calculator"
  | "map"
  | "commissions"
  | "reports"
  | "security"
  | "settings"
  | "support"
  | "faq"
  | "legal-corporate";

export type MenuPageData = {
  slug: MenuPageSlug;
  title: string;
  eyebrow: string;
  description: string;
  cards: Array<{
    title: string;
    body: string;
    meta?: string;
  }>;
  actions?: string[];
};

export const menuPages: MenuPageData[] = [
  {
    slug: "profile",
    title: "Profilim",
    eyebrow: "Danışman profili",
    description: "Temel danışman bilgileri, şirket özeti ve sistem tarafından kilitli rol bilgisi.",
    cards: [
      { title: "Profil özeti", body: "Ad, e-posta, telefon ve şirket bilgileri bu alanda doğrulanır.", meta: "Güncel" },
      { title: "Rol yönetimi", body: "Danışman rolü güvenlik için kullanıcı tarafından değiştirilemez.", meta: "Kilitli" }
    ]
  },
  {
    slug: "notifications",
    title: "Bildirimler",
    eyebrow: "Operasyon akışı",
    description: "Eşleşme, ödeme ve portföy kontrol uyarıları tek sayfada izlenir.",
    cards: [
      { title: "Yeni eşleşme", body: "Bebek yalı dairesi arayışı için 2 güçlü portföy önerisi hazır.", meta: "Bugün" },
      { title: "Ödeme hatırlatması", body: "Aylık profesyonel katılım ödeme günü yaklaşıyor.", meta: "3 gün" },
      { title: "Portföy kontrolü", body: "Yetki belgesi eksik portföyleri kapatmadan önce tamamlayın.", meta: "Aksiyon" }
    ]
  },
  {
    slug: "tasks",
    title: "Görevlerim",
    eyebrow: "Bugünün listesi",
    description: "Günlük danışman aksiyonları ve kapanışa yakın işler için sade görev alanı.",
    cards: [
      { title: "Arayışları gözden geçir", body: "Yeni talepleri bütçe, bölge ve aciliyet sinyallerine göre sırala.", meta: "09:30" },
      { title: "Eksik malik bilgisi", body: "Adres ve tapu teyidi bekleyen portföyleri tamamla.", meta: "Öncelikli" },
      { title: "Müşteri dönüşü", body: "Güçlü eşleşmeleri kısa notla müşteriye ilet.", meta: "Bugün" }
    ],
    actions: ["3 açık görev", "1 yüksek öncelik", "2 tamamlanabilir aksiyon"]
  },
  {
    slug: "matches",
    title: "Eşleşmeler",
    eyebrow: "Portföy ve arayış uyumu",
    description: "OOS; lokasyon, bütçe, portföy tipi ve aciliyet verilerini birleştirerek güçlü eşleşmeleri öne çıkarır.",
    cards: [
      { title: "Bebek yalı dairesi", body: "Boğaz hattı, 3+1, yüksek bütçe arayışı için 86 uyum skoru.", meta: "%86" },
      { title: "Kadıköy yatırım ofisi", body: "Kira getirisi ve ulaşım erişimi yüksek portföyler önerildi.", meta: "%78" },
      { title: "Levent aile konutu", body: "Okul ve ulaşım filtresiyle daraltılmış 4 aday portföy.", meta: "%72" }
    ]
  },
  {
    slug: "payments",
    title: "Ödemeler",
    eyebrow: "Katılım modülü",
    description: "Aylık ofis ve profesyonel katılım ödeme durumunu takip etmek için üretime güvenli panel.",
    cards: [
      { title: "Aylık katılım", body: "7.500 TL + KDV danışman profesyonel katılım bedeli.", meta: "Planlanan" },
      { title: "Fatura durumu", body: "Fatura ve dekont bağlantıları ödeme entegrasyonu sonrası burada listelenir.", meta: "Hazır alan" },
      { title: "Ödeme yöntemi", body: "Kart veya banka transferi entegrasyonu eklenmeden manuel takip korunur.", meta: "Güvenli" }
    ]
  },
  {
    slug: "tax-calculator",
    title: "Vergi Hesaplayıcı",
    eyebrow: "KDV ve gelir tahmini",
    description: "Komisyon geliri için KDV ve gelir vergisi etkisini hızlıca tahmin eden danışman aracı.",
    cards: [
      { title: "KDV varsayımı", body: "KDV oranı varsayılan olarak %20 hesaplanır.", meta: "%20" },
      { title: "Gelir vergisi", body: "Gelir vergisi oranı danışman beyanına göre ayarlanabilir.", meta: "Tahmini" }
    ]
  },
  {
    slug: "map",
    title: "Harita",
    eyebrow: "İstanbul portföy haritası",
    description: "Harita sağlayıcısı eklemeden İstanbul portföylerini bölge çipleri ve hafif konum alanıyla inceleyin.",
    cards: [
      { title: "Sarıyer", body: "Boğaz hattı ve üst segment konut portföyleri.", meta: "4 portföy" },
      { title: "Beşiktaş", body: "Merkezi konut ve ticari fırsatlar.", meta: "3 portföy" },
      { title: "Kadıköy", body: "Yatırım ve kiralama potansiyeli yüksek portföyler.", meta: "5 portföy" }
    ]
  },
  {
    slug: "commissions",
    title: "İşlem ve Komisyonlar",
    eyebrow: "Süreç takibi",
    description: "Satış ve kiralama işlemlerinde aşama, brüt komisyon ve danışman payı özetlenir.",
    cards: [
      { title: "Yetki ve teklif", body: "Yetki belgesi, teklif ve kapora adımlarını ayrı takip edin.", meta: "Süreç" },
      { title: "Komisyon özeti", body: "Brüt komisyon, ofis payı ve danışman payı görünümü.", meta: "Finans" },
      { title: "Kapanış kontrolü", body: "Eksik belge varsa görev listesine aksiyon düşer.", meta: "Kontrol" }
    ]
  },
  {
    slug: "reports",
    title: "Raporlar",
    eyebrow: "Performans görünümü",
    description: "Portföy performansı, arayış dönüşümü ve kapanışa yaklaşan işler için anlamlı özet metrikler.",
    cards: [
      { title: "Yeni portföy", body: "Bu hafta 6 yeni portföy çalışma alanına eklendi.", meta: "+6" },
      { title: "Arayış dönüşümü", body: "Aktif arayışların %34'ü güçlü eşleşme aldı.", meta: "%34" },
      { title: "Kapanış hattı", body: "3 işlem teklif veya kapora aşamasında.", meta: "3 işlem" }
    ]
  },
  {
    slug: "security",
    title: "Hesap ve Güvenlik",
    eyebrow: "Oturum güvenliği",
    description: "E-posta, oturum, rol ve güvenlik ayarlarının danışman odaklı özeti.",
    cards: [
      { title: "E-posta", body: "E-posta Supabase Auth üzerinden yönetilir ve doğrulama akışına bağlıdır.", meta: "Auth" },
      { title: "Rol", body: "Rol sistem tarafından atanır; kullanıcı arayüzünde düzenlenmez.", meta: "Kilitli" },
      { title: "Oturum", body: "Çıkış işlemi tüm OOS ekranlarındaki ortak oturum akışını kullanır.", meta: "Güvenli" }
    ]
  },
  {
    slug: "settings",
    title: "Ayarlar",
    eyebrow: "Uygulama tercihleri",
    description: "Tema, bildirim ve mobil kullanım tercihleri için sade ayar merkezi.",
    cards: [
      { title: "Tema", body: "Koyu/açık tema tercihi cihazda saklanır ve tüm sayfalara uygulanır.", meta: "Aktif" },
      { title: "Navigasyon", body: "Mobil alt navigasyon ana akışta korunur.", meta: "Mobil" },
      { title: "Bildirim tercihleri", body: "Operasyon bildirimleri ileride kanal bazlı ayrıştırılabilir.", meta: "Hazır alan" }
    ]
  },
  {
    slug: "support",
    title: "Yardım ve Destek",
    eyebrow: "Destek merkezi",
    description: "Operasyon soruları, hesap yardımı ve platform iş akışları için destek sayfası.",
    cards: [
      { title: "Destek iletişimi", body: "support@oceanos.example üzerinden çalışma saatlerinde destek alın.", meta: "09:00-18:00" },
      { title: "İş akışı yardımı", body: "Portföy, arayış ve eşleşme süreçleri için kısa rehberler burada toplanır.", meta: "Rehber" },
      { title: "Acil işlem", body: "Kapanışa yakın işlem sorularında ofis yöneticinizle iletişime geçin.", meta: "Öncelik" }
    ]
  },
  {
    slug: "faq",
    title: "Sıkça Sorulan Sorular",
    eyebrow: "Danışman rehberi",
    description: "OOS içinde en sık gelen pratik danışman soruları ve kısa yanıtları.",
    cards: [
      { title: "Portföy nasıl eklenir?", body: "Ana sayfadaki hızlı aksiyonlar portföy ekleme akışına bağlanır.", meta: "Portföy" },
      { title: "Eşleşmeler nasıl sıralanır?", body: "Bütçe, lokasyon, portföy tipi ve aciliyet sinyalleri beraber değerlendirilir.", meta: "Eşleşme" },
      { title: "Vergi sonucu kesin midir?", body: "Hayır. Hesaplayıcı ön bilgi verir; mali müşavir teyidi gerekir.", meta: "Vergi" }
    ]
  },
  {
    slug: "legal-corporate",
    title: "Yasal ve Kurumsal",
    eyebrow: "Şirket bilgileri",
    description: "Star Girişim ve Yatırım A.Ş. kurumsal bilgileri ve yasal bağlantıları.",
    cards: [
      { title: "Kullanım koşulları", body: "OOS çalışma alanı kullanım ilkeleri ve danışman sorumlulukları.", meta: "Yasal" },
      { title: "Gizlilik ve KVKK", body: "Kişisel veri ve müşteri bilgisi işleme prensipleri.", meta: "KVKK" },
      { title: "Komisyon ilkeleri", body: "İşlem ve komisyon süreçleri için kurumsal yönlendirme.", meta: "Kurumsal" }
    ]
  }
];

export const menuPageSlugs = menuPages.map((page) => page.slug);

export function getMenuPage(slug: string) {
  return menuPages.find((page) => page.slug === slug);
}
