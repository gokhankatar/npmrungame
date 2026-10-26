import { SITE_URL, STATIC_ROUTE_SEO } from "~/utils/siteSeo";
import { MAIN_NAV_SCHEMA } from "~/utils/siteSchema";

export default defineEventHandler((event) => {
  const fromStatic = STATIC_ROUTE_SEO.filter((r) => !r.noIndex).map(
    (r) => r.path
  );
  const fromNav = MAIN_NAV_SCHEMA.map((r) => r.path).filter(
    (p) => p !== "/auth/login" && p !== "/auth/register"
  );
  const paths = [...new Set([...fromStatic, ...fromNav])];

  const lastmod = new Date().toISOString().slice(0, 10);

  const priorityFor = (path: string) => {
    if (path === "/") return "1.0";
    if (path === "/top-10") return "0.9";
    return "0.75";
  };

  const changefreqFor = (path: string) => {
    if (path === "/") return "daily";
    if (path === "/top-10") return "weekly";
    return "monthly";
  };

  const urls = paths
    .map(
      (path) => `
  <url>
    <loc>${path === "/" ? SITE_URL : `${SITE_URL}${path}`}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreqFor(path)}</changefreq>
    <priority>${priorityFor(path)}</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600");
  return xml;
});
