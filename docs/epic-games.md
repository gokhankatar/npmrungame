# Epic Games — hedefler

## Amaç

İleride oyuncunun Epic hesabını / kütüphanesini panele yansıtmak (bağlı rozeti, mümkünse oyun listesi).

## Kullanıcı hikayeleri

- Oyuncu Hesap → Bağlı platformlar’dan Epic’i bağlar.
- Owner Oyuncular’da “Epic bağlı” rozeti görür.
- İdeal: Epic kütüphanesindeki oyunlar backlog / radar ile eşleşebilir.

## Teknik engeller (API “yok” değil — yanlış API)

Epic’in [dev.epicgames.com](https://dev.epicgames.com/docs/api-ref) ve [Connect Web API](https://dev.epicgames.com/docs/web-api-ref/connect-web-api) dokümanları **gerçek**: bunlar **Epic Online Services (EOS)** — oyun geliştiricilerinin kendi ürünlerinde auth, matchmaking, voice, **kendi oyununun** Ecom ownership / achievements’i için.

Steam Web API’deki gibi “oyuncunun **tüm Epic Store kütüphanesini** oku” endpoint’i **yok**. Epic resmi olarak doğruladı: [Is there a web API endpoint to retrieve a user's library or games?](https://eoshelp.epicgames.com/s/article/Is-there-a-web-API-endpoint-to-retrieve-a-user-s-library-or-games?language=en_US) — *“EOS does not offer an endpoint for retrieving a user's game library. The Ecom API is constrained to … just the product the calling client is associated with.”*

| Ne istiyoruz (panel) | Epic ne sunuyor |
| --- | --- |
| Tüm Epic kütüphanesi | ❌ Resmi yok |
| Cross-game başarımlar | ❌ Sadece kendi EOS product achievements |
| Hesap bağlama / Account Services | ✅ EOS + Connect (oyun/partner ürünü için) |
| “Bu kullanıcı benim oyunumu aldı mı?” | ✅ Ecom ownership (kendi catalog item’ların) |

Gayriresmi launcher / cookie client’lar (ör. `egs_api`) kütüphane çekebilir ama ToS + kırılma riski; panel MVP’sinde kullanmıyoruz.

## MVP kriterleri (hedef)

- [ ] Hesap’ta “Epic bağla” placeholder + “yakında” durumu **veya** manuel “Epic kullanıcı adı” alanı
- [ ] `registered_users.epicId` / `epicDisplayName` şeması
- [ ] Oyuncular’da Epic rozeti (canlı kütüphane olmadan)
- [ ] Docs güncellemesi: resmi API bulunursa bağlama akışı

## Out of scope (şimdi)

- Otomatik Epic kütüphane sync
- Epic store fiyatları / kütüphane değeri
- Gayriresmi login / cookie scrapers

## Masaüstü notu

Masaüstünde lokal Epic launcher klasöründen okuma teorik olarak mümkün ama kırılgan ve ToS riskli; önce web’de resmi/manuel yol tercih edilir.
