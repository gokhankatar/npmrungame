import type { SteamGame } from "~/composables/useSteamHub";

const STEAM_CDN_CF = "https://cdn.cloudflare.steamstatic.com/steam/apps";
const STEAM_CDN_AK =
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps";

/** Dikey kütüphane kapağı — diğer panel sayfalarındaki Game_Card gibi */
export function steamPortraitUrl(appId: number | string) {
  return `${STEAM_CDN_AK}/${appId}/library_600x900.jpg`;
}

export function steamPortraitUrlCf(appId: number | string) {
  return `${STEAM_CDN_CF}/${appId}/library_600x900.jpg`;
}

export function steamHeaderCdnUrl(appId: number | string) {
  return `${STEAM_CDN_AK}/${appId}/header.jpg`;
}

export function steamHeaderCdnUrlCf(appId: number | string) {
  return `${STEAM_CDN_CF}/${appId}/header.jpg`;
}

/** Yatay header — banner / detay / satır thumb için */
export function steamGameCoverList(g: {
  appId: number;
  headerUrl?: string;
  capsuleUrl?: string;
  iconUrl?: string | null;
  coverUrls?: string[];
}): string[] {
  const list = [
    ...(g.coverUrls || []),
    g.headerUrl || "",
    steamHeaderCdnUrl(g.appId),
    steamHeaderCdnUrlCf(g.appId),
    g.capsuleUrl || "",
    g.iconUrl || "",
  ].filter(Boolean);
  return [...new Set(list)];
}

/**
 * Kütüphane grid: portrait önce, sonra yüksek çözünürlüklü header.
 * iconUrl (32px) ASLA buraya girmez — portrait karta gerilince pixel olur.
 */
export function steamPortraitCoverList(g: {
  appId: number;
  headerUrl?: string;
  capsuleUrl?: string;
  iconUrl?: string | null;
  coverUrls?: string[];
}): string[] {
  const list = [
    steamPortraitUrl(g.appId),
    steamPortraitUrlCf(g.appId),
    ...(g.coverUrls || []),
    g.headerUrl || "",
    steamHeaderCdnUrl(g.appId),
    steamHeaderCdnUrlCf(g.appId),
    g.capsuleUrl || "",
  ].filter(Boolean);
  return [...new Set(list)];
}

export function steamCoverSrc(g: Parameters<typeof steamGameCoverList>[0]) {
  return steamGameCoverList(g)[0] || "";
}

export function steamPortraitSrc(
  g: Parameters<typeof steamPortraitCoverList>[0]
) {
  return steamPortraitCoverList(g)[0] || "";
}

/** img onerror: sıradaki adaya geç (yatay liste) */
export function advanceSteamCover(e: Event, g: SteamGame) {
  advanceFromList(e, steamGameCoverList(g));
}

/** img onerror: portrait adayları */
export function advanceSteamPortraitCover(e: Event, g: SteamGame) {
  advanceFromList(e, steamPortraitCoverList(g));
}

function advanceFromList(e: Event, list: string[]) {
  const el = e.target as HTMLImageElement;
  const cur = list.findIndex((u) => u === el.currentSrc || u === el.src);
  const next = list[cur + 1] || list.find((u) => u && u !== el.src);
  if (next && next !== el.src) {
    el.src = next;
    /* load handler syncCoverFit’i tekrar çalıştırır */
    return;
  }
  el.style.opacity = "0.35";
}

/** Store appdetails ile hash’li kapakları doldur */
export async function enrichSteamCoversFromStore(games: SteamGame[]) {
  if (!games.length) return;
  const chunkSize = 20;
  for (let i = 0; i < games.length; i += chunkSize) {
    const chunk = games.slice(i, i + chunkSize);
    const appIds = chunk.map((g) => g.appId).join(",");
    try {
      const res = await $fetch<{
        success: boolean;
        data: Record<string, string>;
      }>("/api/steam/store-images", { query: { appIds } });
      const map = res?.data || {};
      for (const g of chunk) {
        const storeUrl = map[String(g.appId)];
        if (!storeUrl) continue;
        g.headerUrl = storeUrl;
        const rest = (g.coverUrls || []).filter((u) => u !== storeUrl);
        g.coverUrls = [storeUrl, ...rest];
      }
    } catch {
      /* sessiz — klasik CDN fallback kalır */
    }
  }
}
