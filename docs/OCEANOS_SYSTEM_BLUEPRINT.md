# OceanOS System Blueprint

OceanOS, Ocean Real Estate’in dijital operasyon altyapısıdır. Sistem, portföyleri, arayışları, eşleşmeleri, işlemleri, komisyonları, medya dosyalarını, yasal onayları ve kritik işlem kayıtlarını tek yapı altında yönetir.

Ana hedef, danışmanların daha hızlı işlem üretmesini sağlarken şirketin veri güvenliği, marka standardı ve operasyon kontrolünü korumaktır.

---

## 1. Core Principle

OceanOS’un temel prensibi:

> Fırsat datası paylaşılır; müşteri kimliği, belgeler, özel notlar ve para datası korunur.

Bu prensip tüm ürün kararlarında geçerlidir.

Örnek:

* Danışman tüm aktif arayış fırsatlarını görebilir.
* Danışman başka danışmanın müşteri telefonunu göremez.
* Danışman portföy fırsatını görebilir.
* Danışman malik özel notlarını göremez.
* Admin tüm operasyonu yönetebilir.
* Public ziyaretçi yalnızca onaylı public içerikleri görür.

---

## 2. Main Data Objects

OceanOS’un ana veri nesneleri:

* profiles
* advisors
* properties
* property_media
* clients
* search_requests
* matches
* deals
* commissions
* legal_acceptances
* property_source_links
* activity_logs
* advisor_applications
* project_applications

Bu tablolar sistemin iş akışını oluşturur.

---

## 3. Data Flow

Temel iş akışı:

1. Danışman portföy girer.
2. Portföy fotoğrafları yüklenir.
3. Ocean watermark uygulanır.
4. Portföy görünürlük seviyesine göre sistemde yer alır.
5. Danışman müşteri arayışı girer.
6. Sistem portföy ve arayışları eşleştirir.
7. Uygun eşleşmeden deal başlatılır.
8. Deal tamamlanınca komisyon kaydı oluşur.
9. Kritik işlemler activity log’a yazılır.

---

## 4. Public vs Protected Access

Public alanlar giriş gerektirmez:

* Home
* About
* Ocean Elite
* Star Girişim ve Yatırım A.Ş.
* Contact
* Careers
* Support
* Tax Calculator
* Legal pages

Protected alanlar giriş gerektirir:

* Dashboard
* Portfolios
* Search Requests
* Matches
* Deals
* Commissions
* Reports
* Tasks
* Admin
* Internal operations

Legal pages hiçbir zaman auth arkasına alınmamalıdır.

---

## 5. Auth and Legal Consent

Kullanıcı sisteme girdikten sonra gerekli yasal onayları tamamlamadan protected OceanOS alanlarına geçmemelidir.

Legal Consent Gate şu metinleri yönetir:

* KVKK Aydınlatma Metni
* Gizlilik Politikası
* Çerez Politikası
* Kullanım Koşulları
* Açık Rıza Metni
* Üyelik ve Ödeme Koşulları
* Platform ve Danışman Kullanım Kuralları
* Fotoğraf, Medya ve Portföy Yayın Yetkisi
* Sorumluluk Reddi

Her onay versiyonlu saklanmalıdır. Metin versiyonu değişirse kullanıcıdan sadece değişen metin için yeniden onay alınmalıdır.

---

## 6. Visibility Model

Sistem genelinde standart görünürlük modeli kullanılmalıdır.

Visibility values:

* public
* internal
* restricted
* private

Anlamları:

* public: dış kullanıcıların görebileceği içerik
* internal: Ocean danışman ağı içinde görülebilecek fırsat datası
* restricted: sadece yetkilendirilmiş kullanıcıların görebileceği hassas içerik
* private: sadece sahibi, ilgili yönetici veya admin tarafından görülebilecek içerik

Bu model portföy, fotoğraf, belge, arayış ve eşleşme alanlarında kullanılabilir.

---

## 7. Portfolio Status Model

Portföy statüleri:

* draft
* active
* reserved
* sold
* rented
* hidden
* archived

