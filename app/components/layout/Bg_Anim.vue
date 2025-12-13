<template>
  <div ref="vantaRef" class="bg-anim">
    <!-- Banner Content -->
    <v-row class="banner-content mx-auto w-100 w-md-75 w-lg-50 pa-2 pa-lg-5 rounded-lg"
      :class="display.xs.value ? 'banner-content-sm' : 'banner-content-lg'">
      <v-col cols="12">
        <div class="d-flex flex-column align-center align-sm-start ga-3 ga-sm-5 ga-lg-8">
          <p class="text-grey-lighten-1 text-h5 text-md-h4 text-lg-h3 text-xl-h2 font-weight-bold defautl-title-letter">
            npmrungame
          </p>
          <p class="text-center text-sm-start text-grey-lighten-1 text-subtitle-2 text-md-subtitle-1 text-lg-h5" :style="display.mdAndUp.value ? { lineHeight: '2.1rem' } : { lineHeight: '1.2rem' }
            ">
            4K oyun dünyasının nabzını tutan bir kanal. <br>
            Niş indielerden, yeni çıkan AAA oyunlara, donanım trendlerinden güncel oyun haberlerine kadar birçok içerik
            sunar. Gelişen ekosistemimizin parçası olun.
          </p>
        </div>
      </v-col>

      <v-row class="w-100 mx-auto mt-lg-5 mt-xl-10 justify-center justify-sm-start align-center"
        :dense="display.xs.value">
        <v-col cols="8" sm="5" lg="4">
          <v-btn class="default-title-letter" text="Keşfet" :size="display.lgAndUp.value
            ? 'x-large'
            : display.xs.value
              ? 'small'
              : 'default'
            " variant="elevated" rounded="xl" color="green-accent-2" @click="handleRoute('/discover')" :ripple="false"
            block>
            <template v-slot:append>
              <v-progress-circular v-if="loadingItem === '/discover'" indeterminate
                :size="display.xlAndUp.value ? 16 : 14" width="1" color="black" />
              <v-icon v-else icon="mdi-web" />
            </template>
          </v-btn>
        </v-col>

        <v-col cols="8" sm="5" lg="4">
          <v-btn class="subscription-btn default-title-letter" text="Abone Ol" :size="display.lgAndUp.value
            ? 'x-large'
            : display.smAndDown.value
              ? 'small'
              : 'default'
            " href="https://www.youtube.com/@npmrungame" target="_blank" append-icon="mdi-youtube-subscription"
            rounded="xl" :ripple="false" block />
        </v-col>

        <v-col v-if="display.xs.value" cols="8">
          <v-btn class="default-title-letter" text="Oyun Öner" :size="display.lgAndUp.value
            ? 'x-large'
            : display.xs.value
              ? 'small'
              : 'default'
            " color="deep-purple" rounded="xl" @click="handleRoute('/recommend-games')" variant="elevated"
            :ripple="false" block>
            <template v-slot:append>
              <v-progress-circular v-if="loadingItem === '/recommend-games'" indeterminate
                :size="display.xlAndUp.value ? 16 : 14" width="1" color="white" />
              <v-icon v-else icon="mdi-gamepad-up" />
            </template>
          </v-btn>
        </v-col>
      </v-row>
    </v-row>

    <!-- Action Buttons -->
    <v-row v-if="!display.xs.value" class="action-buttons mx-auto w-100 d-flex justify-center align-center">
      <v-col cols="4" lg="3">
        <v-btn class="action-btn default-title-letter" text="Oyun Öner"
          :size="display.xlAndUp.value ? 'x-large' : 'default'" @click="handleRoute('/recommend-games')" :ripple="false"
          block>
          <template v-slot:append>
            <v-progress-circular v-if="loadingItem === '/recommend-games'" indeterminate
              :size="display.xlAndUp.value ? 16 : 14" width="1" color="grey-lighten-1" />
            <v-icon v-else icon="mdi-gamepad-up" />
          </template>
        </v-btn>
      </v-col>

      <v-col cols="4" lg="3">
        <v-btn class="action-btn default-title-letter" text="Yeni Neler Var"
          :size="display.xlAndUp.value ? 'x-large' : 'default'" @click="handleRoute('/blogs')" :ripple="false" block>
          <template v-slot:append>
            <v-progress-circular v-if="loadingItem === '/blogs'" indeterminate :size="display.xlAndUp.value ? 16 : 14"
              width="1" color="grey-lighten-1" />
            <v-icon v-else icon="mdi-newspaper" />
          </template>
        </v-btn>
      </v-col>

      <v-col cols="4" lg="3">
        <v-btn class="action-btn default-title-letter" text="İletişim"
          :size="display.xlAndUp.value ? 'x-large' : 'default'" @click="handleRoute('/contact')" :ripple="false" block>
          <template v-slot:append>
            <v-progress-circular v-if="loadingItem === '/contact'" indeterminate :size="display.xlAndUp.value ? 16 : 14"
              width="1" color="grey-lighten-1" />
            <v-icon icon="mdi-phone" v-else />
          </template>
        </v-btn>
      </v-col>
    </v-row>
  </div>

  <v-responsive height="100vh" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

let vantaEffect: any = null;
const vantaRef = ref<HTMLElement | null>(null);

const router = useRouter();
const display = useDisplay();

const loadingItem = ref<string | null>(null)

const handleRoute = async (path: string) => {
  loadingItem.value = path;
  await router.replace(path);
  loadingItem.value = null;
};

onMounted(async () => {
  // @ts-ignore
  const VANTA = await import("vanta/dist/vanta.globe.min");
  const THREE = await import("three");

  vantaEffect = VANTA.default({
    el: vantaRef.value!,
    THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x546f54,
    size: 0.8,
    backgroundColor: 0x000000,
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
  height: 100vh !important;
}

.banner-content {
  z-index: 9999;
  backdrop-filter: blur(0.02rem);
  -webkit-backdrop-filter: blur(0.02rem);
}

.banner-content-lg {
  position: absolute;
  top: 45%;
  left: 5%;
  transform: translateY(-50%);
}

.banner-content-sm {
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.action-buttons {
  position: absolute;
  bottom: 2%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
}

.action-btn {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
}

.subscription-btn {
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(0.5rem);
  -webkit-backdrop-filter: blur(0.5rem);
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}
</style>