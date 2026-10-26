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

    <ul v-if="tips.length" class="panel-empty__tips">
      <li v-for="(tip, i) in tips" :key="i">
        <v-icon :icon="tip.icon" size="18" class="panel-empty__tip-icon" />
        <span>{{ tip.text }}</span>
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
  --pe-accent: #69f0ae;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 0.35rem 0 1.25rem;
  padding: clamp(2rem, 4vw, 2.75rem) 1.35rem;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #0c1220;
  box-shadow: 0 8px 28px rgb(0 0 0 / 0.22);
  font-family: "Montserrat", ui-sans-serif, system-ui, sans-serif;
}

:global(html:not(.dark)) .panel-empty {
  border-color: rgb(15 23 42 / 0.1);
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.06);
}

.panel-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.75rem;
  height: 3.75rem;
  margin-bottom: 1rem;
  border-radius: 0.95rem;
  color: var(--pe-accent);
  background: rgb(105 240 174 / 0.1);
  border: 1px solid rgb(105 240 174 / 0.28);
}

:global(html:not(.dark)) .panel-empty__icon {
  color: #047857;
  background: rgb(16 185 129 / 0.1);
  border-color: rgb(16 185 129 / 0.28);
}

.panel-empty__title {
  margin: 0 0 0.55rem;
  font-size: clamp(1.45rem, 3.4vw, 2.1rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: linear-gradient(120deg, #ffffff 0%, #69f0ae 52%, #b9f6ca 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

:global(html:not(.dark)) .panel-empty__title {
  background: linear-gradient(120deg, #0f172a 0%, #047857 50%, #10b981 100%);
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
  color: #94a3b8;
}

:global(html:not(.dark)) .panel-empty__desc {
  color: #64748b;
}

.panel-empty__tips {
  list-style: none;
  margin: 0 0 1.25rem;
  padding: 0.65rem 0.85rem;
  width: 100%;
  max-width: 24rem;
  text-align: left;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.08);
  background: rgb(0 0 0 / 0.22);
}

:global(html:not(.dark)) .panel-empty__tips {
  border-color: rgb(15 23 42 / 0.08);
  background: #f8fafc;
}

.panel-empty__tips li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.4rem 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: #a8b4c7;
}

:global(html:not(.dark)) .panel-empty__tips li {
  color: #64748b;
}

.panel-empty__tips li + li {
  border-top: 1px solid rgb(255 255 255 / 0.06);
}

:global(html:not(.dark)) .panel-empty__tips li + li {
  border-top-color: rgb(15 23 42 / 0.06);
}

.panel-empty__tip-icon {
  flex-shrink: 0;
  margin-top: 0.05rem;
  color: var(--pe-accent);
}

:global(html:not(.dark)) .panel-empty__tip-icon {
  color: #059669;
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
  background: var(--pe-accent);
  color: #07140f;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.panel-empty__btn:hover {
  background: #7ff5bb;
  transform: translateY(-1px);
}
</style>
