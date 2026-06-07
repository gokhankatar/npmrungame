<template>
  <div class="contact-page">
    <div class="contact-page-glow contact-page-glow--left" aria-hidden="true" />
    <div class="contact-page-glow contact-page-glow--right" aria-hidden="true" />

    <v-responsive :height="display.smAndDown.value ? 70 : 100" />

    <v-container class="contact-container pa-3 pa-md-6 pa-lg-8">
      <header class="contact-hero">
        <div class="contact-hero-badge default-title-letter">
          <v-icon icon="mdi-email-fast-outline" size="16" color="#69f0ae" />
          <span>İletişim</span>
        </div>
        <h1 class="contact-hero-title default-title-letter">Bize Ulaş</h1>
        <p class="contact-hero-sub default-title-letter">
          Yorum, öneri, işbirliği veya sadece merhaba demek için formu doldur —
          en kısa sürede dönüş yaparım.
        </p>
      </header>

      <div class="contact-layout">
        <aside class="contact-info">
          <div class="contact-info-card">
            <h2 class="contact-info-title default-title-letter">Nasıl ulaşabilirsin?</h2>
            <p class="contact-info-desc default-title-letter">
              Formu doldurman en hızlı yol. Alternatif olarak sosyal medya
              hesaplarından da yazabilirsin.
            </p>

            <div class="contact-info-list">
              <div class="contact-info-item">
                <div class="contact-info-item-icon">
                  <v-icon icon="mdi-clock-outline" size="18" color="#69f0ae" />
                </div>
                <div>
                  <p class="contact-info-item-label default-title-letter">Yanıt süresi</p>
                  <p class="contact-info-item-value default-title-letter">
                    Genelde 24–48 saat içinde
                  </p>
                </div>
              </div>

              <div class="contact-info-item">
                <div class="contact-info-item-icon">
                  <v-icon icon="mdi-handshake-outline" size="18" color="#69f0ae" />
                </div>
                <div>
                  <p class="contact-info-item-label default-title-letter">İşbirliği</p>
                  <p class="contact-info-item-value default-title-letter">
                    Sponsorluk, PR ve oyun incelemeleri
                  </p>
                </div>
              </div>

              <div class="contact-info-item">
                <div class="contact-info-item-icon">
                  <v-icon icon="mdi-gamepad-variant-outline" size="18" color="#69f0ae" />
                </div>
                <div>
                  <p class="contact-info-item-label default-title-letter">Oyun önerisi</p>
                  <p class="contact-info-item-value default-title-letter">
                    Radar listeme eklemek için de yazabilirsin
                  </p>
                </div>
              </div>
            </div>

            <div class="contact-social-section">
              <p class="contact-info-item-label default-title-letter">Sosyal medya</p>
              <div class="contact-social-row">
                <v-btn
                  v-for="link in socialLinks"
                  :key="link.title"
                  :href="link.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="tonal"
                  color="green-accent-2"
                  rounded="lg"
                  size="small"
                  class="contact-social-btn default-title-letter"
                  :prepend-icon="link.icon"
                  :text="link.title"
                  :ripple="false"
                />
              </div>
            </div>
          </div>
        </aside>

        <div class="contact-form-card">
          <h2 class="contact-form-heading default-title-letter">Mesaj gönder</h2>
          <p class="contact-form-sub default-title-letter">
            Tüm alanları doldur; mesajın doğrudan bana ulaşsın.
          </p>

          <v-form ref="contactForm" @submit.prevent="handleForm">
            <div class="contact-form-fields">
              <v-text-field
                v-model="formModels.name"
                :rules="rules.name"
                label="Adın"
                variant="solo-filled"
                flat
                prepend-inner-icon="mdi-account-outline"
                rounded="lg"
                :density="display.lgAndDown.value ? 'compact' : 'comfortable'"
                bg-color="rgba(255, 255, 255, 0.06)"
                color="green-accent-2"
                class="contact-field default-title-letter"
                placeholder="Adını ve soyadını yaz"
                clearable
                hide-details="auto"
              />

              <v-text-field
                v-model="formModels.email"
                :rules="rules.email"
                label="E-posta"
                type="email"
                variant="solo-filled"
                flat
                prepend-inner-icon="mdi-email-outline"
                rounded="lg"
                :density="display.lgAndDown.value ? 'compact' : 'comfortable'"
                bg-color="rgba(255, 255, 255, 0.06)"
                color="green-accent-2"
                class="contact-field default-title-letter"
                placeholder="ornek@email.com"
                clearable
                hide-details="auto"
              />

              <v-textarea
                v-model="formModels.msg"
                :rules="rules.msg"
                label="Mesajın"
                variant="solo-filled"
                flat
                prepend-inner-icon="mdi-message-text-outline"
                rounded="lg"
                :density="display.lgAndDown.value ? 'compact' : 'comfortable'"
                bg-color="rgba(255, 255, 255, 0.06)"
                color="green-accent-2"
                class="contact-field default-title-letter"
                placeholder="Ne söylemek istediğini buraya yaz..."
                rows="4"
                counter
                maxlength="500"
                clearable
                hide-details="auto"
                no-resize
              />
            </div>

            <div class="contact-form-actions">
              <v-btn
                type="submit"
                text="Gönder"
                :loading="isLoadingFormSubmit"
                variant="elevated"
                color="green-accent-2"
                rounded="lg"
                size="large"
                class="contact-submit-btn text-black default-title-letter"
                append-icon="mdi-send"
                :ripple="false"
                :block="display.smAndDown.value"
              />
            </div>
          </v-form>
        </div>
      </div>
    </v-container>

    <v-dialog
      v-model="feedback.show"
      :max-width="480"
      class="contact-feedback-dialog"
    >
      <div
        class="contact-feedback-card"
        :class="{
          'contact-feedback-card--success': feedback.type === 'success',
          'contact-feedback-card--error': feedback.type === 'error',
        }"
      >
        <v-btn
          variant="text"
          size="small"
          :ripple="false"
          icon="mdi-close"
          class="contact-feedback-close"
          color="grey-lighten-1"
          @click="feedback.show = false"
        />
        <img
          :src="feedback.type === 'success' ? successfullyDoneImg : warningImg"
          :width="display.smAndDown.value ? 56 : 72"
          class="contact-feedback-img"
          alt=""
        />
        <p class="contact-feedback-name default-title-letter">
          {{ `Sevgili ${feedback.display_name},` }}
        </p>
        <p class="contact-feedback-message default-title-letter">
          {{ feedback.message }}
        </p>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { VForm } from "vuetify/components";
