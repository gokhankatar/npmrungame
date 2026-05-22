<template>
  <component
    :is="headerTag"
    :id="anchorId"
    class="home-section-header"
    :class="{ 'home-section-header--clickable': isClickable }"
    @click="onClick"
  >
    <div class="home-section-header-inner">
      <div v-if="icon" class="home-section-icon-ring">
        <v-icon :icon="icon" :color="iconColor" :size="iconSize" />
      </div>
      <div class="home-section-text">
        <div class="d-flex align-center flex-wrap ga-2">
          <h2 class="home-section-title default-title-letter">{{ title }}</h2>
          <slot name="badge" />
        </div>
        <p v-if="subtitle" class="home-section-subtitle">{{ subtitle }}</p>
      </div>
      <v-icon
        v-if="to && isClickable"
        icon="mdi-chevron-right"
        class="home-section-arrow"
        size="small"
        color="grey-darken-1"
      />
    </div>
    <div class="home-section-line" />
  </component>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
    iconColor?: string;
    iconSize?: string | number;
    to?: string;
    anchorId?: string;
    clickable?: boolean;
  }>(),
  {
    iconColor: "#69f0ae",
    iconSize: 24,
    clickable: false,
  }
);

const emit = defineEmits<{
  click: [];
}>();

const router = useRouter();

const headerTag = computed(() => (props.anchorId ? "section" : "div"));

const isClickable = computed(() => props.clickable || !!props.to);

const onClick = () => {
  if (!isClickable.value) return;
  emit("click");
  if (props.to) router.push(props.to);
};
</script>

<style scoped>
.home-section-header {
  width: 100%;
  margin: 2.5rem 0 1.25rem;
}

.home-section-header--clickable {
  cursor: pointer;
}

.home-section-header--clickable:hover .home-section-title {
  color: #69f0ae;
}

.home-section-header--clickable:hover .home-section-arrow {
  transform: translateX(4px);
  color: #69f0ae !important;
}

.home-section-header-inner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.home-section-icon-ring {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(105, 240, 174, 0.1);
  border: 1px solid rgba(105, 240, 174, 0.28);
}

.home-section-text {
  flex: 1;
  min-width: 0;
}

.home-section-title {
  font-size: clamp(1.1rem, 2.5vw, 1.45rem);
  font-weight: 700;
  margin: 0;
  color: #eceff1;
  transition: color 0.25s ease;
}

.home-section-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.45;
}

.home-section-line {
  height: 1px;
  margin-top: 1rem;
  background: linear-gradient(
    90deg,
    rgba(105, 240, 174, 0.45) 0%,
    rgba(255, 255, 255, 0.06) 55%,
    transparent 100%
  );
}

.home-section-arrow {
  flex-shrink: 0;
  margin-top: 0.5rem;
  transition: transform 0.25s ease, color 0.25s ease;
}

@media (min-width: 960px) {
  .home-section-header {
    margin: 3.5rem 0 1.5rem;
  }
}
</style>
