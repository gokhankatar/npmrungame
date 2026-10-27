import {
  getLiveCountdownParts,
  shouldShowLiveReleaseCountdown,
  type LiveCountdownParts,
} from "~/utils/upcomingGames";

/**
 * Çıkış günü 00:00'a canlı geri sayım (yalnızca ≤2 takvim günü kaldığında).
 */
export function useLiveReleaseCountdown(
  releaseDate: Ref<string | null | undefined> | ComputedRef<string | null | undefined>
) {
  const now = ref(Date.now());
  let timer: ReturnType<typeof setInterval> | null = null;

  const active = computed(() => {
    const raw = releaseDate.value;
    if (!raw) return false;
    return shouldShowLiveReleaseCountdown(raw, new Date(now.value));
  });

  const parts = computed<LiveCountdownParts | null>(() => {
    const raw = releaseDate.value;
    if (!raw || !active.value) return null;
    return getLiveCountdownParts(raw, new Date(now.value));
  });

  function start() {
    if (timer || !import.meta.client) return;
    timer = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  watch(
    active,
    (on) => {
      if (on) start();
      else stop();
    },
    { immediate: true }
  );

  onMounted(() => {
    now.value = Date.now();
    if (active.value) start();
  });

  onBeforeUnmount(stop);

  return { active, parts, now };
}

/** Radar listesi gibi çoklu kart için tek tick */
export function useSharedCountdownClock(enabled: Ref<boolean> | ComputedRef<boolean>) {
  const now = ref(Date.now());
  let timer: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (timer || !import.meta.client) return;
    timer = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  watch(
    enabled,
    (on) => {
      if (on) start();
      else stop();
    },
    { immediate: true }
  );

  onMounted(() => {
    now.value = Date.now();
    if (enabled.value) start();
  });

  onBeforeUnmount(stop);

  return { now };
}
