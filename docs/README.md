# Platform entegrasyonları

npmrungame panelinde oyuncu platform hesaplarını bağlama ve canlı durum gösterme hedefleri.

## Öncelik sırası

1. **Steam** — OpenID bağlama + Web API (şu an oynuyor) — **aktif**
2. **Epic Games** — resmi kütüphane API’si yok; hedefler [`epic-games.md`](./epic-games.md)
3. **PlayStation (PSN)** — tüketici API’si yok; hedefler [`playstation.md`](./playstation.md)
4. **Nintendo** — resmi tüketici API’si yok; hedefler [`nintendo.md`](./nintendo.md)

## Dokümanlar

| Dosya | Durum |
|-------|--------|
| [steam.md](./steam.md) | Hub MVP ✅ · açık: light mode Kütüphane/Başarımlar parlaklık |
| [epic-games.md](./epic-games.md) | Hedef / araştırma |
| [playstation.md](./playstation.md) | Hedef / araştırma |
| [nintendo.md](./nintendo.md) | Hedef / araştırma |

## Ortak ilkeler

- Kullanıcı paneli: **Hesap → Bağlı platformlar** üzerinden bağlar/kaldırır.
- Owner paneli: **Oyuncular** sayfasında bağlı platform rozeti + canlı durum (mümkünse).
- Gizli / private profillerde net empty state; sessizce boş bırakma.
- Masaüstü (Electron/Tauri) aynı API sözleşmesini paylaşır; platform bağlama web’de doğrulanır, masaüstü sonra paketler.

## Ortam değişkenleri

```env
STEAM_WEB_API_KEY=
```

Epic / PSN / Nintendo için henüz env anahtarı yok (kod yok).
