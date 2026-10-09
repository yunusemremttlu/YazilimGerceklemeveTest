# DiyalogRadar AI

Türkçe müşteri destek konuşmalarından izlenebilir sorun kümeleri ve takip edilebilir aksiyonlar üreten, demo modunda çalışan bir MVP.

> **Demo ve sınırlar:** Örnek kayıtların tamamı kurmacadır. Uygulamadaki analiz, gerçek bir dil modeli değil; tarayıcıda çalışan basit, deterministik kural eşleştirmesidir. Ölçülmüş Türkçe analiz başarısı, gerçek müşteri araştırması veya finansal etki tahmini iddiası yoktur. Bu sürüm bir okul projesi demosudur; üretim kullanımı için uygun değildir.

## Özellikler

- Türkçe demo arayüzü, ürün tanıtım sayfası ve mobil uyumlu çalışma alanı.
- Gösterge paneli metrikleri, dönem/kanal filtreleri ve seçili veri kümesinden türetilen grafikler.
- Konuşma arama ve duygu, kategori, kanal ve açıkça sağlanmış bölge filtreleri; konuşma detayında özgün metin ve kaynak kanıt.
- Frekans, aciliyet ve güncellik bileşenlerini birleştiren, finansal etki öngörüsü olmayan açıklanabilir demo öncelik puanı.
- İçgörüden aksiyon oluşturma; aksiyon arama, durum ve öncelik değiştirme, silme ve tarayıcı yenilemesi sonrasında saklama.
- UTF-8 CSV içe aktarma, satır doğrulama, yinelenen mesaj raporlama, içe aktarılan satır önizlemesi, metin girişi ve örnek şablon.
- Aktif filtreleri dikkate alan, formül enjeksiyonuna karşı kaçış uygulayan CSV dışa aktarma ve yazdırılabilir rapor.
- Tarayıcı tabanlı kalıcılık, demo verisi yükleme ve açık onaylı veri silme.

## Gereksinimler ve çalıştırma

- Node.js 20 veya üstü, npm.
- AI veya veritabanı servisi bu demoyu çalıştırmak için gerekmez.

```bash
npm install
npm run dev
```

Vite'ın bildirdiği yerel adresi tarayıcıda açın (genellikle `http://localhost:5173`). Temiz bir tarayıcıda uygulama örnek konuşmalarla başlar. Örnek kayıtları yeniden yüklemek için **Demo verilerini yükle** düğmesini kullanın.

## Komutlar

```bash
npm run typecheck  # TypeScript kontrolü
npm test           # Vitest birim testleri
npm run build      # TypeScript kontrolü ve üretim derlemesi
npm run preview    # Üretim derlemesini yerel sunucuda önizle
```

## Veri ve analiz mimarisi

- `src/data.ts`: örnek konuşmalar, tipler ve başlangıç aksiyonları.
- `src/logic.ts`: kural tabanlı örnek analiz, sorun kümeleme, CSV ayrıştırma ve güvenli konuşma CSV'si.
- `src/App.tsx`: ekranlar, etkileşimler ve yerel veri akışları.
- `src/styles.css`: duyarlı görsel sistem ve yazdırma stilleri.

Konuşmalar ve aksiyonlar tarayıcı `localStorage` alanında saklanır. Bu veriler sunucuya gönderilmez ve aynı tarayıcı profiline özeldir. Tarayıcı verilerini temizlemek uygulama verilerini de siler. CSV tekrar kuralı, aynı mesajın Türkçe yerel ayarında küçük harfe dönüştürülmüş ve baş/son boşlukları kırpılmış metin karşılaştırmasıdır. Yinelenen veya geçersiz satırlar hata özetiyle atlanır; uygun satırlar ayrıca önizlenir.

