<template>
  <div ref="vantaRefContact" class="bg-anim"></div>
  <v-row class="banner-content mx-auto w-100 rounded-lg d-flex justify-center align-center"
    :class="display.smAndDown.value ? 'banner-content-sm' : 'banner-content-lg'">
    <v-col cols="12" sm="8" md="6" lg="5" xl="4">
      <v-form ref="contactForm" @submit.prevent="handleForm"
        class="form-container rounded-xl pa-2 pa-lg-5 pa-xl-10 mt-lg-8">
        <p
          class="text-grey-lighten-1 my-3 text-center text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter">
          Görüşleriniz Bizim İçin Çok Değerli
        </p>

        <v-divider class="mt-2 mb-4 mb-lg-8 w-100" color="white" />

        <v-text-field :rules="rules.name" v-model="formModels.name" label="Adınız" variant="outlined"
          prepend-inner-icon="mdi-account" rounded="lg" :density="display.lgAndDown.value ? 'compact' : 'comfortable'"
          class="text-grey-lighten-1 default-title-letter w-100" placeholder="John Doe" clearable />

        <v-text-field :rules="rules.email" v-model="formModels.email" label="Email" variant="outlined"
          prepend-inner-icon="mdi-email" rounded="lg" :density="display.lgAndDown.value ? 'compact' : 'comfortable'"
          class="text-grey-lighten-1 default-title-letter w-100" placeholder="johndoe@gmail.com" clearable />

        <v-textarea :rules="rules.msg" v-model="formModels.msg" label="Mesajınız" variant="outlined"
          prepend-inner-icon="mdi-message" rounded="lg" :density="display.lgAndDown.value ? 'compact' : 'comfortable'"
          class="text-grey-lighten-1 default-title-letter w-100"
          placeholder="Yorum, eleştiri, öneri, işbirliği ve merak ettiğiniz herşey..." counter clearable />

        <div class="w-100 d-flex align-center justify-center justify-sm-end">
          <v-btn type="submit" text="Gönder" :elevation="0" :loading="isLoadingFormSubmit" variant="elevated"
            class="mt-1" rounded="xl" color="blue-lighten-1" :size="display.smAndDown.value ? 'small' : 'default'"
            append-icon="mdi-send" :ripple="false" :block="display.smAndDown.value" />
        </div>
      </v-form>
    </v-col>
  </v-row>

  <v-dialog v-model="feedback.show" :max-width="600" style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    ">
    <div class="feedback-container d-flex flex-column align-center justify-center ga-1 ga-lg-2 rounded-lg pa-2 pa-5">
      <v-btn @click="feedback.show = false" variant="text" size="small" :ripple="false" icon="mdi-close"
        class="close-icon-in-feedback-container ma-1 ma-lg-2" color="grey-lighten-1" />
      <img :src="feedback.type == 'success' ? successfullyDoneImg : warningImg"
        :width="display.smAndDown.value ? 50 : 75" />
      <p class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 default-title-letter text-grey-lighten-2">
        {{ `Sevgili ${feedback.display_name},` }}
      </p>
      <p class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1">
        {{ feedback.message }}
      </p>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { VForm } from "vuetify/components";
import { type FeedbackMessageOnContact } from "~/composables/core/interfaces";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import warningImg from "~/assets/img/warning_anim.gif"

const { $firestore } = useNuxtApp();

const display = useDisplay();
const router = useRouter();

const vantaRefContact = ref<HTMLElement | null>(null);
const contactForm = ref<InstanceType<typeof VForm> | null>(null);
const contactFormNameRef = ref<InstanceType<typeof VForm> | null>(null);

let vantaEffect: any = null;

const isLoadingFormSubmit = ref(false);

const formModels = ref({
  name: "",
  email: "",
  msg: "",
});

const rules = ref({
  name: [
    (v: string) => !!v || "Adınız Gerekli",
    (v: string) => (v && v.length >= 3) || "Adnınız en az 3 karakter olmalı",
  ],
  email: [
    (v: string) => !!v || "Email Gerekli!",
    (v: string) =>
      (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Geçerli mail adresi giriniz",
  ],
  msg: [
    (v: string) => !!v || "Mesajınız Gerekli",
    (v: string) => (v && v.length >= 10) || "Mesajınız en az 10 karakter olmalı",
  ],
});

const feedback = ref<FeedbackMessageOnContact>({
  show: false,
  display_name: "",
  type: "success",
  message: "",
});

const showFeedbackMessage = (name: string, type: "success" | "error", message: string, duration: number) => {
  feedback.value.type = type;
  feedback.value.display_name = name;
  feedback.value.message = message;
  feedback.value.show = true;

  setTimeout(() => {
    feedback.value.show = false;
  }, duration);
};

const sendToDb = async () => {
  try {
    const messagesCollection = collection($firestore, "messages");

    // 2️⃣ Add To Firebase
    await addDoc(messagesCollection, {
      name: formModels.value?.name,
      email: formModels.value?.email,
      message: formModels.value?.msg,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error("Error while send to db  :", error.message);
  }
};

const handleForm = async () => {
  const result = await contactForm.value?.validate();

  if (!result || !result.valid) return;

  try {
    isLoadingFormSubmit.value = true;
    await sendToDb();
    await $fetch("/api/contact", {
      method: "POST",
      body: {
        name: formModels.value?.name,
        email: formModels.value?.email,
        msg: formModels.value?.msg,
      },
    });

    showFeedbackMessage(
      formModels.value?.name,
      "success",
      "Mesajın başarıyla iletildi. En kısa sürede dönüş yapacağız 🙌",
      3500
    );

    contactForm.value?.reset();
  } catch (error: any) {
    showFeedbackMessage(
      formModels.value?.name,
      "error",
      "Bir hata oluştu. Lütfen biraz sonra tekrar dene.",
      3500
    );
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
@import "~/assets/css/contact.css";
</style>
