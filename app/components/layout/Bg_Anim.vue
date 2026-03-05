<template>
  <div class="bg-anim">
    <div class="banner-content">
      <p ref="titleRef" class="title default-title-letter">
        npmrungame
      </p>
      <p class="subtitle text-grey-lighten-1">
        4K oyun dünyasının nabzını tutan bir kanal. <br>
        Niş indielerden, yeni çıkan AAA oyunlara, donanım trendlerinden güncel oyun haberlerine kadar birçok içerik
        sunar. Gelişen ekosistemimizin parçası olun.
      </p>

      <!-- 3 Ana CTA - Tek satır, düzenli gruplanmış -->
      <div class="actions-row">
        <v-chip
          class="cta-chip cta-primary default-title-letter"
          variant="elevated"
          color="green-accent-2"
          size="large"
          rounded="lg"
          :ripple="false"
          @click="handleRoute('/discover')"
        >
          <template v-slot:prepend>
            <v-progress-circular v-if="loadingItem === '/discover'" indeterminate :size="18" width="1" color="black" />
            <v-icon v-else icon="mdi-compass-outline" size="small" />
          </template>
          Keşfet
        </v-chip>

        <v-chip
          class="cta-chip cta-youtube default-title-letter"
          variant="elevated"
          color="red"
          size="large"
          :ripple="false"
          href="https://www.youtube.com/@npmrungame"
          target="_blank"
          prepend-icon="mdi-youtube"
          rounded="sm"
        >
          Abone Ol
        </v-chip>

        <v-chip
          class="cta-chip cta-secondary default-title-letter"
          variant="tonal"
          color="grey-lighten-1"
          size="large"
          rounded="lg"
          :ripple="false"
          @click="handleRoute('/recommend-games')"
        >
          <template v-slot:prepend>
            <v-progress-circular v-if="loadingItem === '/recommend-games'" indeterminate :size="18" width="1" color="grey-lighten-1" />
            <v-icon v-else icon="mdi-gamepad-up" size="small" />
          </template>
          Oyun Öner
        </v-chip>
      </div>
    </div>
  </div>

  <v-responsive height="100vh" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { animate, stagger, splitText } from "animejs";

const router = useRouter();
const display = useDisplay();
const loadingItem = ref<string | null>(null);
const titleRef = ref<HTMLElement | null>(null);

const handleRoute = async (path: string) => {
  loadingItem.value = path;
  await router.push(path);
  loadingItem.value = null;
};

onMounted(() => {
  if (!titleRef.value) return;

  const { chars } = splitText(titleRef.value, { words: false, chars: true });

  // Dalga efekti - harfler sırayla hafifçe yukarı kalkıp iniyor
  animate(chars, {
    y: [
      { to: 0, duration: 0 },
      { to: -6, ease: "outQuad", duration: 400 },
      { to: 0, ease: "outBounce", duration: 500 },
    ],
    opacity: [
      { to: 1, duration: 0 },
      { to: 0.85, duration: 200 },
      { to: 1, duration: 400 },
    ],
    delay: stagger(60, { from: "center" }),
    loop: true,
    loopDelay: 3500,
  });
});
</script>

<style scoped>
@import url("~/assets/css/main.css");

.bg-anim {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh !important;
  overflow: hidden;
  background: rgb(33, 20, 105);
  background-image:
    radial-gradient(circle at 90% 24%, rgba(209, 209, 209, 0.04) 0%, rgba(209, 209, 209, 0.04) 50%, rgba(160, 160, 160, 0.04) 50%, rgba(160, 160, 160, 0.04) 100%),
    radial-gradient(circle at 91% 63%, rgba(45, 45, 45, 0.04) 0%, rgba(45, 45, 45, 0.04) 50%, rgba(87, 87, 87, 0.04) 50%, rgba(87, 87, 87, 0.04) 100%),
    radial-gradient(circle at 17% 2%, rgba(124, 124, 124, 0.04) 0%, rgba(124, 124, 124, 0.04) 50%, rgba(117, 117, 117, 0.04) 50%, rgba(117, 117, 117, 0.04) 100%),
    linear-gradient(88deg, rgb(33, 20, 105), rgb(7, 27, 23));
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  max-width: 90%;
  width: 100%;
  padding: 1rem;
}

.title {
  color: #e8e8e8;
  font-size: clamp(1.75rem, 6vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  display: inline-block;
  letter-spacing: 3px;
}

.title :deep(span) {
  display: inline-block;
}

.subtitle {
  font-size: clamp(0.85rem, 2vw, 1.1rem);
  line-height: 1.7;
  max-width: 520px;
  margin: 0 auto 2rem;
  opacity: 0.9;
}

.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.cta-chip {
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
  min-width: 120px;
}

.cta-chip:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.cta-primary:hover {
  box-shadow: 0 8px 24px rgba(105, 240, 174, 0.35);
}

.cta-youtube {
  padding-inline: 1.5rem !important;
  font-weight: 700 !important;
}

.cta-youtube:hover {
  box-shadow: 0 8px 28px rgba(255, 0, 0, 0.5);
}

.cta-secondary:hover {
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15);
}
</style>
