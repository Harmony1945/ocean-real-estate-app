export type DemoPortfolio = {
  id: string;
  title: string;
  location: string;
  district: string;
  owner: string;
  value: number;
  stage: string;
  contractType: string;
  nextMove: string;
  risk: string;
  commissionRate: number;
  commission: number;
  listingId: string;
  propertyType: string;
  area: string;
  rooms: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  ownerConsultantName: string;
};

export type DemoSearchRequest = {
  id: string;
  consultantName: string;
  title: string;
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minArea: number;
  maxArea: number;
  rooms: string;
  purpose: string;
  urgency: "Acil" | "Normal" | "Düşük";
  notes: string;
};

export const demoShowcasePortfolios: DemoPortfolio[] = [
  {
    id: "demo-acarkent-villa",
    title: "Acarkent Yenilenmiş B Tip Villa",
    location: "Beykoz / Acarkent",
    district: "Beykoz",
    owner: "Kurgusal Malik Grubu",
    value: 118000000,
    stage: "Görüşme",
    contractType: "Satışa Aracılık",
    nextMove: "Yabancı alıcı için ikinci gösterim ve ödeme planı hazırlığı",
    risk: "Orta",
    commissionRate: 2,
    commission: 2360000,
    listingId: "OOS-DEMO-1001",
    propertyType: "Villa",
    area: "520",
    rooms: "5+2",
    description: "Acarkent içinde yenilenmiş, geniş bahçeli ve aile kullanımına uygun kurgusal üst segment villa.",
    latitude: 41.1323,
    longitude: 29.0924,
    ownerConsultantName: "Melih Yıldız"
  },
  {
    id: "demo-etiler-residence",
    title: "Etiler Nispetiye Branded Residence",
    location: "Beşiktaş / Etiler",
    district: "Beşiktaş",
    owner: "Kurgusal Proje Sahibi",
    value: 64000000,
    stage: "Yeni",
    contractType: "Proje Satış Danışmanlığı",
    nextMove: "Proje sunumu ve emsal fiyat setini güncelle",
    risk: "Düşük",
    commissionRate: 2,
    commission: 1280000,
    listingId: "OOS-DEMO-1002",
    propertyType: "Rezidans",
    area: "185",
    rooms: "3+1",
    description: "Etiler hattında marka algısı güçlü, sosyal donatılı kurgusal residence portföyü.",
    latitude: 41.0802,
    longitude: 29.0332,
    ownerConsultantName: "Selin Arslan"
  },
  {
    id: "demo-bagdat-shop",
    title: "Bağdat Caddesi Köşe Ticari Dükkan",
    location: "Kadıköy / Suadiye",
    district: "Kadıköy",
    owner: "Kurgusal Aile Ofisi",
    value: 78000000,
    stage: "Sözleşme",
    contractType: "Satışa Aracılık",
    nextMove: "Kira çarpanı ve tabela görünürlüğü raporunu paylaş",
    risk: "Düşük",
    commissionRate: 1.5,
    commission: 1170000,
    listingId: "OOS-DEMO-1003",
    propertyType: "Ticari",
    area: "260",
    rooms: "",
    description: "Cadde üzeri görünürlüğü yüksek, yatırımcı ilgisi için kurgusal köşe ticari dükkan.",
    latitude: 40.9639,
    longitude: 29.0833,
    ownerConsultantName: "Mert Yılmaz"
  },
  {
    id: "demo-maslak-office",
    title: "Maslak Plaza Ofis Katı",
    location: "Sarıyer / Maslak",
    district: "Sarıyer",
    owner: "Kurgusal Kurumsal Malik",
    value: 54000000,
    stage: "Teklif",
    contractType: "Kurumsal Kiralama / Satış",
    nextMove: "Kurumsal alıcıya yönetim planı ve aidat bilgisini gönder",
    risk: "Orta",
    commissionRate: 2,
    commission: 1080000,
    listingId: "OOS-DEMO-1004",
    propertyType: "Ofis",
    area: "620",
    rooms: "Açık ofis",
    description: "Maslak aksında tek kat kullanım, kurumsal taşınma ve yatırım senaryosu için kurgusal ofis.",
    latitude: 41.1089,
    longitude: 29.0211,
    ownerConsultantName: "Melih Yıldız"
  },
  {
    id: "demo-zekeriyakoy-land",
    title: "Zekeriyaköy Gelişim Arsası",
    location: "Sarıyer / Zekeriyaköy",
    district: "Sarıyer",
    owner: "Kurgusal Arsa Sahibi",
    value: 92000000,
    stage: "Görüşme",
    contractType: "Proje Geliştirme",
    nextMove: "İmar notu ve alternatif geliştirme senaryolarını kontrol et",
    risk: "Yüksek",
    commissionRate: 3,
    commission: 2760000,
    listingId: "OOS-DEMO-1005",
    propertyType: "Arsa",
    area: "2400",
    rooms: "",
    description: "Kuzey İstanbul gelişim hattında, villa projesi veya butik site senaryosu için kurgusal arsa.",
    latitude: 41.1992,
    longitude: 29.0305,
    ownerConsultantName: "Selin Arslan"
  },
  {
    id: "demo-bebek-apartment",
    title: "Bebek Boğaz Manzaralı Daire",
    location: "Beşiktaş / Bebek",
    district: "Beşiktaş",
    owner: "Kurgusal Malik Temsilcisi",
    value: 87000000,
    stage: "Yeni",
    contractType: "Satışa Aracılık",
    nextMove: "Sessiz pazarlama alıcı listesini oluştur",
    risk: "Orta",
    commissionRate: 2,
    commission: 1740000,
    listingId: "OOS-DEMO-1006",
    propertyType: "Daire",
    area: "210",
    rooms: "3+1",
    description: "Boğaz manzarası ve prestijli lokasyon odağıyla hazırlanmış kurgusal premium daire.",
    latitude: 41.0765,
    longitude: 29.0438,
    ownerConsultantName: "Melih Yıldız"
  },
  {
    id: "demo-sisli-mixed-use",
    title: "Şişli Karma Kullanım Yatırımı",
    location: "Şişli / Merkez",
    district: "Şişli",
    owner: "Kurgusal Yatırım Ortaklığı",
    value: 132000000,
    stage: "Analiz",
    contractType: "Yatırım Danışmanlığı",
    nextMove: "Gelir kırılımı ve dönüşüm senaryosunu modelle",
    risk: "Yüksek",
    commissionRate: 1.5,
    commission: 1980000,
    listingId: "OOS-DEMO-1007",
    propertyType: "Karma Kullanım",
    area: "1450",
    rooms: "",
    description: "Ticari, ofis ve kısa dönem kiralama bileşenleri olan kurgusal karma kullanım yatırımı.",
    latitude: 41.0605,
    longitude: 28.9872,
    ownerConsultantName: "Mert Yılmaz"
  },
  {
    id: "demo-atasehir-income-office",
    title: "Ataşehir Kiracılı Ofis",
    location: "Ataşehir / Finans Merkezi",
    district: "Ataşehir",
    owner: "Kurgusal Portföy Şirketi",
    value: 46000000,
    stage: "Aktif",
    contractType: "Yatırım Satışı",
    nextMove: "Kira sözleşmesi özetini yatırımcı paketiyle eşleştir",
    risk: "Düşük",
    commissionRate: 2,
    commission: 920000,
    listingId: "OOS-DEMO-1008",
    propertyType: "Ofis",
    area: "410",
    rooms: "Bölümlü ofis",
    description: "Düzenli kira geliri bulunan, finans merkezi çevresinde kurgusal gelir odaklı ofis.",
    latitude: 40.9927,
    longitude: 29.1244,
    ownerConsultantName: "Selin Arslan"
  },
  {
    id: "demo-uskudar-parcel",
    title: "Üsküdar Kentsel Dönüşüm Parseli",
    location: "Üsküdar / Altunizade",
    district: "Üsküdar",
    owner: "Kurgusal Malik Konsorsiyumu",
    value: 74000000,
    stage: "Lead",
    contractType: "Kat Karşılığı Ön Çalışma",
    nextMove: "Malik mutabakatı ve emsal çalışma dosyasını tamamla",
    risk: "Yüksek",
    commissionRate: 3,
    commission: 2220000,
    listingId: "OOS-DEMO-1009",
    propertyType: "Geliştirme",
    area: "980",
    rooms: "",
    description: "Dönüşüm potansiyeli olan, geliştirici eşleşmesi bekleyen kurgusal parsel.",
    latitude: 41.0214,
    longitude: 29.0427,
    ownerConsultantName: "Melih Yıldız"
  },
  {
    id: "demo-zorlu-penthouse",
    title: "Zorlu Çevresi Penthouse",
    location: "Beşiktaş / Zincirlikuyu",
    district: "Beşiktaş",
    owner: "Kurgusal Özel Malik",
    value: 155000000,
    stage: "Gizli Pazarlama",
    contractType: "Özel Yetki",
    nextMove: "Nitelikli alıcı havuzunu ve gizlilik notunu güncelle",
    risk: "Orta",
    commissionRate: 2,
    commission: 3100000,
    listingId: "OOS-DEMO-1010",
    propertyType: "Penthouse",
    area: "360",
    rooms: "4+1",
    description: "Merkezi lokasyon, geniş teras ve prestij odaklı kurgusal lüks penthouse.",
    latitude: 41.0678,
    longitude: 29.0173,
    ownerConsultantName: "Mert Yılmaz"
  }
];

