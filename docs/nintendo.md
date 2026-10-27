# Nintendo — hedefler

## Amaç

Oyuncunun Nintendo Switch / hesap bilgisini panele bağlamak (en azından kimlik / rozet).

## Kullanıcı hikayeleri

- Oyuncu Hesap’tan Nintendo kullanıcı adını veya arkadaş kodunu kaydeder.
- Owner Oyuncular’da Nintendo rozeti görür.
- İdeal (uzak): Switch oyun listesi veya oyun süreleri.

## Teknik engeller

- Nintendo’nun tüketici uygulamaları için açık **kütüphane / activity API’si yok**.
- Nintendo Account OAuth sınırlı ve oyun kütüphanesi için genelde yeterli değil.
- Gayriresmi yollar kırılgan ve ToS riskli.

## MVP kriterleri (hedef)

- [ ] Manuel alanlar: `nintendoFriendCode` / `nintendoUsername`
- [ ] Oyuncular’da Nintendo rozeti
- [ ] “Yakında” durumu ile Bağlı platformlar kartında placeholder
- [ ] Resmi API açılırsa OAuth bağlama dokümante edilir

## Out of scope (şimdi)

- Otomatik Switch kütüphane sync
- Lokal Switch / console scraping
- eShop fiyat / kütüphane değeri

## Masaüstü notu

Nintendo verisi büyük ölçüde bulut/hesap tarafında; masaüstü client ek veri vermez. Öncelik manuel kimlik + rozet.