Kritik kurallar:

* sold veya rented olan portföy silinmez.
* hidden portföy silinmez, sadece görünürlükten çekilir.
* archived portföy geçmiş kayıt olarak saklanır.
* satıldı/kiralandı statüsü performans ve piyasa analizi için veri üretir.

---

## 8. Media Model

Fotoğraf sistemi sadece portföy fotoğrafları içindir.

Kurallar:

* Maksimum 12 fotoğraf
* Sadece image dosyaları
* Sahibinden fotoğrafları alınmaz
* Üçüncü taraf marketplace görselleri kullanılmaz
* Ocean watermark uygulanır
* EXIF/GPS metadata temizliği tercih edilir
* uploaded_by ve created_at saklanır
* dosya hash’i mümkünse saklanır

Watermark kaynağı:

* `/assets/brand/ocean-watermark.png`

Logo kaynakları:

* `/assets/brand/just-ocean-logo-white.png`
* `/assets/brand/oceanrealestate-logo-white.png`

Ocean Navy:

* `#011c40`

---

## 9. Matching Model

Eşleşme sistemi portföy ve arayışları karşılaştırır.

V1 scoring kriterleri:

* Lokasyon
* Mülk tipi
* Bütçe
* Metrekare
* Özellikler
* Aciliyet
* Finansman durumu

Eşleşme kayıtları silinmemeli, statü ile yönetilmelidir.

Match statuses:

* new
* viewed
* contacted
* accepted
* rejected
* deal_started

---

## 10. Deal and Commission Model

Deal, işlem fırsatının satış veya kiralama sürecidir.

Commission, deal sonucunda oluşan gelir kaydıdır.

Para datası hassas kabul edilir.

Görünürlük:

* Advisor kendi payını görür.
* Team leader kendi takımına ait sınırlı özetleri görür.
* Office admin operasyon genelini görür.
* Super admin tüm sistemi görür.

---

## 11. RLS Direction

RLS modeli sistemin iş mantığına göre kurulmalıdır.

Yanlış güvenlik yaklaşımı deal flow’u öldürebilir.

Doğru yaklaşım:

* Fırsat datası kontrollü paylaşılır.
* Müşteri kimliği korunur.
* Belgeler korunur.
* Para datası korunur.
* Admin gerektiğinde yönetebilir.
* Public kullanıcı sadece onaylı public içeriği görür.

---

## 12. Activity Logs

Kritik işlemler kayıt altına alınmalıdır.

Loglanacak aksiyon örnekleri:

* property_created
* property_updated
* property_visibility_hidden
* property_marked_sold
* property_marked_rented
* photo_uploaded
* photo_watermarked
* legal_consent_accepted
* match_generated
* deal_status_changed
* commission_updated

Activity log, ileride hukuki ispat, operasyon denetimi ve hata analizi için kullanılır.

---

## 13. Admin Review

Public alana çıkacak portföy, fotoğraf veya kritik bilgi yönetim onayına tabi olabilir.

Amaç:

* Marka standardını korumak
* Hatalı bilgiyi engellemek
* Riskli içeriği public olmadan yakalamak
* Danışman kalitesini sistemle standardize etmek

---

## 14. Performance Rules

OceanOS hızlı çalışmalıdır.

Kurallar:

* Mobil önceliklidir.
* Gereksiz animasyonlardan kaçınılır.
* Büyük görseller doğrudan tam boy yüklenmez.
* 12 fotoğraf limiti korunur.
* Dashboard ekranları ağır sorgularla yavaşlatılmaz.
* Liste ekranları sade ve hızlı olmalıdır.

---

## 15. Codex Implementation Rules

Kod yazarken:

* Minimal diff
* Gereksiz refactor yok
* Tasarım dili korunur
* Supabase key hardcode edilmez
* .env dosyalarına dokunulmaz
* Public sayfalar auth arkasına alınmaz
* Protected app alanları public yapılmaz
* Sahibinden fotoğrafları içeri alınmaz
* npm run check ve npm run build çalıştırılır
