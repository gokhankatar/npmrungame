import { SITE_URL, STATIC_ROUTE_SEO } from "~/utils/siteSeo";

export default defineEventHandler((event) => {
  const paths = STATIC_ROUTE_SEO.map((r) => r.path);
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = paths
    .map(
      (path) => `
  <url>
    <loc>${path === "/" ? SITE_URL : `${SITE_URL}${path}`}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  return xml;
});
