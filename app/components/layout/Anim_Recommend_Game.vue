<template>
  <div
    ref="vantaRefForRecommendedGames"
    class="bg-anim"
    :class="display.smAndDown.value ? 'bg-anim-sm' : 'bg-anim-lg'"
  >
    <!-- Banner Content -->
    <v-row class="banner-content mx-auto w-100 w-md-75 w-lg-50 pa-2 pa-lg-5 rounded-lg">
      <v-col cols="12">
        <div class="d-flex flex-column align-center ga-3 ga-sm-5 ga-lg-8">
          <Animated_Title />
          <p
            class="text-center text-grey-darken-1 text-subtitle-2 text-sm-subtitle-1 text-lg-h5"
            :style="
              display.mdAndUp.value ? { lineHeight: '2.1rem' } : { lineHeight: '1.2rem' }
            "
          >
            Önereceğiniz tüm oyunlar titizlikle değerlendirilecek. Npmrungame ekibi,
            önerilerinizi inceleyip oynanacak oyunlar listesine ekleyecek ve bu süreçte
            katkılarınız için özellikle teşekkür edecek. Bazı dönemlerde önerileriniz için
            küçük sürpriz ödüller de sunulabilir. Bu nedenle önerileriniz gerçekten
            değerli, şimdiden teşekkürler ve herkese keyifli oyunlar...
          </p>

          <div class="arrow-bounce mt-2 mt-lg-4">
            <v-icon icon="mdi-down-arrow" class="down-arrow"></v-icon>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>

  <v-responsive :height="getResponsiveHeight()" />
</template>

<script setup lang="ts">
import Animated_Title from "../common/Animated_Title.vue";

let vantaEffect: any = null;
const vantaRefForRecommendedGames = ref<HTMLElement | null>(null);

const router = useRouter();
const display = useDisplay();

const getResponsiveHeight = () => {
  const { smAndDown, mdAndUp, xl } = display;

  if (xl.value) return "50vh"; // XL için özel yükseklik
  if (smAndDown.value) return "75vh"; // SM ve altı
  if (mdAndUp.value) return "85vh"; // MD–LG

  return "85vh"; // fallback
};

onMounted(async () => {
  if (!vantaRefForRecommendedGames.value) return;

  const THREE = await import("three");
  // @ts-ignore
  const VANTA = await import("vanta/dist/vanta.cells.min");

  vantaEffect = VANTA.default({
    el: vantaRefForRecommendedGames.value,
    THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color1: 0x2a2e2e,
    color2: 0x472e47,
  });
});

onBeforeUnmount(() => {
  if (vantaEffect) vantaEffect.destroy();
});
</script>

<style scoped>
@import url("~/assets/css/main.css");

.bg-anim {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.bg-anim-sm {
  height: 75vh;
}

.bg-anim-lg {
  height: 50vh;
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  backdrop-filter: blur(0.1rem);
  -webkit-backdrop-filter: blur(0.1rem);
}

.arrow-bounce {
  display: inline-flex;
  justify-content: center;
  width: 100%;
}

.down-arrow {
  border-left: 3px solid #9e9e9e;
  border-bottom: 3px solid #9e9e9e;
  transform: rotate(-45deg);
  animation: bounce 1.4s infinite ease-in-out;
  opacity: 0.7;
}

@keyframes bounce {
  0% {
    transform: translateY(0) rotate(-45deg);
  }
  50% {
    transform: translateY(12px) rotate(-45deg);
  }
  100% {
    transform: translateY(0) rotate(-45deg);
  }
}
</style>
