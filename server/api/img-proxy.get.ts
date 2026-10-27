/**
 * Uzak kapak görsellerini same-origin proxy’ler.
 * html-to-image / canvas için CORS engelini aşar (RAWG vb.).
 */
const ALLOWED_HOSTS = new Set([
  "media.rawg.io",
  "images.igdb.com",
  "img.igdb.com",
]);

export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const raw = String(q.url ?? "").trim();
  if (!raw) {
    throw createError({ statusCode: 400, statusMessage: "url required" });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "invalid url" });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    throw createError({ statusCode: 400, statusMessage: "invalid protocol" });
  }
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    throw createError({ statusCode: 403, statusMessage: "host not allowed" });
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: "image/*,*/*",
      "User-Agent": "npmrungame-img-proxy/1.0",
    },
  });

  if (!upstream.ok) {
    throw createError({
      statusCode: upstream.status,
      statusMessage: "upstream image failed",
    });
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await upstream.arrayBuffer());

  setHeader(event, "Content-Type", contentType);
  setHeader(event, "Cache-Control", "public, max-age=86400, immutable");
  setHeader(event, "Access-Control-Allow-Origin", "*");
  return buf;
});
