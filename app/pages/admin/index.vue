<template>
  <template v-if="_store.isAdmin">
    <!-- List Bar -->
    <v-navigation-drawer
      class="admin-nav-drawer"
      :rail="isRail"
      :permanent="!isSmallScreen"
    >
      <v-btn
        class="rail-btn text-caption text-lg-subtitle-2 default-title-letter pa-1 rounded ma-1"
        @click="isRail = !isRail"
        :icon="isRail ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
        :ripple="false"
        size="sm"
      />
      <template v-slot:prepend>
        <v-list
          class="bg-transparent mt-10"
          :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
        >
          <v-list-item
            v-for="(item, index) in adminListItems"
            :key="index"
            @click="_store.setActiveAdminListItem(item.slug as any)"
            :ripple="false"
            class="rounded-xl"
            :class="
              _store.active_admin_list_item === item.slug ? 'active-admin-list-item' : ''
            "
          >
            <!-- ICON + BADGE -->
            <template #prepend>
              <v-badge
                v-if="item.slug === 'notifications' && unreadNotificationCount > 0"
                location="top right"
                color="error"
                :content="unreadNotificationCount > 99 ? '99+' : unreadNotificationCount"
              >
                <v-icon :icon="item.icon" />
              </v-badge>

              <!-- Normal icon (badge yokken) -->
              <v-icon v-else :icon="item.icon" />
            </template>

            <!-- TITLE -->
            <v-list-item-title
              class="default-title-letter text-caption text-lg-subtitle-2"
            >
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </template>

      <template v-slot:append>
        <v-list
          bg-color="transparent"
          class="mb-1"
          :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
        >
          <v-list-item
            @click="_store.setActiveAdminListItem('settings' as any)"
            prepend-icon="mdi-cog"
            rounded="xl"
            :ripple="false"
            class="default-title-letter text-caption text-lg-subtitle-2"
            active-class="main-nav-active"
          >
            <v-list-item-title
              class="default-title-letter text-caption text-lg-subtitle-2"
            >
              Ayarlar
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            :to="'/'"
            prepend-icon="mdi-home-outline"
            rounded="xl"
            :ripple="false"
            class="default-title-letter text-caption text-lg-subtitle-2"
            active-class="main-nav-active"
          >
            <v-list-item-title
              class="default-title-letter text-caption text-lg-subtitle-2"
            >
              Anasayfaya Dön
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            @click="handleLogout"
            prepend-icon="mdi-logout"
            rounded="xl"
            :ripple="false"
            class="default-title-letter text-caption text-lg-subtitle-2"
          >
            <v-list-item-title
              class="default-title-letter text-caption text-lg-subtitle-2"
            >
              Çıkış Yap
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-container class="pt-5 pt-lg-10 pt-xl-15">
      <!-- Responsive Bar -->
      <transition name="slide-down">
        <div v-if="isSmallScreen" class="d-flex justiy-end align-center w-100">
          <v-btn
            v-if="!isOpenResponsiveBar"
            @click="isOpenResponsiveBar = !isOpenResponsiveBar"
            :ripple="false"
            prepend-icon="mdi-arrow-down-thick"
            text="Menu"
            class="admin-responsive-menu-btn"
            :elevation="0"
            :block="isSmallScreen"
            :size="isSmallScreen ? 'large' : 'x-large'"
          />

          <div class="responsive-admin-list-bar pa-2" v-if="isOpenResponsiveBar">
            <v-btn
              class="close-btn-in-responsive-admin-list-bar ma-2"
              icon="mdi-close"
              color="grey-darken-1"
              size="large"
              variant="text"
              :ripple="false"
              @click="isOpenResponsiveBar = false"
            />
            <div class="d-flex flex-column ga-1 mt-10">
              <div
                class="responsive-admin-bar-list-item transition d-flex align-center ga-3 pa-2 rounded-lg cursor-pointer"
                v-for="(item, index) of adminListItems"
                :key="item.title"
                @click="handleRouteForResponsive(item.slug as any)"
              >
                <!-- ICON + BADGE -->
                <v-badge
                  v-if="item.slug === 'notifications' && unreadNotificationCount > 0"
                  location="top right"
                  color="error"
                  :content="
                    unreadNotificationCount > 99 ? '99+' : unreadNotificationCount
                  "
                >
                  <v-icon size="large" :icon="item.icon" />
                </v-badge>

                <!-- ICON (badge yoksa) -->
                <v-icon v-else size="large" :icon="item.icon" />

                <!-- TITLE -->
                <p
                  class="text-subtitle-1 text-sm-h5 default-title-letter text-grey-darken-1"
                >
                  {{ item.title }}
                </p>
              </div>
            </div>

            <v-row
              class="action-buttons-in-responsive-admin-list-bar w-100 mx-auto pa-1 pa-xs-2"
              dense
            >
              <v-col cols="6">
                <v-btn
                  prepend-icon="mdi-home-outline"
                  text="Anasayfaya Dön"
                  :ripple="false"
                  class="text-caption text-sm-subtitle-2 defaul-title-letter"
                  :size="display.xs.value ? 'small' : 'default'"
                  variant="outlined"
                  block
                  @click="router.push('/')"
                />
              </v-col>

              <v-col cols="6">
                <v-btn
                  :size="display.xs.value ? 'small' : 'default'"
                  variant="outlined"
                  class="text-caption text-sm-subtitle-2 defaul-title-letter"
                  prepend-icon="mdi-logout"
                  text="Çıkış Yap"
                  :ripple="false"
                  block
                  @click="handleRouteForResponsive('logout')"
                />
              </v-col>
            </v-row>
          </div>
        </div>
      </transition>

      <!-- Content -->
      <Dashboard v-if="_store.active_admin_list_item == 'dashboard'" />
      <Notificiations v-if="_store.active_admin_list_item == 'notifications'" />
      <Completed_Games v-if="_store.active_admin_list_item == 'completed_games'" />
      <Blogs v-if="_store.active_admin_list_item == 'blog'" />
      <To_Play_Games v-if="_store.active_admin_list_item == 'to_play_games'" />
      <Current_Games v-if="_store.active_admin_list_item == 'current_games'" />
      <Registered_Users_Messages v-if="_store.active_admin_list_item == 'messages'" />
      <Recommended_Games v-if="_store.active_admin_list_item == 'recommended_games'" />
      <Settings v-if="_store.active_admin_list_item == 'settings'" />
    </v-container>
  </template>

  <!-- Authentication Form -->
  <template v-else>
    <v-img
      class="admin-bg-img-cover"
      cover
      :src="
        display.smAndDown.value
          ? 'https://gbfhkvefbnlgkqaqqwxp.supabase.co/storage/v1/object/public/admin_bg_npmrungame/security_img_small.jpg'
          : 'https://gbfhkvefbnlgkqaqqwxp.supabase.co/storage/v1/object/public/admin_bg_npmrungame/security_img_large.jpg'
      "
    />
    <v-form
      class="admin-form rounded-lg pa-2 pa-lg-5 mx-auto"
      ref="adminForm"
      @submit.prevent="handleAdminAuth"
    >
      <v-tooltip text="Ana sayfaya dön" location="top">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="back-to-home-btn ma-1 ma-lg-2 text-caption text-lg-subtitle-2 pa-1"
            @click="router.push('/')"
            size="xs"
            icon="mdi-arrow-left"
            variant="text"
            color="grey-lighten-1"
            :ripple="false"
          />
        </template>
      </v-tooltip>

      <div class="d-flex align-center justify-center ga-2 ga-lg-4 mt-5 mb-5 mb-lg-10">
        <v-icon
          icon="mdi-security"
          color="grey-lighten-1"
          :size="isSmallScreen ? 'small' : 'large'"
        />

        <p
          class="default-title-letter text-grey-lighten-1 text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-center"
        >
          Admin Girişi
        </p>
      </div>

      <v-text-field
        ref="adminFormEmailRef"
        v-model="adminModels.email"
        :rules="rules.email"
        type="email"
        variant="outlined"
        rounded="xl"
        label="Email"
        prepend-inner-icon="mdi-email"
        clearable
        :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
      />

      <v-text-field
        v-model="adminModels.password"
        :rules="rules.password"
        :type="showPassword ? 'text' : 'password'"
        rounded="xl"
        prepend-inner-icon="mdi-lock"
        variant="outlined"
        :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
        label="Şifre"
      >
        <template v-slot:append-inner>
          <v-icon
            :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click="togglePasswordVisibility"
          />
        </template>
      </v-text-field>

      <transition name="slide-up">
        <v-alert
          v-if="isVisibleAlertAfterLogin"
          variant="tonal"
          class="default-title-letter mb-1 text-caption text-lg-subtitle-2"
          :icon="colorAfterLogin == 'success' ? 'mdi-check' : 'mdi-close'"
          density="compact"
          :text="msgAfterLogin!"
          :color="colorAfterLogin!"
        />
      </transition>

      <v-checkbox
        @click="adminModels.isSelectedRememberMe = !adminModels.isSelectedRememberMe"
        v-model="adminModels.isSelectedRememberMe"
        density="compact"
        :ripple="false"
        class="text-caption text-lg-subtitle-2"
        color="green-accent-2"
      >
        <template #label>
          <div class="d-flex align-center ga-1 ga-lg-2">
            <span class="text-caption text-lg-subtitle-2 default-title-letter"
              >Beni Hatırla</span
            >

            <v-tooltip text="Başarılı Girişte Bilgileri Hatırla" location="top">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  :size="display.smAndDown.value ? 16 : 22"
                  color="grey"
                  class="cursor-pointer"
                  icon="mdi-help-circle-outline"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-checkbox>

      <v-btn
        text="Giriş"
        :loading="isLoadingLogin"
        class="text-subtitle-2 text-lg-subtitle-1 text-capitalize rounded-xl"
        prepend-icon="mdi-check"
        color="primary"
        block
        :size="display.smAndDown.value ? 'small' : 'default'"
        variant="elevated"
        :elevation="0"
        :ripple="false"
        type="submit"
      />
    </v-form>
  </template>
