import { OCEAN_CONTACT_EMAIL } from "@/lib/oos/contact";

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
  | "legal-corporate"
  | "activity";

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
    eyebrow: "Operasyon uyarıları",
    description: "Yeni eşleşmeler, portföy hareketleri, görev hatırlatmaları ve onay süreçleri için profesyonel bildirim merkezi.",
    cards: [
      { title: "Eşleşme Bildirimleri", body: "Yeni ve güçlü portföy-arayış eşleşmeleri burada öncelik sırasına göre görünür.", meta: "Fırsat" },
      { title: "Portföy Güncellemeleri", body: "Fiyat, statü, görünürlük, fotoğraf ve kapak değişiklikleri danışman takibine düşer.", meta: "Portföy" },
      { title: "Görev Hatırlatmaları", body: "Malik araması, fotoğraf tamamlama, müşteri dönüşü ve sözleşme aksiyonları için hatırlatma alanı.", meta: "Takip" },
      { title: "Sistem Bildirimleri", body: "Migration, medya, paylaşım linki veya güvenlik gibi teknik durumlar sadece ilgili modülde gösterilir.", meta: "Sistem" },
      { title: "Başvuru ve Onay Süreçleri", body: "Danışman başvuruları, admin onayları ve profil bağlama süreçleri yönetim akışında izlenir.", meta: "Onay" },
      { title: "Henüz bildiriminiz yok", body: "Yeni eşleşmeler, görevler ve sistem uyarıları oluştuğunda burada görünecek.", meta: "Boş durum" }
    ],
    actions: ["Uygulama içi bildirimler", "E-posta uyarıları", "Önemli operasyon alarmı"]
  },
  {
    slug: "tasks",
    title: "Görevlerim",
    eyebrow: "Danışman takip alanı",
    description: "Günlük operasyon, yaklaşan takipler, geciken işler ve tamamlanan aksiyonlar için sade görev çalışma alanı.",
    cards: [
      { title: "Bugünkü Görevler", body: "Portföy fotoğrafı ekle, malik araması yap ve yeni arayışları güncelle.", meta: "Bugün" },
      { title: "Yaklaşan Takipler", body: "Yer gösterimi, teklif dönüşü, tapu evrakı ve müşteri görüşmeleri için takip listesi.", meta: "Planlı" },
      { title: "Geciken İşler", body: "Eksik yetki, geciken müşteri dönüşü veya tamamlanmamış sözleşme evrakı burada öne çıkar.", meta: "Kontrol" },
      { title: "Tamamlananlar", body: "Kapanan görevler danışmanın operasyon geçmişi ve ekip görünürlüğü için kayıt altında tutulur.", meta: "Arşiv" },
      { title: "Süreç Notları", body: "Portföy fotoğrafı ekle, malik araması yap, müşteri arayışını güncelle ve eşleşme kontrolü yap gibi aksiyonlar tek yerde toparlanır.", meta: "Operasyon" }
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
      { title: "Ocean Elite Aylık Fee", body: "6.000 TL + %20 KDV ile toplam 7.200 TL.", meta: "Hazır alan" },
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
    description: "Leaflet ve OpenStreetMap temeliyle İstanbul portföylerini hafif, ücretsiz ve üretime güvenli harita üzerinde inceleyin.",
    cards: [
      { title: "Sarıyer", body: "Boğaz hattı ve üst segment konut portföyleri.", meta: "4 portföy" },
      { title: "Beşiktaş", body: "Merkezi konut ve ticari fırsatlar.", meta: "3 portföy" },
      { title: "Kadıköy", body: "Yatırım ve kiralama potansiyeli yüksek portföyler.", meta: "5 portföy" }
    ]
  },
  {
    slug: "commissions",
    title: "Gelir Motoru",
    eyebrow: "İşlem ve komisyon kuralları",
    description: "Satış ve kiralama işlemlerinde brüt komisyon, danışman hakedişi, ofis payı, referral teşviki ve tavan durumunu hesaplayın.",
    cards: [
      { title: "Komisyon hesaplama", body: "Ocean Core, Ocean Elite, referral ve tavan kuralları tek hesaplama motorunda uygulanır.", meta: "Kural" },
      { title: "Gelir özeti", body: "Brüt komisyon, ofis payı ve danışman hakedişi gerçek işlem kayıtlarından özetlenir.", meta: "Finans" },
      { title: "Tahsilat ve ödeme", body: "İşlem durumu draft aşamasından paid out aşamasına kadar takip edilir.", meta: "Kontrol" }
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
    slug: "activity",
    title: "Aktivite Kayıtları",
    eyebrow: "Audit trail",
    description: "Portföy, arayış, paylaşım, başvuru ve sistem aksiyonları burada kayıt altına alınır.",
    cards: [
      { title: "Kritik işlem geçmişi", body: "Portföy, fotoğraf, paylaşım linki, PDF ve başvuru aksiyonları zaman sırasıyla izlenir.", meta: "Kontrol" },
      { title: "Sorumluluk görünürlüğü", body: "Kim, neyi, ne zaman yaptı sorusuna operasyonel yanıt verir.", meta: "Audit" },
      { title: "Güvenli kayıt", body: "Token, imzalı URL, gizli anahtar ve özel müşteri notları aktivite kayıtlarına yazılmaz.", meta: "Güvenlik" }
    ]
  },
  {
    slug: "security",
    title: "Hesap ve Güvenlik",
    eyebrow: "Hesap, rol ve veri güvenliği",
    description: "Danışman hesabı, rol görünürlüğü, oturum güvenliği ve dış paylaşım güvenliği için iç kontrol merkezi.",
    cards: [
      { title: "Giriş Bilgileri", body: "E-posta Supabase Auth üzerinden yönetilir. Hassas oturum bilgileri arayüzde gösterilmez.", meta: "Auth" },
      { title: "Hesap Rolü", body: "Danışman, admin ve izleyici rolleri yetki kontrolü için sistem tarafından atanır.", meta: "Kilitli" },
      { title: "Veri Güvenliği", body: "Müşteri kimliği, özel notlar, komisyon ve operasyon verileri yetkisiz kişilerle paylaşılmaz.", meta: "Koruma" },
      { title: "Oturum Güvenliği", body: "Çıkış işlemi tüm OceanOS ekranlarında ortak oturum akışını kullanır.", meta: "Güvenli" },
      { title: "Medya Güvenliği", body: "Portföy fotoğrafları korumalı depoda tutulur; public paylaşım sadece güvenli çıktı üretir.", meta: "Storage" },
      { title: "Dış Paylaşım", body: "Paylaşım linkleri yalnızca temizlenmiş portföy bilgisini gösterir; iç notlar ve müşteri verisi görünmez.", meta: "Share" }
    ]
  },
  {
    slug: "settings",
    title: "Ayarlar",
    eyebrow: "Uygulama tercihleri",
    description: "OceanOS görünüm, bildirim, çalışma alanı, bölge ve varsayılan portföy tercihleri için yapılandırma merkezi.",
    cards: [
      { title: "Görünüm", body: "Tema tercihi global düğmeden yönetilir; bu sayfada ikinci bir tema anahtarı gösterilmez.", meta: "Aktif" },
      { title: "Bildirim Tercihleri", body: "Eşleşme, görev, başvuru ve sistem uyarıları kanal bazlı yönetilecek şekilde hazırlanır.", meta: "Hazır alan" },
      { title: "Çalışma Alanı", body: "Danışmanın varsayılan menü, hızlı aksiyon ve portföy çalışma düzeni burada toplanır.", meta: "OceanOS" },
      { title: "Dil ve Bölge", body: "Varsayılan dil Türkçe, bölge formatı Türkiye ve para birimi TRY olarak tasarlanır.", meta: "TR" },
      { title: "Varsayılan Portföy Tercihleri", body: "Portföy görünürlüğü, fotoğraf sınırı ve varsayılan durum tercihleri ürün standardına bağlıdır.", meta: "Portföy" }
    ]
  },
  {
    slug: "support",
    title: "Yardım ve Destek",
    eyebrow: "Destek merkezi",
    description: "Portföy girişi, medya, eşleşme, paylaşım linki, PDF çıktısı ve giriş sorunları için danışman destek merkezi.",
    cards: [
      { title: "Portföy Girişi", body: "Başlık, fiyat, lokasyon, metrekare ve durum bilgilerini eksiksiz girerek eşleşme kalitesini artırın.", meta: "Rehber" },
      { title: "Fotoğraf ve Watermark", body: "En fazla 12 gerçek portföy fotoğrafı yüklenir; Ocean watermark otomatik uygulanır.", meta: "Medya" },
      { title: "Eşleşmeler", body: "Eşleşme skoru lokasyon, tip, bütçe, alan ve ihtiyaç sinyallerini birlikte değerlendirir.", meta: "Fırsat" },
      { title: "Paylaşım Linkleri", body: "Dış paylaşım linkleri sadece güvenli portföy sunum bilgisini gösterir.", meta: "Share" },
      { title: "PDF Çıktısı", body: "PDF çıktısı WhatsApp veya e-posta ile paylaşılabilecek sade satış materyali üretir.", meta: "PDF" },
      { title: "Danışman Başvuruları", body: "Başvurular sözleşme, kırmızı çizgiler ve komisyon modeli kabulüyle admin onayına gider.", meta: "Onay" },
      { title: "Sistem ve Giriş Sorunları", body: `Destek için Ocean Real Estate operasyon ekibiyle ${OCEAN_CONTACT_EMAIL} üzerinden iletişime geçebilirsiniz.`, meta: "Destek" }
    ]
  },
  {
    slug: "faq",
    title: "Sıkça Sorulan Sorular",
    eyebrow: "Danışman rehberi",
    description: "OceanOS içindeki portföy, arayış, eşleşme, medya, paylaşım ve başvuru süreçleri için kısa yanıtlar.",
    cards: [
      { title: "Portföy nasıl eklenir?", body: "Portföylerim ekranından başlık, lokasyon, fiyat ve tip bilgisiyle yeni portföy oluşturulur.", meta: "Portföy" },
      { title: "Fotoğraf yükleme sınırı nedir?", body: "Her portföy için en fazla 12 JPEG, PNG veya WebP fotoğraf yüklenir.", meta: "Medya" },
      { title: "Watermark otomatik mi eklenir?", body: "Evet. Yüklenen portföy fotoğrafları Ocean watermark ile işlenir.", meta: "Watermark" },
      { title: "Eşleşme skoru nasıl çalışır?", body: "Lokasyon, mülk tipi, bütçe, alan ve özellik uyumu birlikte puanlanır.", meta: "Eşleşme" },
      { title: "Paylaşım linki hangi bilgileri gösterir?", body: "Sadece dışarıya uygun portföy sunum bilgilerini gösterir; iç not ve müşteri verisi göstermez.", meta: "Share" },
      { title: "PDF çıktısında hangi bilgiler yer alır?", body: "Başlık, ana görsel, fiyat, lokasyon, temel özellikler ve güvenli danışman iletişimi yer alır.", meta: "PDF" },
      { title: "Tüm Portföyler ile Portföylerim arasındaki fark nedir?", body: "Portföylerim kişisel yönetim alanıdır; Tüm Portföyler ofis içi envanter taramasıdır.", meta: "Envanter" },
      { title: "Arayış nasıl oluşturulur?", body: "Arayışlarım ekranında lokasyon, bütçe, mülk tipi, aciliyet ve notlar girilir.", meta: "Arayış" },
      { title: "Kat Karşılığı arayışı nasıl girilir?", body: "Arayış türü seçiminde Kat Karşılığı seçilerek bölge, arsa tipi ve beklenti notu eklenir.", meta: "Kat Karşılığı" },
      { title: "Danışman başvurusu nasıl değerlendirilir?", body: "Başvuru admin tarafından incelenir, onaylanırsa mevcut profil ile danışman kaydı bağlanır.", meta: "Başvuru" },
      { title: "Komisyon modeli nerede belirlenir?", body: "Danışman başvurusunda Ocean Elite veya Ocean Core modeli açık kabul ile seçilir.", meta: "Komisyon" },
      { title: "Veriler kimlere görünür?", body: "Fırsat datası paylaşılır; müşteri kimliği, belgeler, özel notlar ve para datası korunur.", meta: "Güvenlik" }
    ]
  },
  {
    slug: "legal-corporate",
    title: "Yasal ve Kurumsal",
    eyebrow: "Kurumsal standartlar",
    description: "Ocean Real Estate ve Star Girişim ve Yatırım A.Ş. için iç yasal, kurumsal ve operasyon standardı merkezi.",
    cards: [
      { title: "Şirket Bilgileri", body: "OCEAN REAL ESTATE, STAR GİRİŞİM VE YATIRIM A.Ş. çatısı altında faaliyet gösterir. Yetki Belgesi No: YB0378.", meta: "Kurumsal" },
      { title: "Yetki ve Temsil", body: "Danışman temsil dili, portföy sunumu ve müşteri iletişimi şirket standartlarına uygun yürütülür.", meta: "Temsil" },
      { title: "Danışmanlık Esasları", body: "Danışman, portföy ve arayış bilgisini doğru, güncel ve ölçülebilir şekilde sisteme işler.", meta: "Operasyon" },
      { title: "Komisyon Paylaşım Esasları", body: "Ocean Elite ve Ocean Core modelleri başvuru ve onay süreçlerinde açık kabul ile kaydedilir.", meta: "Komisyon" },
      { title: "Kırmızı Çizgiler", body: "Yetkisiz görsel, yanıltıcı fiyat, müşteri bilgisi ifşası ve kayıt dışı işlem Ocean standardına aykırıdır.", meta: "Etik" },
      { title: "KVKK ve Veri Güvenliği", body: "Kişisel veriler, müşteri bilgisi ve iç operasyon notları yetki bazlı korunur.", meta: "KVKK" },
      { title: "Paylaşım Linkleri ve Dışa Aktarım", body: "Dış link ve PDF çıktıları yalnızca güvenli, temizlenmiş portföy sunum verilerini içerir.", meta: "Dış çıktı" },
      { title: "Sorumluluk Sınırları", body: "Bu alan iç operasyon bilgisidir; nihai hukuki değerlendirme için ilgili public yasal metinler ve profesyonel danışmanlık esas alınır.", meta: "Bilgilendirme" }
    ]
  }
];

export const menuPageSlugs = menuPages.map((page) => page.slug);

export function getMenuPage(slug: string) {
  return menuPages.find((page) => page.slug === slug);
}