`.env.example` olası sunucu taraflı entegrasyonlar için yalnızca boş yer tutucular içerir. Bu sürüm bu değişkenleri okumaz; AI sağlayıcısı, API bağlantı testi, kimlik doğrulama, Supabase/PostgreSQL, veritabanı geçişleri, ekip/çalışma alanı yönetimi ve sunucu tarafı CSV işlemesi **uygulanmamıştır**. Gerçek AI bağlantısı eklenirken anahtarlar istemciye gönderilmemeli; konuşma içeriği dış sağlayıcıya gönderilmeden önce kullanıcıya açıklama ve onay gösterilmelidir. Gerçek veri tabanı eklenirken erişim kontrolü, kullanıcı izolasyonu ve sunucu tarafı doğrulama tasarlanmalıdır.

## Bilinen sınırlamalar

- Duygu, kategori, özellik talebi ve öncelik analizi basit anahtar kelime kurallarıdır; bağlamı, alayı, yazım çeşitliliğini veya niyeti güvenilir biçimde anlamaz. Güven puanları ölçülmüş model olasılığı değildir; kural eşleşmesine dayalı demo göstergeleridir.
- Günlük grafik, son yedi takvim günündeki demo konuşmalarını gösterir; örnek kayıtlar her güne dağılmayabilir. Önceki dönem kıyaslaması hesaplanmadığından mevcut olmadığı açıkça belirtilir.
- İçe aktarma en fazla 500 veri satırı/5 MB kabul eder. CSV alan eşleme sihirbazı, sayfalama, sürükle-bırak ve sunucu tarafı virüs taraması bu sürümde yoktur.
- Görev atama, kayıt başına serbest metin alanı değil, başlangıçta atanmış ekip adıdır; son kullanıcı/rol sistemi yoktur.
- Bölgesel analiz ayrı bir karşılaştırma grafiği sunmaz. Yalnızca açıkça verilmiş şehir/bölge etiketleri konuşma kayıtlarında görünür; konum tahmini yapılmaz.
- PDF dosyası üretimi, Supabase, dış AI sağlayıcısı, yetkilendirme ve düzenlenebilir görev ayrıntı formu uygulanmamıştır. Arayüz bu entegrasyonların kurulu olduğunu iddia etmez.
- Bu MVP regülasyon uyumluluğu iddiasında bulunmaz; üretime çıkmadan önce güvenlik, gizlilik ve yasal değerlendirme gerekir.

## 10 slaytlık sunum taslağı

1. **Problem:** Destek konuşmalarında tekrar eden sorunları elle ayıklamanın maliyeti.
2. **Araştırma:** YC RFS, Hacker News ve Agnost AI'ı başlangıç referansı olarak konumlandır; bunları doğrulanmış pazar bulgusu gibi sunma.
3. **Hedef kullanıcı:** Türkiye'deki e-ticaret, SaaS ve destek ekipleri.
4. **Ürün konumu:** Türkçe yerelleştirme, kaynak kanıtı ve aksiyon akışı.
5. **Mimari:** React/TypeScript MVP, analiz kuralları ve tarayıcı depolaması; mevcut üretim sınırları.
6. **Canlı demo:** Demo verisini gösterge panelinde keşfet.
7. **Farklılaştırıcı:** Yerel Dil Radarı, açıklanabilir öncelik ve konuşma kanıtı.
8. **Test ve kalite:** Gerçekten çalıştırılan test sonuçları; ölçülmemiş analiz doğruluğunu iddia etme.
9. **İş modeli:** Hacim tabanlı abonelik olasılığını hipotez olarak tartış.
10. **Yol haritası:** Etiketli Türkçe test kümesi, ölçülmüş model değerlendirmesi, güvenli sunucu/veritabanı ve pilot çalışma.

## Lisans ve kaynaklar

YC, Hacker News ve Agnost AI bağlantıları araştırma başlangıç noktalarıdır; DiyalogRadar AI bu kuruluşlarla ilişkili değildir. Ürün adı ve arayüz bağımsızdır.
