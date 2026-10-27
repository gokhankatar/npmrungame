import { fetchSteamStoreHeader } from "../../utils/steamApi";

/**
 * Steam store appdetails üzerinden hash’li kapak URL’leri.
 * Klasik /steam/apps/{id}/header.jpg olmayan (özellikle yakında çıkacak) oyunlar için.
 */
export default defineEventHandler(async (event) => {
  const raw = String(getQuery(event).appIds || "").trim();
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s))
    .slice(0, 24);

  if (!ids.length) {
    return { success: true, data: {} as Record<string, string> };
  }

  const images: Record<string, string> = {};
  // Store rate-limit için 6’şar paralel
  const chunk = 6;
  for (let i = 0; i < ids.length; i += chunk) {
    const batch = ids.slice(i, i + chunk);
    await Promise.all(
      batch.map(async (id) => {
        const url = await fetchSteamStoreHeader(id);
        if (url) images[id] = url;
      })
    );
  }

  return { success: true, data: images };
});
