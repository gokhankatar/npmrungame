# Steam entegrasyonu

## Amaç

Steam hesabını panele bağlayıp kütüphane, başarımlar, son oynananlar ve **Keşif** özelliklerini Steam Web API ile göstermek; owner’ın Oyuncular / panel ana sayfasında “şu an oynuyor” görmesini sağlamak.

## Nerede kaldık (2026-10-27)

Steam hub MVP büyük ölçüde **tamam**. Keşif varsayılan sekme; Başarımlar ayrı sayfa değil hub tab’ı. Light mode’da Kütüphane / Başarımlar sekmelerinde hâlâ “aşırı parlak” hissi var — Keşif’te sorun yok; global temayı bozmadan sadece bu iki sekmeye özel çözüm **sonraya bırakıldı**.

### Bu turda yapılanlar

- Steam OpenID bağlama / kaldırma (Hesap)
- Hub: Keşif · Kütüphane · Başarımlar · Son 2 hafta (chip tab’lar, outlined)
- Keşif: kütüphane değeri (TRY/USD Frankfurter), platin skorboard, yıl özeti, radar↔Steam (sadece kütüphanede olmayanlar + kapaklı kartlar), arkadaşlar canlı (col-12 + boş durum metni)
- Keşif skeleton (kart düzenine uygun)
- Başarımlar: `SteamAchievementsPanel` hub içinde; `/achievements` → `?tab=achievements`
- Oyun detayı: başarımlar + global nadirlik + arkadaşlar
- Owner: hub banner + panel ana + Oyuncular “şu an”
- Light FOUC / Vuetify surface: `--app-bg #b9c1cf` (Keşif ile uyumlu orta slate)
- Wishlist hub tab’ı kaldırıldı (API/veri hâlâ var; UI’da yok)

### Açık / bilinçli ertelenen

| Konu | Not |
|---|---|
| Light mode Kütüphane + Başarımlar parlaklık | Koyu Steam kartları + açık zemin kontrastı. Kartları light’a çevirme / global bg koyulaştırma Keşif’i bozdu → **geri alındı**. Sonraki turda sadece bu sekmeler için (global tema dokunmadan) çöz. |
| Wishlist tab | Hub’dan çıkarıldı; tekrar istenirse kolay |
| İndirim / nadir / owner-playing Keşif kartları | Paketten sadeleştirildi / oyun detayına taşındı |

## Kullanıcı hikayeleri

- Oyuncu Hesap’tan Steam’i OpenID ile bağlar / kaldırır.
- Sidebar **Platformlar → Steam** hub’ında Keşif, kütüphane, başarımlar, son 2 hafta.
- Keşif’te: kütüphane değeri, platin skorboard, yıl özeti, radar’da var·Steam kütüphanede yok, arkadaşlar canlı.
- Oyuna tıklayınca başarımlar + global nadirlik % + aynı oyunu oynayan arkadaşlar.
- Owner Oyuncular tablosunda ve panel ana sayfada Steam “şu an” satırını görür.

## Teknik

- OpenID: [`app/utils/steamOpenId.ts`](../app/utils/steamOpenId.ts)
- Callback: [`app/pages/auth/steam/callback.vue`](../app/pages/auth/steam/callback.vue) → `registered_users.steamId`
- Hub: [`app/pages/dashboard/platforms/steam/index.vue`](../app/pages/dashboard/platforms/steam/index.vue)
- Keşif: [`SteamInsightsPanel.vue`](../app/components/panel/SteamInsightsPanel.vue) + [`useSteamInsights.ts`](../app/composables/useSteamInsights.ts)
- Başarımlar tab: [`SteamAchievementsPanel.vue`](../app/components/panel/SteamAchievementsPanel.vue) · `?tab=achievements` (eski `/achievements` redirect)
- Oyun başarımları: `/dashboard/platforms/steam/games/[appId]`
- Hub state: [`useSteamHub.ts`](../app/composables/useSteamHub.ts)
- Helpers: [`server/utils/steamApi.ts`](../server/utils/steamApi.ts), [`app/utils/steamMatch.ts`](../app/utils/steamMatch.ts), [`app/utils/steamCover.ts`](../app/utils/steamCover.ts)
- API:
  - `/api/steam/player-summary`
  - `/api/steam/owned-games`
  - `/api/steam/recently-played`
  - `/api/steam/wishlist`
  - `/api/steam/player-achievements`
  - `/api/steam/store-images`
  - `/api/steam/store-prices`
  - `/api/steam/global-achievements`
  - `/api/steam/friends`
  - `/api/fx/usd-try` (Frankfurter)
- Oyuncular: `enrichPlayersWithSteamLive` in [`useOwnerPlayerStats.ts`](../app/composables/useOwnerPlayerStats.ts)
- Env: `STEAM_WEB_API_KEY`

## Keşif özellikleri (MVP)

| Fikir | Durum | Not |
|---|---|---|
| Kütüphane değeri | ✅ | Steam `cc=TR` · Frankfurter USD/TRY · sample |
| Platin / %100 skorboard | ✅ | Hub Başarımlar tab + link |
| Nadir başarımlar | ✅ | Oyun detayında «Nadir» sıralama |
| Arkadaşlar canlı | ✅ | Keşif col-12 · boş: “Şu an oyunda olan arkadaşın yok.” |
| Yıl özeti | ✅ | `lastPlayed` bu yıl · kopyala |
| Radar ↔ Steam | ✅ | Sadece kütüphanede olmayanlar · kapaklı grid · stat kart yok |
| İndirim alarmı | ⚪ | Wishlist/radar fiyat API hazır; Keşif UI’dan çıkarıldı |
| Şu an oynuyor (owner) | ✅ | Banner + panel ana + Oyuncular |

## MVP kriterleri

- [x] OpenID bağlama / kaldırma
- [x] player-summary ile şu an oynuyor
- [x] Oyuncular kolonunda Steam durumu
- [x] Kütüphane + son oynananlar hub
- [x] Oyun bazlı başarımlar / %100
- [x] Keşif paketi (değer, yıl, radar, arkadaş)
- [x] Başarımlar hub tab (ayrı sayfa değil)
- [x] env.example notu
- [ ] Light mode: Kütüphane + Başarımlar parlaklık (ertelendi)

## Sonraki adımlar

1. **Light mode fix (öncelik):** Sadece Kütüphane / Başarımlar sekmeleri — Keşif ve global `--app-bg`’ye dokunmadan.
2. Koleksiyon dokümanlarına kalıcı `steamAppId` (IGDB) — radar eşleşmesi.
3. Tam kütüphane fiyatı için sunucu cache / cron.
4. İndirim için e-posta / push (opsiyonel).
5. Cross-user platin liderlik tablosu.

## Out of scope

- Steam ile Firebase Auth login (sadece bağlama)
- Private profile bypass
- Gerçek yıllık playtime (Steam API’de yok)

## Masaüstü notu

Electron/Tauri’de aynı OpenID return URL ve Web API kullanılır; local Steam client okuma gerekmez.
