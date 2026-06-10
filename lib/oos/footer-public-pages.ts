import { OCEAN_CONTACT_EMAIL } from "./contact";

export type PublicContentPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export const publicContentPages: PublicContentPage[] = [
  {
    slug: "about",
    title: "Hakkımızda",
    description: "Ocean Real Estate kurumsal yaklaşımı ve OceanOS çalışma standardı.",
    intro:
      "Ocean Real Estate, gayrimenkul sektöründe portföy, arayış, eşleşme, işlem ve komisyon süreçlerini daha düzenli, daha şeffaf ve daha ölçülebilir hale getirmek amacıyla geliştirilmiş yeni nesil bir gayrimenkul markasıdır.",
    sections: [
      {
        heading: "Ocean Real Estate",
        body: [
          "Ocean Real Estate’in temel yaklaşımı, klasik emlak ofisi anlayışının ötesine geçerek danışmanların yalnızca bireysel çaba ile değil, güçlü bir sistem desteğiyle çalışmasını sağlamaktır. Bu nedenle Ocean, kendisini yalnızca bir ofis olarak değil; teknoloji, operasyon disiplini, veri yönetimi, marka standardı ve profesyonel süreçlerden oluşan bütünleşik bir yapı olarak konumlandırır.",
          "OceanOS, bu yaklaşımın dijital merkezidir. Portföylerin yönetilmesi, müşteri arayışlarının takip edilmesi, uygun fırsatların eşleştirilmesi, işlem süreçlerinin kayda alınması ve komisyonların şeffaf biçimde izlenmesi bu sistem üzerinden yürütülür.",
          "Ocean Real Estate, danışmanların daha verimli çalışmasını, müşterilerin daha doğru bilgiye ulaşmasını ve gayrimenkul süreçlerinin daha güvenli ilerlemesini hedefler."
        ]
      },
      {
        heading: "Yaklaşımımız",
        body: [
          "Ocean Real Estate’te her portföy yalnızca bir ilan olarak görülmez. Her portföy; doğru fiyatlandırma, doğru hedef kitle, doğru sunum, doğru takip ve doğru eşleşme süreciyle yönetilmesi gereken ticari bir varlık olarak değerlendirilir.",
          "Bu yapı sayesinde danışmanlar yalnız çalışmaz; sistem, veri ve operasyon desteğiyle güçlendirilir."
        ]
      },
      {
        heading: "Vizyonumuz",
        body: [
          "Ocean Real Estate’in vizyonu, Türkiye’de ve ilerleyen dönemde uluslararası pazarlarda daha profesyonel, daha teknolojik ve daha ölçeklenebilir bir gayrimenkul çalışma standardı oluşturmaktır."
        ]
      }
    ]
  },
  {
    slug: "ocean-elite",
    title: "Ocean Elite",
    description: "Yüksek performanslı gayrimenkul danışmanları için profesyonel çalışma modeli.",
    intro:
      "Ocean Elite, yüksek performanslı gayrimenkul danışmanları için tasarlanmış profesyonel çalışma modelidir.",
    sections: [
      {
        heading: "Model",
        body: [
          "Bu model, daha fazla üretim yapan, portföy kalitesine önem veren, müşteri ilişkilerini disiplinli yöneten ve uzun vadede kendi iş hacmini büyütmek isteyen danışmanlar için geliştirilmiştir.",
          "Ocean Elite danışmanları, Ocean Real Estate’in marka gücünden, operasyon altyapısından, dijital sistemlerinden ve profesyonel çalışma standartlarından yararlanır."
        ]
      },
      {
        heading: "Kimler İçin Uygundur?",
        body: [
          "Ocean Elite; aktif portföy yöneten, müşteri ağı güçlü olan, yüksek işlem hacmi hedefleyen ve gayrimenkul sektöründe profesyonel bir marka çatısı altında büyümek isteyen danışmanlar için uygundur."
        ]
      },
      {
        heading: "Modelin Temel Farkı",
        body: [
          "Ocean Elite yalnızca bir komisyon modeli değildir. Danışmanın üretimini destekleyen, gelirini daha şeffaf hale getiren, portföylerini daha düzenli yönetmesini sağlayan ve işlem süreçlerini sistematikleştiren bir çalışma yapısıdır.",
          "Bu modelde amaç, danışmanın emeğini daha verimli kullanmasını ve ürettiği değeri daha güçlü bir sistem içinde büyütmesini sağlamaktır."
        ]
      }
    ]
  },
  {
    slug: "star-girisim-ve-yatirim",
    title: "Star Girişim ve Yatırım A.Ş.",
    description: "Ocean Real Estate markasının ticari ve kurumsal yapılanması.",
    intro:
      "Star Girişim ve Yatırım A.Ş., Ocean Real Estate markasının ticari ve kurumsal yapılanmasını yürüten şirkettir.",
    sections: [
      {
        heading: "Kurumsal Yapı",
        body: [
          "Şirket, gayrimenkul, yatırım, girişim, proje geliştirme, dijital sistemler ve operasyonel iş modelleri alanlarında uzun vadeli değer üretmeyi hedefleyen bir yapı olarak konumlanır.",
          "Ocean Real Estate, Star Girişim ve Yatırım A.Ş. çatısı altında geliştirilen profesyonel gayrimenkul markasıdır. OceanOS ise bu markanın dijital operasyon sistemidir."
        ]
      },
      {
        heading: "Kurumsal Yaklaşım",
        body: [
          "Star Girişim ve Yatırım A.Ş., yürüttüğü faaliyetlerde sürdürülebilirlik, şeffaflık, ölçülebilirlik ve profesyonel süreç yönetimini esas alır.",
          "Şirketin gayrimenkul alanındaki temel hedefi; danışmanlar, müşteriler, yatırımcılar ve proje sahipleri için daha güvenilir, daha hızlı ve daha sistemli bir işlem altyapısı oluşturmaktır."
        ]
      }
    ]
  },
  {
    slug: "careers",
    title: "Kariyer",
    description: "Ocean Real Estate kariyer ve danışman çalışma kültürü.",
    intro:
      "Ocean Real Estate, gayrimenkul sektöründe daha profesyonel, daha sistemli ve daha yüksek performanslı bir çalışma kültürü oluşturmayı hedefler.",
    sections: [
      {
        heading: "Ocean’da Çalışmak",
        body: [
          "Bu hedef doğrultusunda, kendini geliştirmek isteyen, müşteri ilişkilerinde güçlü, portföy yönetimine önem veren, disiplinli ve sonuç odaklı danışmanlarla çalışmayı amaçlarız.",
          "Ocean Real Estate’te danışmanlar yalnızca bireysel çabalarıyla değil, OceanOS dijital altyapısı, marka standartları, operasyonel süreçler ve profesyonel destek yapısıyla çalışır.",
          "Bu sistem, danışmanların portföylerini daha iyi yönetmesini, müşteri arayışlarını daha doğru takip etmesini ve işlem fırsatlarını daha verimli değerlendirmesini sağlar."
        ]
      },
      {
        heading: "Kimleri Arıyoruz?",
        body: [
          "Gayrimenkul sektöründe kariyer yapmak isteyen, mevcut iş hacmini büyütmeyi hedefleyen, profesyonel marka çatısı altında çalışmak isteyen ve uzun vadeli değer üretmeye odaklanan adaylarla tanışmak isteriz."
        ]
      }
    ]
  },
  {
    slug: "support",
    title: "Yardım ve Destek",
    description: "OceanOS ve Ocean Real Estate destek kanalları.",
    intro:
      "OceanOS ve Ocean Real Estate hizmetleriyle ilgili destek talepleriniz için bizimle iletişime geçebilirsiniz.",
    sections: [
      {
        heading: "Destek Konuları",
        body: [
          "Bu sayfa, danışmanların, müşterilerin, başvuru sahiplerinin ve iş ortaklarının doğru destek kanalına ulaşmasını sağlamak amacıyla hazırlanmıştır.",
          "OceanOS kullanımı, portföy işlemleri, arayış yönetimi, eşleşmeler, danışman başvuruları, proje iş birlikleri, ödeme ve komisyon süreçleri, yasal metinler ve genel bilgi talepleri için destek alabilirsiniz."
        ]
      },
      {
        heading: "İletişim",
        body: [
          `Destek talepleriniz için ${OCEAN_CONTACT_EMAIL} adresine e-posta gönderebilirsiniz.`
        ]
      }
    ]
  },
  {
    slug: "tax-calculator",
    title: "Vergi Hesaplayıcı",
    description: "Gayrimenkul işlemleri için temel vergi ve maliyet bilgilendirmesi.",
    intro:
      "Vergi Hesaplayıcı, gayrimenkul işlemleriyle ilgili temel vergi ve maliyet kalemlerini daha anlaşılır şekilde değerlendirmeye yardımcı olmak için hazırlanmıştır.",
    sections: [
      {
        heading: "Kapsam",
        body: [
          "Bu araç, kullanıcıya genel bilgi sunar. Nihai vergi, harç ve ödeme yükümlülükleri; işlem türüne, taşınmazın niteliğine, tarafların durumuna, güncel mevzuata ve ilgili resmi kurum uygulamalarına göre değişebilir."
        ]
      },
      {
        heading: "Önemli Bilgilendirme",
        body: [
          "Bu hesaplayıcı hukuki, mali veya vergisel danışmanlık hizmeti sunmaz. İşlem yapmadan önce mali müşavir, avukat, tapu müdürlüğü veya ilgili resmi kurumlardan teyit alınması önerilir."
        ]
      }
    ]
  }
];

export function getPublicContentPage(slug: string) {
  return publicContentPages.find((page) => page.slug === slug);
}