import { type FeedbackMessageOnContact } from "~/composables/core/interfaces";
import { footer_social_links } from "~/utils/Footer_Links";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import warningImg from "~/assets/img/warning_anim.gif";

const { $firestore } = useNuxtApp();

const display = useDisplay();

const contactForm = ref<InstanceType<typeof VForm> | null>(null);

const socialLinks = footer_social_links;

const isLoadingFormSubmit = ref(false);

const formModels = ref({
  name: "",
  email: "",
  msg: "",
});

const rules = ref({
  name: [
    (v: string) => !!v || "Adın gerekli",
    (v: string) => (v && v.length >= 3) || "Adın en az 3 karakter olmalı",
  ],
  email: [
    (v: string) => !!v || "E-posta gerekli",
    (v: string) =>
      (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Geçerli bir e-posta gir",
  ],
  msg: [
    (v: string) => !!v || "Mesaj gerekli",
    (v: string) => (v && v.length >= 10) || "Mesaj en az 10 karakter olmalı",
  ],
});

const feedback = ref<FeedbackMessageOnContact>({
  show: false,
  display_name: "",
  type: "success",
  message: "",
});

const showFeedbackMessage = (
  name: string,
  type: "success" | "error",
  message: string,
  duration: number
) => {
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
      "Mesajın başarıyla iletildi. En kısa sürede dönüş yapacağım 🙌",
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
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/contact.css";
</style>
