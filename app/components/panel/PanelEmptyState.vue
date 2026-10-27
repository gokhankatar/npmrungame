<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description: string;
    tips?: { icon: string; text: string }[];
    primaryActionText?: string;
    primaryActionIcon?: string;
  }>(),
  {
    icon: "mdi-gamepad-variant-outline",
    tips: () => [],
    primaryActionIcon: "mdi-plus",
  }
);

const emit = defineEmits<{
  "primary-action": [];
}>();
</script>

<template>
  <section class="panel-empty">
    <div class="panel-empty__icon">
      <v-icon :icon="icon" size="32" />
    </div>

    <h2 class="panel-empty__title">{{ title }}</h2>
    <p class="panel-empty__desc">{{ description }}</p>

    <ul v-if="tips.length" class="panel-empty__tips" role="note">
      <li v-for="(tip, i) in tips" :key="i">
        <span class="panel-empty__tip-badge" aria-hidden="true">
          <v-icon :icon="tip.icon || 'mdi-lightbulb-on-outline'" size="14" />
        </span>
        <span class="panel-empty__tip-text">{{ tip.text }}</span>
      </li>
    </ul>

    <div v-if="primaryActionText" class="panel-empty__actions">
      <button
        type="button"
        class="panel-empty__btn"
        @click="emit('primary-action')"
      >
        <v-icon :icon="primaryActionIcon" size="18" />
        {{ primaryActionText }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.panel-empty {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0.35rem 0 1.25rem;
  padding: clamp(2rem, 4vw, 2.75rem) 1.35rem;
  border-radius: 1rem;
  border: 1px solid var(--panel-card-border, rgb(255 255 255 / 0.1));
  background: var(--panel-card, #0c1220);
  box-shadow: var(--panel-card-shadow, 0 8px 28px rgb(0 0 0 / 0.22));
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
}

.panel-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.75rem;
  height: 3.75rem;
  margin-bottom: 1rem;
  border-radius: 0.95rem;
  color: var(--panel-accent, #69f0ae);
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.1));
  border: 1px solid var(--panel-icon-border, rgb(105 240 174 / 0.28));
}

.panel-empty__title {
  margin: 0 0 0.55rem;
  font-size: clamp(1.45rem, 3.4vw, 2.1rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(
    --panel-title-grad,
    linear-gradient(120deg, #ffffff 0%, #69f0ae 52%, #b9f6ca 100%)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.panel-empty__desc {
  margin: 0 0 1rem;
  max-width: 28rem;
  font-size: 0.88rem;
  line-height: 1.55;
  font-weight: 500;
  color: var(--panel-muted, #94a3b8);
}

.panel-empty__tips {
  list-style: none;
  margin: 0 0 1.35rem;
  padding: 0;
  width: 100%;
  max-width: 26rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
}

.panel-empty__tips li {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  max-width: 100%;
  padding: 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: var(--panel-muted, #94a3b8);
  pointer-events: none;
  user-select: none;
}

.panel-empty__tip-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 999px;
  color: var(--panel-accent, #69f0ae);
  background: var(--panel-icon-bg, rgb(105 240 174 / 0.12));
  border: 1px solid var(--panel-icon-border, rgb(105 240 174 / 0.22));
}

.panel-empty__tip-text {
  text-align: left;
  font-weight: 500;
  font-style: italic;
  opacity: 0.92;
}

.panel-empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
}

.panel-empty__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: 0.75rem;
  background: var(--panel-accent, #69f0ae);
  color: var(--panel-accent-ink, #07140f);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.panel-empty__btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
</style>
