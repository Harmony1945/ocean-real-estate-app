# OceanOS Application Map

OceanOS, Ocean Real Estate’in portföy, müşteri arayışı, eşleşme, işlem, komisyon, yasal onay ve operasyon süreçlerini tek merkezden yöneten dijital işletim sistemidir.

OceanOS yalnızca bir CRM değildir. Danışmanların daha hızlı çalışmasını, portföylerin daha düzenli yönetilmesini, arayışların doğru portföylerle eşleşmesini, komisyonların şeffaf takip edilmesini ve kritik işlemlerin kayıt altında tutulmasını sağlayan profesyonel gayrimenkul operasyon platformudur.

Ana prensip:

> Fırsat datası paylaşılır; müşteri kimliği, belgeler, özel notlar ve para datası korunur.

---

## 1. Public Website

Bu alanlar giriş yapmadan erişilebilir olmalıdır.

Routes:

* `/`
* `/about`
* `/ocean-elite`
* `/star-girisim-ve-yatirim`
* `/contact`
* `/careers`
* `/support`
* `/tools/tax-calculator`
* `/legal/*`

Bu sayfalar Ocean Real Estate’in dış dünyaya açık kurumsal yüzüdür. Kullanıcı, yatırımcı, danışman adayı veya proje sahibi bu sayfalara giriş yapmadan ulaşabilmelidir.

---

## 2. Auth

Auth alanı kullanıcıların güvenli şekilde giriş yaptığı bölümdür.

Ana parçalar:

* Güvenli Giriş kartı
* Kayıt / giriş akışı
* Legal Consent Gate
* Giriş sonrası yönlendirme

Güvenli Giriş kartında “Güvenli Giriş” yazısının yanında küçük yeşil kilit ikonu kullanılabilir. Bu ikon güven hissi verir, fakat tasarımı kalabalıklaştırmamalıdır.

---

## 3. Legal Consent Gate

Kullanıcı OceanOS’a ilk girişte yasal metinleri görür ve gerekli onayları verir.

Kayıt altına alınacak bilgiler:

* user_id
* document_slug
* document_title
* document_version
* accepted_at
* acceptance_method
* ip_address, varsa
* user_agent, varsa

Bu ekran, kullanıcının hangi metni ne zaman ve hangi versiyonda kabul ettiğini ispatlamak için kullanılır.

---

## 4. Dashboard

Dashboard, kullanıcının OceanOS içindeki ana kontrol panelidir.

Danışman için gösterilecek ana bilgiler:

* Aktif portföyler
* Aktif arayışlar
* Yeni eşleşmeler
* Devam eden işlemler
* Bekleyen görevler
* Komisyon özeti

Yönetici için gösterilecek ana bilgiler:

* Toplam aktif portföy
* Toplam aktif arayış
* Eşleşme hacmi
* Deal pipeline
* Danışman performansı
* Komisyon durumu
* Başvuru ve operasyon metrikleri

---

## 5. Portfolios

Portföyler OceanOS’un temel varlıklarıdır.

Ana ekranlar:

* Portföy listesi
* Portföy detayı
* Portföy oluşturma
* Portföy düzenleme
* Fotoğraf yükleme
* Galeri
* Görünürlük kontrolü
* Satıldı / kiralandı işaretleme

Portföylerde görünürlük seviyesi önemlidir. Her portföy herkese açık olmak zorunda değildir.

Temel görünürlük mantığı:

* public: dışarıya açık
* internal: Ocean içi danışman ağına açık
* restricted: sadece yetkili kişiler görür
* private: sadece sahibi veya admin görür

---

## 6. Property Photos and Media

Portföy fotoğrafları sistemde kontrollü şekilde yönetilir.

Kurallar:

* Her portföy için maksimum 12 fotoğraf
* Fotoğraflar danışman tarafından yüklenen orijinal görsellerden oluşur
* Sahibinden veya üçüncü taraf ilan platformlarından fotoğraf alınmaz
* Ocean watermark uygulanır
* Fotoğraf galerisi swipe/carousel olarak çalışır
* Altta dot indicator bulunur
* İlk uygun fotoğraf kapak görseli olabilir

