export type LegalPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export const legalPages: LegalPage[] = [
  {
    slug: "kvkk-aydinlatma-metni",
    title: "KVKK Aydınlatma Metni",
    description: "STAR GİRİŞİM VE YATIRIM A.Ş. kişisel verilerin korunması aydınlatma metni.",
    intro:
      "Bu aydınlatma metni, STAR GİRİŞİM VE YATIRIM A.Ş. tarafından Ocean Real Estate markası ve OceanOS dijital danışman operasyon sistemi kapsamında işlenen kişisel verilere ilişkin bilgilendirme amacıyla hazırlanmıştır.",
    sections: [
      {
        heading: "Veri Sorumlusu",
        body: [
          "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu STAR GİRİŞİM VE YATIRIM A.Ş.’dir. Ocean Real Estate markası altında yürütülen iletişim, başvuru, portföy, arayış ve iş birliği süreçlerinde kişisel veriler şirket tarafından işlenebilir."
        ]
      },
      {
        heading: "İşleme Amaçları",
        body: [
          "Kişisel veriler; danışman başvurularını değerlendirmek, portföy ve proje iş birliği taleplerini incelemek, müşteri arayışlarını yönetmek, iletişim süreçlerini yürütmek, operasyonel güvenliği sağlamak, yasal yükümlülükleri yerine getirmek ve OceanOS hizmet kalitesini geliştirmek amaçlarıyla işlenebilir."
        ]
      },
      {
        heading: "Hukuki Sebepler ve Toplama Yöntemleri",
        body: [
          "Veriler, elektronik formlar, e-posta, telefon, web sitesi kullanımı, yüz yüze görüşmeler ve dijital sistem kayıtları aracılığıyla toplanabilir. İşleme faaliyetleri kanunlarda öngörülme, sözleşmenin kurulması veya ifası, hukuki yükümlülük, meşru menfaat ve açık rıza hukuki sebeplerine dayanabilir."
        ]
      },
      {
        heading: "Aktarım",
        body: [
          "Kişisel veriler; hukuken yetkili kamu kurumları, hizmet alınan teknoloji ve barındırma sağlayıcıları, iş ortakları, danışmanlar ve yasal süreçlerde yetkili kişi ve kuruluşlarla, yalnızca gerekli olduğu ölçüde paylaşılabilir."
        ]
      },
      {
        heading: "KVKK Madde 11 Hakları",
        body: [
          "İlgili kişiler; kişisel verilerinin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış verilerin düzeltilmesini isteme, silme veya yok etme talep etme, aktarılan üçüncü kişileri öğrenme ve kanunda sayılan diğer haklarını kullanma hakkına sahiptir."
        ]
      },
      {
        heading: "Başvuru",
        body: [
          "KVKK kapsamındaki başvurular, kimlik ve iletişim bilgileri ile talep konusu açıkça belirtilerek info@oceanrealestate.com.tr adresi üzerinden STAR GİRİŞİM VE YATIRIM A.Ş.’ye iletilebilir."
        ]
      }
    ]
  },
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    description: "Ocean Real Estate web sitesi ve OceanOS kullanımına ilişkin gizlilik politikası.",
    intro:
      "STAR GİRİŞİM VE YATIRIM A.Ş., Ocean Real Estate markası altında yürüttüğü dijital ve ticari süreçlerde kişisel verilerin gizliliğine önem verir. Bu politika, web sitesi ve OceanOS kapsamındaki veri işleme yaklaşımını açıklar.",
    sections: [
      {
        heading: "İşlenebilecek Veri Kategorileri",
        body: [
          "Kimlik, iletişim, başvuru, mesleki deneyim, portföy veya proje talebi, müşteri arayışı, işlem notu, web sitesi kullanım bilgileri, cihaz ve güvenlik kayıtları gibi veriler işlenebilir."
        ]
      },
      {
        heading: "İşleme Amaçları",
        body: [
          "Veriler; iletişim taleplerini yanıtlamak, danışman başvurularını değerlendirmek, portföy ve proje iş birliği süreçlerini yürütmek, müşteri arayışlarını yönetmek, operasyonel güvenliği sağlamak, hizmetleri geliştirmek ve yasal yükümlülükleri yerine getirmek amacıyla kullanılabilir."
        ]
      },
      {
        heading: "Saklama İlkeleri",
        body: [
          "Kişisel veriler, işleme amacı için gerekli süre boyunca ve ilgili mevzuatta öngörülen saklama süreleri dikkate alınarak muhafaza edilir. Süre sonunda veriler silinebilir, yok edilebilir veya anonim hale getirilebilir."
        ]
      },
      {
        heading: "Paylaşım",
        body: [
          "Veriler; teknik altyapı sağlayıcıları, hukuki veya mali danışmanlar, iş ortakları, yetkili kamu kurumları ve yasal mercilerle yalnızca gerekli olduğu ölçüde paylaşılabilir."
        ]
      },
      {
        heading: "Kullanıcı Hakları ve İletişim",
        body: [
          "Kullanıcılar kişisel verilerine ilişkin bilgi, düzeltme, silme, itiraz ve diğer yasal hakları için info@oceanrealestate.com.tr adresinden STAR GİRİŞİM VE YATIRIM A.Ş. ile iletişime geçebilir."
        ]
      }
    ]
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    description: "Ocean Real Estate web sitesi çerez kullanımı hakkında bilgilendirme.",
    intro:
      "Bu politika, STAR GİRİŞİM VE YATIRIM A.Ş. tarafından Ocean Real Estate web sitesi ve OceanOS arayüzlerinde kullanılabilecek çerez ve benzeri teknolojilere ilişkin bilgilendirme sağlar.",
    sections: [
      {
        heading: "Çerez Nedir?",
        body: [
          "Çerezler, web sitesinin çalışmasını, güvenliğini ve kullanıcı tercihlerini desteklemek için cihazınıza kaydedilebilen küçük metin dosyalarıdır."
        ]
      },
      {
        heading: "Zorunlu Çerezler",
        body: [
          "Oturum yönetimi, güvenlik, tema tercihi ve temel site fonksiyonları için gerekli çerezler kullanılabilir. Bu çerezler olmadan bazı hizmetler sağlıklı çalışmayabilir."
        ]
      },
      {
        heading: "Performans, Analitik ve Fonksiyonel Çerezler",
        body: [
          "Web sitesi kullanımını anlamak, hizmet kalitesini ölçmek, kullanıcı tercihlerini hatırlamak ve arayüz deneyimini iyileştirmek için performans, analitik ve fonksiyonel çerezler kullanılabilir."
        ]
      },
      {
        heading: "Pazarlama Çerezleri",
        body: [
          "Ticari iletişim ve pazarlama faaliyetleri kapsamında çerez kullanımı gerekirse, bu kullanım ilgili mevzuata ve gerekli izin mekanizmalarına uygun şekilde yürütülür."
        ]
      },
      {
        heading: "Çerez Yönetimi",
        body: [
          "Kullanıcılar tarayıcı ayarları üzerinden çerezleri silebilir, engelleyebilir veya çerez kullanımı için bildirim alacak şekilde tercihlerini düzenleyebilir."
        ]
      }
    ]
  },
  {
    slug: "kullanim-kosullari",
    title: "Kullanım Koşulları",
    description: "Ocean Real Estate web sitesi ve OceanOS kullanım koşulları.",
    intro:
      "Bu kullanım koşulları, STAR GİRİŞİM VE YATIRIM A.Ş. tarafından Ocean Real Estate markası altında sunulan web sitesi ve OceanOS dijital hizmetlerinin kullanımına ilişkin esasları düzenler.",
    sections: [
      {
        heading: "Koşulların Kabulü",
        body: [
          "Web sitesini veya OceanOS arayüzlerini kullanan kişiler bu koşulları okumuş ve kabul etmiş sayılır. Şirket, koşulları güncelleme hakkını saklı tutar."
        ]
      },
      {
        heading: "Fikri Mülkiyet",
        body: [
          "Ocean Real Estate, OceanOS, OOS, sistem isimleri, metinler, tasarımlar, arayüzler, marka unsurları, görseller ve içerikler STAR GİRİŞİM VE YATIRIM A.Ş.’ye veya ilgili hak sahiplerine aittir. İzinsiz kopyalama, çoğaltma, yayınlama veya ticari kullanım yasaktır."
        ]
      },
      {
        heading: "Kullanım Sınırları",
        body: [
          "Yetkisiz erişim, veri kazıma, otomatik sorgu, tersine mühendislik, güvenlik önlemlerini aşma, sistemi kötüye kullanma veya üçüncü kişilerin haklarını ihlal eden faaliyetler yasaktır."
        ]
      },
      {
        heading: "Kullanıcı Sorumluluğu",
        body: [
          "Kullanıcılar ilettikleri bilgi, belge, portföy, arayış, başvuru ve iletişim içeriklerinin doğruluğundan sorumludur. Web sitesindeki bilgiler nihai teklif, değerleme, sözleşme veya taahhüt anlamına gelmez."
        ]
      },
      {
        heading: "Uygulanacak Hukuk",
        body: [
          "Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda, niteliğine göre İstanbul mahkemeleri ve icra daireleri yetkili kabul edilebilir."
        ]
      }
    ]
  },
  {
    slug: "uyelik-ve-odeme-kosullari",
    title: "Üyelik ve Ödeme Koşulları",
    description: "OceanOS üyelik ve ödeme süreçlerine ilişkin kurumsal koşullar.",
    intro:
      "Bu metin, OceanOS ve Ocean Real Estate kapsamında sunulabilecek üyelik, katılım, çalışma modeli ve ödeme süreçlerine ilişkin genel bilgilendirme sağlar.",
    sections: [
      {
        heading: "Üyelik ve Katılım",
        body: [
          "Ocean Core, Ocean Elite, Ocean Teams veya benzeri ticari katılım modelleri, başvuru değerlendirmesi ve şirket tarafından belirlenecek yazılı koşullara bağlıdır. Her başvuru otomatik kabul anlamına gelmez."
        ]
      },
      {
        heading: "Ödeme Süreçleri",
        body: [
          "Üyelik, katılım veya profesyonel çalışma alanı kapsamındaki ödeme süreçleri, ilgili sözleşme, teklif, fatura ve ödeme altyapısı koşullarına göre yürütülür. Kartlı ödeme altyapısı aktif olduğunda işlem güvenliği ilgili ödeme hizmet sağlayıcısının teknik ve hukuki standartlarıyla desteklenir."
        ]
      },
      {
        heading: "Ücret ve Hizmet Kapsamı",
        body: [
          "Ücretler, hizmet kapsamı, erişim hakları, yenileme, iptal veya değişiklik koşulları yazılı bilgilendirme ve sözleşme ile belirlenir. Web sitesinde yer alan genel açıklamalar tek başına bağlayıcı ticari teklif niteliği taşımaz."
        ]
      },
      {
        heading: "Değişiklik Hakkı",
        body: [
          "STAR GİRİŞİM VE YATIRIM A.Ş., mevzuata ve sözleşmesel yükümlülüklere uygun olmak kaydıyla üyelik ve ödeme süreçlerine ilişkin çalışma esaslarını güncelleyebilir."
        ]
      }
    ]
  },
  {
    slug: "acik-riza-metni",
    title: "Açık Rıza Metni",
    description: "Ocean Real Estate iletişim, başvuru ve iş birliği süreçleri için açık rıza metni.",
    intro:
      "Bu açık rıza metni, STAR GİRİŞİM VE YATIRIM A.Ş. tarafından Ocean Real Estate markası kapsamında yürütülen iletişim, danışman başvurusu, portföy ve proje iş birliği süreçleri için hazırlanmıştır.",
    sections: [
      {
        heading: "Rıza Kapsamı",
        body: [
          "İletişim formları, danışman başvuruları, portföy veya proje iş birliği talepleri ve ticari iletişim süreçleri kapsamında paylaşılan kişisel verilerin değerlendirme, geri dönüş, planlama ve operasyonel takip amaçlarıyla işlenmesine rıza verilebilir."
        ]
      },
      {
        heading: "Ticari İletişim",
        body: [
          "Kullanıcının ayrıca onay vermesi halinde, Ocean Real Estate ve OceanOS hizmetleri, etkinlikleri, başvuru süreçleri veya iş birliği modelleri hakkında ticari ileti gönderilebilir."
        ]
      },
      {
        heading: "Rızanın Geri Alınması",
        body: [
          "Açık rıza her zaman geri alınabilir. Rızanın geri alınması, geri alma tarihinden önce rızaya dayanılarak yapılan işlemlerin hukuka uygunluğunu etkilemez."
        ]
      },
      {
        heading: "Başvuru Kanalı",
        body: [
          "Rıza yönetimi ve veri işleme talepleri info@oceanrealestate.com.tr adresi üzerinden STAR GİRİŞİM VE YATIRIM A.Ş.’ye iletilebilir."
        ]
      }
    ]
  },
  {
    slug: "yasal-bilgilendirme",
    title: "Yasal Bilgilendirme",
    description: "Ocean Real Estate web sitesi için kurumsal yasal bilgilendirme.",
    intro:
      "Bu web sitesi ve OceanOS dijital arayüzleri, STAR GİRİŞİM VE YATIRIM A.Ş. tarafından Ocean Real Estate markası kapsamında işletilir veya işletilmesi amacıyla sunulur.",
    sections: [
      {
        heading: "Genel Bilgi Niteliği",
        body: [
          "Web sitesinde yer alan bilgi, açıklama, görsel, örnek portföy, ticari model ve sistem anlatımları genel bilgilendirme niteliğindedir. Nihai hak ve yükümlülükler yazılı sözleşmelerle belirlenir."
        ]
      },
      {
        heading: "Sözleşmeye Bağlı Süreçler",
        body: [
          "Gayrimenkul işlemleri, danışman başvuruları, portföy iş birlikleri, proje geliştirme süreçleri, üyelik ve ödeme modelleri yazılı anlaşma, yetki, teklif veya şirket değerlendirmesine tabidir."
        ]
      },
      {
        heading: "Güncelleme Hakkı",
        body: [
          "STAR GİRİŞİM VE YATIRIM A.Ş., web sitesi içeriklerini, hizmet açıklamalarını, sistem fonksiyonlarını ve ticari model bilgilendirmelerini güncelleme hakkını saklı tutar."
        ]
      },
      {
        heading: "Korunan Unsurlar",
        body: [
          "Marka, logo, metin, görsel, arayüz, sistem adı ve diğer tüm içerikler ilgili mevzuat kapsamında korunur. İzinsiz kullanım halinde yasal haklar saklıdır."
        ]
      }
    ]
  },
  {
    slug: "basvuru-ve-iletisim",
    title: "Başvuru ve İletişim",
    description: "KVKK talepleri, danışman başvuruları ve iş birliği iletişim kanalları.",
    intro:
      "STAR GİRİŞİM VE YATIRIM A.Ş. ile Ocean Real Estate markası kapsamındaki başvuru, iş birliği ve veri koruma talepleri için aşağıdaki esaslar geçerlidir.",
    sections: [
      {
        heading: "Başvuru Konuları",
        body: [
          "KVKK talepleri, danışman başvuruları, iş birliği önerileri, portföy veya proje değerlendirme talepleri, kurumsal iletişim ve sistem erişim konuları şirketle paylaşılabilir."
        ]
      },
      {
        heading: "Başvuruda Bulunması Gereken Bilgiler",
        body: [
          "Başvurularda ad-soyad, iletişim bilgileri, talep konusu, varsa ilgili portföy veya iş birliği açıklaması ve başvuruyu destekleyen belgeler açık şekilde belirtilmelidir."
        ]
      },
      {
        heading: "İletişim Kanalı",
        body: [
          "Başvurular info@oceanrealestate.com.tr adresine iletilebilir. Telefonla iletişim için +90 (216) 280 01 00 numarası kullanılabilir."
        ]
      },
      {
        heading: "Değerlendirme",
        body: [
          "Başvuruların alınması kabul, sözleşme kurulması veya iş birliği taahhüdü anlamına gelmez. Şirket, başvuruları kendi operasyonel ve ticari değerlendirme süreçleri doğrultusunda inceler."
        ]
      }
    ]
  },
  {
    slug: "sorumluluk-reddi",
    title: "Sorumluluk Reddi",
    description: "Ocean Real Estate web sitesi ve OceanOS içerikleri için sorumluluk reddi.",
    intro:
      "Bu sorumluluk reddi, STAR GİRİŞİM VE YATIRIM A.Ş. tarafından Ocean Real Estate markası ve OceanOS dijital sistemi kapsamında sunulan içeriklerin kullanımına ilişkin genel sınırları açıklar.",
    sections: [
      {
        heading: "Danışmanlık Niteliği Taşımama",
        body: [
          "Web sitesi ve OceanOS üzerinde yer alan içerikler yatırım, hukuk, vergi, değerleme, finans veya teknik danışmanlık niteliği taşımaz. Kullanıcılar karar almadan önce ilgili uzmanlardan bağımsız görüş almalıdır."
        ]
      },
      {
        heading: "Değişebilir Bilgiler",
        body: [
          "Gayrimenkul fiyatları, proje detayları, portföy uygunluğu, erişilebilirlik, komisyon yapıları, üyelik modelleri ve ticari koşullar zaman içinde değişebilir. Güncel durum ayrıca teyit edilmelidir."
        ]
      },
      {
        heading: "Yazılı Sözleşme Esası",
        body: [
          "Tarafların nihai hak ve yükümlülükleri yalnızca imzalanmış yazılı sözleşmeler, yetki belgeleri, teklif ve ekleri kapsamında doğar."
        ]
      },
      {
        heading: "Üçüncü Taraflar",
        body: [
          "Üçüncü taraf bağlantılar, hizmet sağlayıcılar veya dış sistemlerden kaynaklanan içerik, işlem veya kesintiler şirketin doğrudan kontrolü dışında olabilir. STAR GİRİŞİM VE YATIRIM A.Ş. bu tür üçüncü taraf süreçlerden doğan sonuçlardan mevzuatın izin verdiği ölçüde sorumlu değildir."
        ]
      }
    ]
  }
];

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
