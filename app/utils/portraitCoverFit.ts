export type PortraitCoverFitOpts = {
  mediaSelector: string;
  imgBaseClass: string;
  bleedClass: string;
  fgClass: string;
  mediaWideClass: string;
};

/**
 * Yatay (landscape) kapak → dikey kart:
 * bulanık bleed zemin + ortada contain poster.
 */
export function syncPortraitCoverFit(
  el: HTMLImageElement,
  opts: PortraitCoverFitOpts
) {
  if (el.classList.contains(opts.bleedClass)) return;
  const w = el.naturalWidth;
  const h = el.naturalHeight;
  if (!w || !h) return;

  const media = el.closest(opts.mediaSelector) as HTMLElement | null;
  const wide = w / h > 1.15;
  el.classList.toggle(opts.fgClass, wide);
  media?.classList.toggle(opts.mediaWideClass, wide);

  let bleed = media?.querySelector(
    `.${opts.bleedClass}`
  ) as HTMLImageElement | null;
  if (wide) {
    if (!bleed && media) {
      bleed = document.createElement("img");
      bleed.className = `${opts.imgBaseClass} ${opts.bleedClass}`;
      bleed.alt = "";
      bleed.setAttribute("aria-hidden", "true");
      media.insertBefore(bleed, el);
    }
    if (bleed) bleed.src = el.currentSrc || el.src;
  } else if (bleed) {
    bleed.remove();
  }
}

export function clearPortraitCoverFit(
  el: HTMLImageElement,
  opts: PortraitCoverFitOpts
) {
  if (el.classList.contains(opts.bleedClass)) return;
  const media = el.closest(opts.mediaSelector);
  media?.classList.remove(opts.mediaWideClass);
  el.classList.remove(opts.fgClass);
  media?.querySelector(`.${opts.bleedClass}`)?.remove();
}