</template>

<script lang="ts" setup>
import store from "~/store/store";
import { signInWithEmailAndPassword } from "firebase/auth";
import { VForm } from "vuetify/components";
import type { Admin_User, AdminListItemSlug } from "~/composables/core/interfaces";
import Dashboard from "~/components/admin/Dashboard.vue";
import Completed_Games from "~/components/admin/Completed_Games.vue";
import Blogs from "~/components/admin/Blogs.vue";
import To_Play_Games from "~/components/admin/To_Play_Games.vue";
import Current_Games from "~/components/admin/Current_Games.vue";
import Registered_Users_Messages from "~/components/admin/Registered_Users_Messages.vue";
import Recommended_Games from "~/components/admin/Recommended_Games.vue";
import Notificiations from "~/components/admin/Notificiations.vue";
import Settings from "~/components/admin/Settings.vue";
import { collection, getDocs } from "firebase/firestore";
import { useNotificationsStore } from "~/store/notifications";

definePageMeta({
  layout: "admin",
});

useHead({
  title: "npmrungame | Admin",
});

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.lgAndUp.value);
const isRail = ref(false);

const { $auth } = useNuxtApp();

const adminForm = ref<InstanceType<typeof VForm> | null>(null);
const adminFormEmailRef = ref<InstanceType<typeof VForm> | null>(null);