Brand asset paths:

* `/assets/brand/just-ocean-logo-white.png`
* `/assets/brand/oceanrealestate-logo-white.png`
* `/assets/brand/ocean-watermark.png`

---

## 7. Sahibinden Link Import Assistant

Sahibinden linki portföy formunu hızlı doldurmak için kullanılır.

Bu özellik fotoğraf çekmek için kullanılmaz.

Sistem danışmana şu konuda yardımcı olur:

* Fiyat
* Lokasyon
* Metrekare
* Oda bilgisi
* Bina yaşı
* Kullanım durumu
* Tapu / imar gibi form alanları

Danışman bilgileri kontrol eder ve onaylar. Sistem kesin olmayan bilgileri otomatik doğru kabul etmez.

---

## 8. Search Requests

Arayışlar, danışmanların müşteri talebini sisteme girdiği bölümdür.

Arayış datası OceanOS için çok değerlidir. Çünkü portföy ile arayış eşleştiğinde yeni işlem fırsatı doğar.

Arayışlarda paylaşılabilecek bilgiler:

* Lokasyon
* Bütçe aralığı
* Mülk tipi
* Metrekare aralığı
* Oda ihtiyacı
* Aciliyet
* Finansman durumu
* Genel notlar

Gizli kalması gereken bilgiler:

* Müşteri adı
* Telefon
* E-posta
* Özel notlar
* Finansal detaylar

---

## 9. Matching

Matching alanı portföyler ile arayışları karşılaştırır.

Eşleşme kriterleri:

* Lokasyon
* Mülk tipi
* Fiyat aralığı
* Metrekare
* Özellikler
* Aciliyet
* Finansman uygunluğu

Sistem match_score üretir ve danışmana neden eşleştiğini açıklar.

Örnek:

“Beykoz lokasyonu eşleşiyor, villa tipi uyumlu, bütçe aralığı uygun.”

---

## 10. Deals

Deal alanı işlem fırsatlarını takip eder.

Deal statüleri:

* lead
* qualified
* viewing_scheduled
* viewing_done
* offer_received
* negotiation
* deposit_received
* contract_signed
* title_deed_scheduled
* closed_won
* closed_lost
* cancelled

Satıldı veya kiralandı olan portföy silinmez. Geçmiş işlem verisi olarak saklanır.

---

## 11. Commissions

Komisyon alanı danışman ve yönetim için gelir şeffaflığı sağlar.

Gösterilecek bilgiler:

* Brüt komisyon
* Ofis payı
* Danışman payı
* Referral bonus
* Team leader payı
* Net ödeme
* Ödeme durumu
* Ödeme tarihi

Para datası hassastır. Her kullanıcı yalnızca yetkisi olan komisyon bilgisini görmelidir.

---

## 12. Admin

Admin alanı OceanOS’un yönetim merkezidir.

Ana işlevler:

* Danışman başvuruları
* Proje başvuruları
* Public ilan onayı
* Portföy görünürlük kontrolü
* Takedown işlemleri
* Legal records
* Activity logs
* Stratejik metrikler

Admin paneli operasyonel güç verir, fakat gereksiz karmaşık olmamalıdır.

---

## 13. Help Center

Yardım merkezi danışmanların sistemi kendi başına öğrenmesini sağlar.

İçerikler:

* OOS nedir?
* Portföy nasıl girilir?
* Fotoğraf nasıl yüklenir?
* Sahibinden linki nasıl kullanılır?
* Arayış nasıl oluşturulur?
* Eşleşmeler nasıl çalışır?
* Portföy nasıl gizlenir?
* Satıldı / kiralandı nasıl işaretlenir?
* Komisyon ekranı nasıl okunur?
* Yasal onaylar ne anlama gelir?

Help Center, OOS Kullanım Kitapçığı ile uyumlu olmalıdır.
