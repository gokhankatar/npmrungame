import { fetchSteamStorePrices } from "../../utils/steamApi";

/**
 * Steam store appdetails → fiyat / indirim.
 * Query: appIds=1,2,3  cc=TR  (max 48)
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const raw = String(q.appIds || "").trim();
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^\d+$/.test(s))
    .slice(0, 48);
  const cc = String(q.cc || "TR").trim().toUpperCase().slice(0, 2) || "TR";

  if (!ids.length) {
    return { success: true, data: { items: [], currency: cc } };
  }

  const items = await fetchSteamStorePrices(ids, { cc, concurrency: 5 });
  const currency =
    items.find((i) => i.currency)?.currency || cc;

  return {
    success: true,
    data: {
      currency,
      items,
      priced: items.filter((i) => i.final != null).length,
      onSale: items.filter((i) => i.discountPct > 0).length,
    },
  };
});
