import type { SteamGame } from "~/composables/useSteamHub";

/** Kapak aday listesi (store header öncelikli) */
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
    g.capsuleUrl || "",
    g.iconUrl || "",
  ].filter(Boolean);
  return [...new Set(list)];
}

export function steamCoverSrc(g: Parameters<typeof steamGameCoverList>[0]) {
  return steamGameCoverList(g)[0] || "";
}

/** img onerror: sıradaki adaya geç */
export function advanceSteamCover(e: Event, g: SteamGame) {
  const el = e.target as HTMLImageElement;
  const list = steamGameCoverList(g);
  const cur = list.findIndex((u) => u === el.currentSrc || u === el.src);
  const next = list[cur + 1] || list.find((u) => u && u !== el.src);
  if (next && next !== el.src) {
    el.src = next;
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
