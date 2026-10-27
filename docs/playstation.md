# PlayStation (PSN) — hedefler

## Amaç

Oyuncunun PSN kimliğini panele bağlamak; mümkün olduğunda trophy / “şu an oynuyor” benzeri sinyaller.

## Kullanıcı hikayeleri

- Oyuncu Hesap’tan PSN Online ID veya hesap bağlama akışı başlatır.
- Owner Oyuncular’da PSN rozeti görür.
- İdeal: son trophy / şu an oynanan (PSN activity) görünür.

## Teknik engeller

- Sony’nin tüketici panelleri için açık **PSN library / trophies public API’si yok**.
- Eski / gayriresmi PSN API’leri sık kırılır, hesap banı ve ToS riski vardır.
- Bazı 3. parti aggregator’lar ücretli / sınırlıdır.

## MVP kriterleri (hedef)

- [ ] Manuel PSN Online ID alanı (`registered_users.psnOnlineId`)
- [ ] Oyuncular’da PSN rozeti
- [ ] Resmi partner API veya güvenilir 3. parti bulunursa trophy özeti
- [ ] Gizlilik: kullanıcı PSN’yi public yapmadan veri çekilmez uyarısı

## Out of scope (şimdi)

- Otomatik PSN kütüphane sync
- Gayriresmi PSN login / NPSSO token toplama
- PS Store fiyat / kütüphane değeri

## Masaüstü notu

PSN verisi bulutta tutulduğu için masaüstü ekstra avantaj sağlamaz; aynı sunucu API sözleşmesi kullanılır.
