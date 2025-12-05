<template>
  <div ref="vantaRefContact" class="bg-anim"></div>
  <v-row
    class="banner-content mx-auto w-100 rounded-lg d-flex justify-center align-center"
    :class="display.smAndDown.value ? 'banner-content-sm' : 'banner-content-lg'"
  >
    <v-col cols="12" sm="10" md="8" lg="6" xl="4">
      <v-form
        ref="contactForm"
        @submit.prevent="handleForm"
        class="form-container rounded-xl pa-2 pa-lg-5 pa-xl-10"
      >
        <p
          class="my-3 text-center text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter"
        >
          Görüşleriniz Bizim İçin Çok Değerli
        </p>

        <v-divider class="mt-2 mb-4 mb-lg-8 w-100" color="white" />

        <v-text-field
          v-model="formModels.name"
          label="Adınız"
          variant="outlined"
          prepend-inner-icon="mdi-account"
          rounded="lg"
          :density="display.smAndDown.value ? 'compact' : 'comfortable'"
          class="text-grey-lighten-1 default-title-letter w-100"
          placeholder="John Doe"
          clearable
        />

        <v-text-field
          v-model="formModels.email"
          label="Email"
          variant="outlined"
          prepend-inner-icon="mdi-email"
          rounded="lg"
          :density="display.smAndDown.value ? 'compact' : 'comfortable'"
          class="text-grey-lighten-1 default-title-letter w-100"
          placeholder="johndoe@gmail.com"
          clearable
        />

        <v-textarea
          v-model="formModels.email"
          label="Mesajınız"
          variant="outlined"
          prepend-inner-icon="mdi-message"
          rounded="lg"
          :density="display.smAndDown.value ? 'compact' : 'comfortable'"
          class="text-grey-lighten-1 default-title-letter w-100"
          placeholder="Yorum, eleştiri, öneri, işbirliği ve merak ettiğiniz herşey..."
          counter
          clearable
        />

        <div class="w-100 d-flex align-center justify-center justify-lg-end">
          <v-btn
            type="submit"
            text="Gönder"
            :elevation="0"
            variant="tonal"
            color="blue-lighten-1"
            :size="display.smAndDown.value ? 'small' : 'large'"
            append-icon="mdi-send"
            :ripple="false"
          />
        </div>
      </v-form>
    </v-col>
  </v-row>

</template>

<script setup lang="ts">
import { VForm } from "vuetify/components";

let vantaEffect: any = null;
const vantaRefContact = ref<HTMLElement | null>(null);

const display = useDisplay();
const router = useRouter();

const contactForm = ref<InstanceType<typeof VForm> | null>(null);
const contactFormNameRef = ref<InstanceType<typeof VForm> | null>(null);

const isLoadingFormSubmit = ref(false);

const formModels = ref({
  name: "",
  email: "",
  msg: "",
});

const handleForm = async () => {
  const result = await contactForm.value?.validate();

  if (!result || !result.valid) return;

  try {
    isLoadingFormSubmit.value = true;

    contactForm.value?.reset();
  } catch (error: any) {
    console.error(error.message);
  } finally {
    isLoadingFormSubmit.value = false;
  }
};

onMounted(async () => {
  // @ts-ignore
  const VANTA = await import("vanta/dist/vanta.fog.min");
  const THREE = await import("three");

  vantaEffect = VANTA.default({
    el: vantaRefContact.value!,
    THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    highlightColor: 0x6586b3,
    midtoneColor: 0x817373,
    lowlightColor: 0x383838,
    backgroundColor: 0x111111,
    baseColor: 0x111111,
    blurFactor: 0.5,
    speed: 1.0,
  });

  contactFormNameRef.value?.focus();
});

onBeforeUnmount(() => {
  if (vantaEffect && typeof vantaEffect.destroy === "function") {
    vantaEffect.destroy();
    vantaEffect = null;
  }
});
</script>

<style scoped>
@import "~/assets/css/main.css";

.bg-anim {
  pointer-events: none !important;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh !important;
  z-index: 0;
  margin: 0;
  padding: 0;
}

.banner-content {
  position: absolute;
  z-index: 99999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(0.1rem);
  -webkit-backdrop-filter: blur(0.1rem);
}

.form-container {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(0.1rem);
  -webkit-backdrop-filter: blur(0.1rem);
}
</style>
