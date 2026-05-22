<template>
  <article class="admin-goal-ring-card" :class="`admin-goal-ring-card--${variant}`">
    <div class="admin-goal-ring-card__main">
      <div class="admin-goal-ring-card__ring">
        <v-progress-circular
          v-if="loading"
          :size="ringSize"
          :width="5"
          :color="ringColor"
          indeterminate
          :bg-color="ringBgColor"
        />
        <v-progress-circular
          v-else
          :model-value="progressPercent"
          :size="ringSize"
          :width="5"
          :color="ringColor"
          :bg-color="ringBgColor"
        >
          <v-icon :icon="icon" :size="iconSize" :color="ringColor" />
        </v-progress-circular>
      </div>

      <div class="admin-goal-ring-card__body">
        <p class="admin-goal-ring-card__label">{{ label }}</p>
        <p class="admin-goal-ring-card__value" :style="{ color: ringColor }">
          {{ displayValue }}
          <span class="admin-goal-ring-card__goal">/ {{ displayGoal }}</span>
        </p>
        <p class="admin-goal-ring-card__pct">{{ progressPercent }}% hedef</p>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    label: string;
    icon: string;
    value?: number | string | null;
    goal: number;
    loading?: boolean;
    compact?: boolean;
    ringSize?: number;
    iconSize?: number | string;
    /** site = yeşil tonlar, youtube = kırmızı tonlar */
    variant?: "site" | "youtube";
  }>(),
  {
    loading: false,
    compact: false,
    ringSize: 64,
    iconSize: 22,
    variant: "site",
  }
);

function toNumber(raw: number | string | null | undefined): number {
  if (raw == null || raw === "") return 0;
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10 ? `${Math.round(m)}M` : `${m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}K` : `${k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return n.toLocaleString("tr-TR");
}

function progressToColor(percent: number, variant: "site" | "youtube"): string {
  const t = Math.min(1, Math.max(0, percent / 100));
  if (variant === "youtube") {
    const r = Math.round(183 + (255 - 183) * t);
    const g = Math.round(28 + (138 - 28) * t);
    const b = Math.round(28 + (128 - 28) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const r = Math.round(46 + (105 - 46) * t);
  const g = Math.round(125 + (240 - 125) * t);
  const b = Math.round(50 + (174 - 50) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const numericValue = computed(() => toNumber(props.value));

const progressPercent = computed(() =>
  props.goal > 0 ? Math.min(100, Math.round((numericValue.value / props.goal) * 100)) : 0
);

const ringColor = computed(() => progressToColor(progressPercent.value, props.variant));

const ringBgColor = computed(() =>
  props.variant === "youtube" ? "rgba(255, 82, 82, 0.12)" : "rgba(105, 240, 174, 0.12)"
);

const displayValue = computed(() =>
  props.compact ? formatCompact(numericValue.value) : numericValue.value.toLocaleString("tr-TR")
);

const displayGoal = computed(() => {
  if (props.goal >= 1_000_000) return "1M";
  if (props.compact && props.goal >= 1000) return formatCompact(props.goal);
  return props.goal.toLocaleString("tr-TR");
});
</script>
