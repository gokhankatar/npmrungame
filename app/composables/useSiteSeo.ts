import {
  buildPageUrl,
  DEFAULT_OG_IMAGE,
  OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  resolveStaticRouteSeo,
  SITE_NAME,
  type SiteSeoOptions,
} from "~/utils/siteSeo";

const overrideStateKey = "site-seo-override";

export const setPageSeo = (options: SiteSeoOptions | null) => {
  const state = useState<SiteSeoOptions | null>(overrideStateKey, () => null);
  state.value = options;
};

export const applySiteSeo = (options: SiteSeoOptions) => {
  const path = options.path ?? "/";
  const pageUrl = buildPageUrl(path);
  const image = options.image ?? DEFAULT_OG_IMAGE;
  const imageAlt = options.imageAlt ?? OG_IMAGE_ALT;
  const robots = options.robots ?? (options.noIndex ? "noindex, nofollow" : "index, follow");

  useSeoMeta({
    title: options.title,
    description: options.description,
    robots,

    ogTitle: options.title,
    ogDescription: options.description,
    ogType: options.type ?? "website",
    ogUrl: pageUrl,
    ogImage: image,
    ogImageSecureUrl: image,
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
    ogImageAlt: imageAlt,
    ogSiteName: SITE_NAME,
    ogLocale: "tr_TR",

    twitterCard: "summary_large_image",
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
  });

  useHead({
    htmlAttrs: { lang: "tr" },
    link: [{ rel: "canonical", href: pageUrl }],
  });
};

/** Rota veya sayfa override’ına göre SEO meta’larını uygular */
export const useSiteSeo = () => {
  const route = useRoute();
  const override = useState<SiteSeoOptions | null>(overrideStateKey, () => null);

  const applyForCurrentRoute = () => {
    const staticSeo = resolveStaticRouteSeo(route.path);
    const opts = override.value ?? staticSeo;

    if (opts) {
      applySiteSeo({ ...opts, path: opts.path ?? route.path });
    }
  };

  watch(
    () => route.path,
    () => {
      override.value = null;
      applyForCurrentRoute();
    }
  );

  watch(override, () => applyForCurrentRoute(), { deep: true });

  onMounted(applyForCurrentRoute);

  if (import.meta.server) {
    applyForCurrentRoute();
  }

  return { setPageSeo, applySiteSeo };
};