const showPassword = ref(false);
const isLoadingLogin = ref(false);
const isOpenResponsiveBar = ref(false);

const notificationStore = useNotificationsStore();

const unreadNotificationCount = computed(() => notificationStore.unreadCount);

const adminModels = ref({
  email: "",
  password: "",
  isSelectedRememberMe: false,
});

const rules = ref({
  email: [
    (v: string) => !!v || "Email Gerekli!",
    (v: string) =>
      (v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || "Geçerli mail adresi giriniz",
  ],
  password: [
    (v: string) => !!v || "Şifre Gerekli",
    (v: string) => (v && v.length >= 3) || "Şifre en az 3 karakter olmalı!",
  ],
});

const isVisibleAlertAfterLogin = ref(false);
const msgAfterLogin = ref<string | null>(null);
const colorAfterLogin = ref<"error" | "success" | null>(null);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogout = () => {
  _store.logOut();
  setTimeout(() => {
    router.push("/");
  }, 150);
};

const handleRouteForResponsive = (slug: AdminListItemSlug) => {
  if (slug !== "home" && slug !== "logout" && slug !== "settings") {
    _store.setActiveAdminListItem(slug as any);
    isOpenResponsiveBar.value = false;
  } else if (slug == "home") {
    router.push("/");
    isOpenResponsiveBar.value = false;
    _store.setActiveAdminListItem("dashboard" as any);
  } else {
    handleLogout();
    isOpenResponsiveBar.value = false;
    _store.setActiveAdminListItem("dashboard" as any);
  }
};

const handleAdminAuth = async () => {
  const result = await adminForm.value?.validate();
  if (!result?.valid) return;

  try {
    isLoadingLogin.value = true;

    const userCredential = await signInWithEmailAndPassword(
      $auth,
      adminModels.value.email,
      adminModels.value.password
    );

    const user = userCredential.user;

    if (user && adminModels.value.isSelectedRememberMe) {
      _store.setAnySuccessfullLogin();
    }

    msgAfterLogin.value = "Giriş Başarılı";
    colorAfterLogin.value = "success";
    isVisibleAlertAfterLogin.value = true;

    adminForm.value?.reset();

    setTimeout(() => {
      _store.login();
      isVisibleAlertAfterLogin.value = false;
    }, 1500);

    _store.setAdminUserInfo(user.metadata as Admin_User);
  } catch (err) {
    isVisibleAlertAfterLogin.value = false;

    msgAfterLogin.value = "Email ya da parola yanlış!";
    colorAfterLogin.value = "error";
    isVisibleAlertAfterLogin.value = true;

    setTimeout(() => {
      isVisibleAlertAfterLogin.value = false;
    }, 3000);
  } finally {
    isLoadingLogin.value = false;
  }
};

watch(
  () => adminModels.value.isSelectedRememberMe,
  async (val) => {
    if (_store.hasAnySuccessfulLogin) {
      if (val) {
        const data = await $fetch("/api/admin/admin-credential");
        adminModels.value.email = data.email;
        adminModels.value.password = data.password;
      } else {
        adminForm.value?.reset();
      }
    }
  }
);

onMounted(() => {
  if (!_store.isAdmin) {
    adminFormEmailRef.value?.focus();
  }
});
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>