export const demoSearchRequests: DemoSearchRequest[] = [
  {
    id: "demo-search-beykoz-villa",
    consultantName: "Mert Yılmaz",
    title: "Beykoz Villa Arayışı",
    location: "Beykoz",
    propertyType: "Villa",
    minPrice: 70000000,
    maxPrice: 140000000,
    minBedrooms: 4,
    minArea: 350,
    maxArea: 800,
    rooms: "4+1+",
    purpose: "Satın Alma",
    urgency: "Acil",
    notes: "Acarkent veya çevresinde, bahçeli ve taşınmaya hazır villa aranıyor."
  },
  {
    id: "demo-search-cadde-shop",
    consultantName: "Selin Arslan",
    title: "Cadde Üzeri Ticari Arayış",
    location: "Kadıköy",
    propertyType: "Ticari",
    minPrice: 30000000,
    maxPrice: 90000000,
    minBedrooms: 0,
    minArea: 150,
    maxArea: 400,
    rooms: "",
    purpose: "Yatırım",
    urgency: "Normal",
    notes: "Görünürlüğü yüksek, kiralama potansiyeli güçlü ticari dükkan aranıyor."
  },
  {
    id: "demo-search-corporate-office",
    consultantName: "Melih Yıldız",
    title: "Kurumsal Ofis Arayışı",
    location: "Sarıyer",
    propertyType: "Ofis",
    minPrice: 35000000,
    maxPrice: 70000000,
    minBedrooms: 0,
    minArea: 400,
    maxArea: 900,
    rooms: "",
    purpose: "Kullanım",
    urgency: "Normal",
    notes: "Maslak hattında tek kat, kurumsal kullanıma hazır ofis aranıyor."
  },
  {
    id: "demo-search-bosphorus-home",
    consultantName: "Selin Arslan",
    title: "Boğaz Manzaralı Konut Arayışı",
    location: "Beşiktaş",
    propertyType: "Daire",
    minPrice: 50000000,
    maxPrice: 110000000,
    minBedrooms: 3,
    minArea: 160,
    maxArea: 280,
    rooms: "3+1",
    purpose: "Satın Alma",
    urgency: "Acil",
    notes: "Bebek, Etiler veya çevresinde prestijli konut aranıyor."
  },
  {
    id: "demo-search-development-land",
    consultantName: "Mert Yılmaz",
    title: "Arsa / Geliştirme Fırsatı",
    location: "Sarıyer",
    propertyType: "Arsa",
    minPrice: 50000000,
    maxPrice: 120000000,
    minBedrooms: 0,
    minArea: 900,
    maxArea: 3000,
    rooms: "",
    purpose: "Geliştirme",
    urgency: "Düşük",
    notes: "Butik site veya villa geliştirme potansiyeli olan arsa aranıyor."
  }
];
