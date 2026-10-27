/**
 * Montserrat CSS + woff2 → data-URI (html-to-image için).
 * Google Fonts stylesheet cssRules CORS’u yüzünden tarayıcıda okunamıyor.
 */
export default defineEventHandler(async (event) => {
  const cssUrl =
    "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&display=swap";

  const cssRes = await fetch(cssUrl, {
    headers: {
      // woff2 dönsün diye modern Chrome UA
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/css,*/*;q=0.1",
    },
  });

  if (!cssRes.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: "Font CSS alınamadı",
    });
  }

  let css = await cssRes.text();
  const urls = new Set<string>();
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) {
    urls.add(match[1].replace(/['"]/g, "").trim());
  }

  for (const url of urls) {
    try {
      const fontRes = await fetch(url);
      if (!fontRes.ok) continue;
      const buf = Buffer.from(await fontRes.arrayBuffer());
      const mime = url.includes(".woff2")
        ? "font/woff2"
        : url.includes(".woff")
          ? "font/woff"
          : "application/octet-stream";
      const dataUri = `data:${mime};base64,${buf.toString("base64")}`;
      css = css.split(url).join(dataUri);
    } catch {
      /* tek font fail → devam */
    }
  }

  setHeader(event, "Content-Type", "text/css; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=86400");
  return css;
});
