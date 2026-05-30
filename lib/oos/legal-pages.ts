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
    description: "Star Girişim ve Yatırım A.Ş. kişisel verilerin korunması aydınlatma metni.",
    intro:
      "Bu metin, Star Girişim ve Yatırım A.Ş. tarafından, Ocean Real Estate ve OceanOS kapsamında işlenen kişisel veriler hakkında kullanıcıları bilgilendirmek amacıyla hazırlanmıştır.",
    sections: [
      {
        heading: "Genel Yaklaşım",
        body: [
          "Star Girişim ve Yatırım A.Ş., kişisel verilerin korunmasına önem verir ve kişisel verileri yürürlükteki mevzuata uygun şekilde işler."
        ]
      },
      {
        heading: "İşlenen Kişisel Veriler",
        body: [
          "Ocean Real Estate ve OceanOS kapsamında; ad, soyad, telefon numarası, e-posta adresi, kullanıcı hesabı bilgileri, portföy bilgileri, arayış kayıtları, işlem kayıtları, başvuru bilgileri, iletişim talepleri ve sistem kullanım kayıtları işlenebilir."
        ]
      },
      {
        heading: "İşleme Amaçları",
        body: [
          "Kişisel veriler; kullanıcı hesabı oluşturmak, portföy ve arayış süreçlerini yürütmek, danışmanlık taleplerini değerlendirmek, işlem süreçlerini yönetmek, yasal yükümlülükleri yerine getirmek, güvenliği sağlamak, kullanıcı deneyimini geliştirmek ve iletişim taleplerine yanıt vermek amacıyla işlenir."
        ]
      },
      {
        heading: "Aktarım",
        body: [
          "Kişisel veriler, mevzuatın izin verdiği durumlarda ve gerekli olduğu ölçüde; yetkili kamu kurumları, hizmet sağlayıcılar, teknik altyapı sağlayıcıları, iş ortakları ve hukuki yükümlülüklerin yerine getirilmesi gereken kişi veya kurumlarla paylaşılabilir."
        ]
      },
      {
        heading: "Haklarınız",
        body: [
          "KVKK kapsamında kişisel verilerinizle ilgili bilgi talep etme, düzeltme, silme, işlemeye itiraz etme ve mevzuatta belirtilen diğer haklarınızı kullanabilirsiniz.",
          "Talepleriniz için info@oceanrealestate.com.tr adresinden iletişime geçebilirsiniz."
        ]
      }
    ]
  },
  {
    slug: "gizlilik-politikasi",
    title: "Gizlilik Politikası",
    description: "Ocean Real Estate ve OceanOS gizlilik politikası.",
    intro:
      "Ocean Real Estate ve OceanOS kullanıcılarının gizliliği bizim için önemlidir.",
    sections: [
      {
        heading: "Kapsam",
        body: [
          "Bu politika, platformu kullanan kişilerin bilgilerinin hangi amaçlarla toplandığını, nasıl korunduğunu ve hangi durumlarda paylaşılabileceğini açıklar."
        ]
      },
      {
        heading: "Toplanan Bilgiler",
        body: [
          "Platform kullanımı sırasında kimlik, iletişim, hesap, portföy, arayış, işlem, başvuru ve teknik kullanım bilgileri toplanabilir."
        ]
      },
      {
        heading: "Kullanım Amaçları",
        body: [
          "Bu bilgiler; hizmet sunmak, kullanıcı hesabını yönetmek, portföy ve işlem süreçlerini yürütmek, kullanıcı taleplerini yanıtlamak, güvenliği sağlamak, yasal yükümlülükleri yerine getirmek ve hizmet kalitesini artırmak için kullanılır."
        ]
      },
      {
        heading: "Güvenlik",
        body: [
          "Star Girişim ve Yatırım A.Ş., kullanıcı bilgilerinin yetkisiz erişime, kayba, kötüye kullanıma veya izinsiz paylaşıma karşı korunması için gerekli teknik ve idari tedbirleri almayı hedefler."
        ]
      },
      {
        heading: "Üçüncü Taraflarla Paylaşım",
        body: [
          "Kişisel bilgiler, yasal zorunluluklar, hizmetin yürütülmesi veya açıkça gerekli olan operasyonel durumlar dışında üçüncü kişilerle paylaşılmaz."
        ]
      }
    ]
  },
  {
    slug: "cerez-politikasi",
    title: "Çerez Politikası",
    description: "Ocean Real Estate web sitesi ve OceanOS çerez kullanımı hakkında bilgilendirme.",
    intro:
      "Ocean Real Estate web sitesi ve OceanOS, kullanıcı deneyimini geliştirmek, güvenliği sağlamak, oturum yönetimini yürütmek ve platform performansını analiz etmek amacıyla çerezler kullanabilir.",
    sections: [
      {
        heading: "Çerez Nedir?",
        body: [
          "Çerezler, ziyaret ettiğiniz web sitesi tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, siteyi daha verimli kullanmanıza yardımcı olur."
        ]
      },
      {
        heading: "Kullanılan Çerez Türleri",
        body: [
          "Zorunlu çerezler platformun temel fonksiyonlarının çalışması için gereklidir. Performans ve analiz çerezleri ise platformun nasıl kullanıldığını anlamaya ve deneyimi iyileştirmeye yardımcı olur."
        ]
      },
      {
        heading: "Çerez Tercihleri",
        body: [
          "Tarayıcı ayarlarınız üzerinden çerezleri silebilir veya engelleyebilirsiniz. Ancak bazı çerezlerin devre dışı bırakılması platformun bazı bölümlerinin düzgün çalışmamasına neden olabilir."
        ]
      }
    ]
  },
  {
    slug: "kullanim-kosullari",
    title: "Kullanım Koşulları",
    description: "Ocean Real Estate web sitesi ve OceanOS kullanım koşulları.",
    intro:
      "Ocean Real Estate web sitesi ve OceanOS’u kullanan herkes, bu kullanım koşullarına uygun hareket etmeyi kabul eder.",
    sections: [
      {
        heading: "Platform Amacı",
        body: [
          "Platform; portföy, arayış, eşleşme, işlem, komisyon, iletişim ve başvuru süreçlerini daha düzenli yürütmek amacıyla sunulur."
        ]
      },
      {
        heading: "Kullanıcı Sorumlulukları",
        body: [
          "Kullanıcılar platforma doğru, güncel ve yanıltıcı olmayan bilgi girmekle yükümlüdür.",
          "Yetkisiz bilgi paylaşımı, üçüncü kişilere ait verilerin izinsiz kullanımı, gerçeğe aykırı portföy girişi, platformu kötüye kullanma veya sistem güvenliğini tehlikeye atma yasaktır."
        ]
      },
      {
        heading: "Platform Kullanımı",
        body: [
          "OceanOS’ta yer alan bilgiler, yetki seviyesine göre görüntülenir. Kullanıcılar yalnızca kendilerine açılan alanları kullanabilir ve erişim yetkisi olmayan bilgilere ulaşmaya çalışamaz."
        ]
      },
      {
        heading: "Değişiklikler",
        body: [
          "Star Girişim ve Yatırım A.Ş., platform işleyişini, kullanım kurallarını ve hizmet kapsamını mevzuata ve operasyonel ihtiyaçlara uygun olarak güncelleyebilir."
        ]
      }
    ]
  },
  {
    slug: "uyelik-ve-odeme-kosullari",
    title: "Üyelik ve Ödeme Koşulları",
    description: "OceanOS üyelik ve ödeme koşulları.",
    intro:
      "OceanOS üyelik, danışman katılımı, ödeme ve hizmet kullanım süreçleri, ilgili kullanıcı ile Star Girişim ve Yatırım A.Ş. arasında geçerli olan sözleşme, başvuru ve onay süreçlerine göre yürütülür.",
    sections: [
      {
        heading: "Üyelik",
        body: [
          "Platforma erişim, kullanıcı rolüne ve yetki durumuna göre tanımlanır. Danışman, yönetici, ekip lideri veya diğer kullanıcı rolleri farklı erişim haklarına sahip olabilir."
        ]
      },
      {
        heading: "Ödemeler",
        body: [
          "Üyelik, hizmet, danışman katılımı, operasyonel destek veya diğer bedeller varsa, bu bedeller ilgili sözleşme, teklif veya platform üzerinde belirtilen koşullara göre tahsil edilir."
        ]
      },
      {
        heading: "Ödeme Güvenliği",
        body: [
          "Platform ödeme süreçlerinde güvenli ödeme altyapıları kullanabilir. Kart bilgileri doğrudan OceanOS tarafından saklanmaz; ödeme sağlayıcının güvenli altyapısı üzerinden işlenir."
        ]
      },
      {
        heading: "Değişiklik",
        body: [
          "Ücretler, hizmet kapsamı ve ödeme koşulları, ilgili sözleşme ve bilgilendirmelere uygun şekilde güncellenebilir."
        ]
      }
    ]
  },
  {
    slug: "acik-riza-metni",
    title: "Açık Rıza Metni",
    description: "Belirli kişisel veri işleme faaliyetleri için açık rıza metni.",
    intro:
      "Bu metin, kullanıcıların belirli kişisel veri işleme faaliyetlerine açık rıza vermesi gereken durumlar için hazırlanmıştır.",
    sections: [
      {
        heading: "Açık Rıza Tanımı",
        body: [
          "Açık rıza, kullanıcının belirli bir konuya ilişkin bilgilendirilmiş ve özgür iradesiyle verdiği onaydır."
        ]
      },
      {
        heading: "Açık Rıza Kapsamı",
        body: [
          "Kullanıcı, gerekli olduğu durumlarda; iletişim, pazarlama, platform deneyiminin geliştirilmesi, belirli verilerin paylaşılması veya özel nitelikli olmayan verilerin ek işleme amaçları için açık rıza verebilir."
        ]
      },
      {
        heading: "Rızanın Geri Alınması",
        body: [
          "Kullanıcı, verdiği açık rızayı mevzuata uygun şekilde geri alabilir. Rızanın geri alınması, geri alma tarihinden sonraki işlemler için geçerlidir.",
          "Talepler için info@oceanrealestate.com.tr adresinden iletişime geçilebilir."
        ]
      }
    ]
  },
  {
    slug: "yasal-bilgilendirme",
    title: "Yasal Bilgilendirme",
    description: "Ocean Real Estate ve OceanOS için yasal bilgilendirme.",
    intro:
      "Ocean Real Estate markası ve OceanOS dijital operasyon sistemi, Star Girişim ve Yatırım A.Ş. tarafından yürütülmektedir.",
    sections: [
      {
        heading: "Genel Bilgilendirme",
        body: [
          "Platformda yer alan bilgiler genel bilgilendirme ve operasyonel kullanım amacı taşır. Gayrimenkul işlemleri, ilgili mevzuat, resmi kurum uygulamaları, sözleşme hükümleri ve taraflar arasındaki özel koşullara göre değişebilir."
        ]
      },
      {
        heading: "Sorumluluk",
        body: [
          "Ocean Real Estate, kullanıcıların platforma girdiği bilgilerin doğruluğunu sağlamak için sistemsel kontroller geliştirebilir. Ancak kullanıcılar, kendi girdikleri bilgilerin doğruluğundan ve güncelliğinden sorumludur."
        ]
      },
      {
        heading: "Marka ve İçerik Hakları",
        body: [
          "Ocean Real Estate adı, logosu, sistem yapısı, metinleri, görselleri ve dijital içerikleri izinsiz kullanılamaz, kopyalanamaz veya çoğaltılamaz."
        ]
      }
    ]
  },
  {
    slug: "basvuru-ve-iletisim",
    title: "Başvuru ve İletişim",
    description: "Ocean Real Estate başvuru ve iletişim kanalları.",
    intro:
      "Ocean Real Estate’e danışmanlık, portföy, proje iş birliği, kariyer, destek veya bilgi talepleriniz için başvurabilirsiniz.",
    sections: [
      {
        heading: "Başvuru Süreci",
        body: [
          "Başvurular ilgili ekipler tarafından değerlendirilir. Başvuru yapılması, başvurunun kabul edildiği anlamına gelmez."
        ]
      },
      {
        heading: "Başvuru Kanalları",
        body: [
          "Başvurularınızı info@oceanrealestate.com.tr adresine iletebilirsiniz.",
          "İlgili başvuru değerlendirme sürecinde sizden ek bilgi veya belge talep edilebilir."
        ]
      },
      {
        heading: "İletişim Bilgileri",
        body: [
          "Telefon: +90 (216) 280 01 00",
          "E-posta: info@oceanrealestate.com.tr",
          "Adres: Acarlar Mahallesi, Acarkent Sitesi 9. Cadde, Coliseum 5. Kat, Archerson, 34820 Beykoz / İstanbul"
        ]
      }
    ]
  },
  {
    slug: "sorumluluk-reddi",
    title: "Sorumluluk Reddi",
    description: "Ocean Real Estate web sitesi ve OceanOS bilgileri için sorumluluk reddi.",
    intro:
      "Ocean Real Estate web sitesi ve OceanOS üzerinde yer alan bilgiler, genel bilgilendirme ve operasyonel süreç yönetimi amacıyla sunulur.",
    sections: [
      {
        heading: "Danışmanlık Niteliği",
        body: [
          "Platformda yer alan hiçbir bilgi, tek başına hukuki, mali, vergisel veya yatırım danışmanlığı olarak kabul edilmemelidir."
        ]
      },
      {
        heading: "Gayrimenkul Bilgileri",
        body: [
          "Portföy bilgileri, kullanıcılar, danışmanlar veya yetkili kişiler tarafından girilebilir. Ocean Real Estate, bilgilerin doğru ve güncel olması için süreçler geliştirse de her portföy bilgisi işlem öncesinde ayrıca teyit edilmelidir."
        ]
      },
      {
        heading: "İşlem Kararları",
        body: [
          "Gayrimenkul alım, satım, kiralama, yatırım veya proje iş birliği kararları verilmeden önce tarafların kendi araştırmalarını yapması, gerekli belgeleri incelemesi ve uzman desteği alması önerilir."
        ]
      },
      {
        heading: "Teknik Erişim",
        body: [
          "Platformun kesintisiz veya hatasız çalışacağı garanti edilmez. Teknik bakım, güncelleme, altyapı sağlayıcı sorunları veya mücbir sebepler nedeniyle erişim kesintileri yaşanabilir."
        ]
      }
    ]
  }
];

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
