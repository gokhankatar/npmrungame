<template>
  <v-navigation-drawer
    v-if="!isCompactNav"
    v-model="navDrawer"
    app
    class="admin-sidebar"
    :class="{ 'admin-sidebar--rail': isRail }"
    :rail="isRail"
    :width="260"
    permanent
  >
    <div class="admin-sidebar__inner">
      <header class="admin-sidebar__header">
        <v-btn
          class="admin-sidebar__rail-btn"
          :icon="isRail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          variant="text"
          size="x-small"
          :ripple="false"
          aria-label="Menüyü daralt"
          @click="isRail = !isRail"
        />

        <button
          type="button"
          class="admin-sidebar__brand"
          :class="{ 'admin-sidebar__brand--rail': isRail }"
          @click="goToDashboard"
        >
          <v-avatar
            :image="adminLogoImg"
            :size="isRail ? 36 : 40"
            rounded="lg"
            class="admin-sidebar__brand-avatar"
          />
          <div v-if="!isRail" class="admin-sidebar__brand-text">
            <span class="admin-sidebar__brand-title default-title-letter">npmrungame</span>
            <span class="admin-sidebar__brand-sub">Admin paneli</span>
          </div>
        </button>
      </header>

      <nav class="admin-sidebar__nav" aria-label="Admin menü">
        <template v-for="(section, sectionIndex) in adminNavSections" :key="section.id">
          <v-divider
            v-if="sectionIndex > 0 && !isRail"
            class="admin-sidebar__divider"
          />

          <p
            v-if="section.title && !isRail"
            class="admin-sidebar__section-title default-title-letter"
          >
            {{ section.title }}
          </p>

          <v-list
            nav
            density="compact"
            class="admin-sidebar__list bg-transparent"
            :class="{ 'admin-sidebar__list--rail': isRail }"
          >
            <v-tooltip
              v-for="item in section.items"
              :key="item.slug"
              :text="item.title"
              location="end"
              :disabled="!isRail"
            >
              <template #activator="{ props: tipProps }">
                <v-list-item
                  v-bind="tipProps"
                  :ripple="false"
                  rounded="pill"
                  class="admin-sidebar__item default-title-letter"
                  :class="{
                    'admin-sidebar__item--active':
                      _store.active_admin_list_item === item.slug,
                    'admin-sidebar__item--rail': isRail,
                  }"
                  @click="selectSection(item.slug)"
                >
                  <template #prepend>
                    <span class="admin-sidebar__icon-wrap">
                      <v-badge
                        v-if="
                          item.slug === 'notifications' && unreadNotificationCount > 0
                        "
                        location="top end"
                        color="error"
                        :content="
                          unreadNotificationCount > 99 ? '99+' : unreadNotificationCount
                        "
                      >
                        <v-icon :icon="item.icon" size="22" />
                      </v-badge>
                      <v-icon v-else :icon="item.icon" size="22" />
                    </span>
                  </template>
                  <v-list-item-title v-if="!isRail" class="admin-sidebar__item-title">
                    {{ item.title }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-tooltip>
          </v-list>
        </template>
      </nav>

      <footer class="admin-sidebar__footer">
        <v-divider v-if="!isRail" class="admin-sidebar__divider" />

        <p v-if="!isRail" class="admin-sidebar__section-title default-title-letter">
          Diğer
        </p>

        <v-list
          nav
          density="compact"
          class="admin-sidebar__list admin-sidebar__list--footer bg-transparent"
          :class="{ 'admin-sidebar__list--rail': isRail }"
        >
          <v-tooltip
            v-for="item in adminNavFooterItems"
            :key="item.slug"
            :text="item.title"
            location="end"
            :disabled="!isRail"
          >
            <template #activator="{ props: tipProps }">
              <v-list-item
                v-bind="tipProps"
                :ripple="false"
                rounded="pill"
                class="admin-sidebar__item default-title-letter"
                :class="{
                  'admin-sidebar__item--active':
                    _store.active_admin_list_item === item.slug,
                  'admin-sidebar__item--rail': isRail,
                }"
                @click="selectSection(item.slug)"
              >
                <template #prepend>
                  <span class="admin-sidebar__icon-wrap">
                    <v-icon :icon="item.icon" size="22" />
                  </span>
                </template>
                <v-list-item-title v-if="!isRail" class="admin-sidebar__item-title">
                  {{ item.title }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-tooltip>

          <v-tooltip text="Anasayfaya dön" location="end" :disabled="!isRail">
            <template #activator="{ props: tipProps }">
              <v-list-item
                v-bind="tipProps"
                :to="'/'"
                :ripple="false"
                rounded="pill"
                class="admin-sidebar__item default-title-letter"
                :class="{ 'admin-sidebar__item--rail': isRail }"
              >
                <template #prepend>
                  <span class="admin-sidebar__icon-wrap">
                    <v-icon icon="mdi-home-outline" size="22" />
                  </span>
                </template>
                <v-list-item-title v-if="!isRail" class="admin-sidebar__item-title">
                  Anasayfaya dön
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-tooltip>

          <v-tooltip text="Çıkış yap" location="end" :disabled="!isRail">
            <template #activator="{ props: tipProps }">
              <v-list-item
                v-bind="tipProps"
                :ripple="false"
                rounded="pill"
                class="admin-sidebar__item admin-sidebar__item--logout default-title-letter"
                :class="{ 'admin-sidebar__item--rail': isRail }"
                @click="handleLogout"
              >
                <template #prepend>
                  <span class="admin-sidebar__icon-wrap">
                    <v-icon icon="mdi-logout" size="22" />
                  </span>
                </template>
                <v-list-item-title v-if="!isRail" class="admin-sidebar__item-title">
                  Çıkış yap
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-tooltip>
        </v-list>
      </footer>
    </div>
  </v-navigation-drawer>

  <nav v-if="isCompactNav" class="admin-nav-horizontal" aria-label="Admin menü">
    <button
      type="button"
      class="admin-nav-horizontal-brand"
      aria-label="Panel özeti"
      @click="goToDashboard"
    >
      <v-avatar :image="adminLogoImg" size="34" rounded="lg" />
    </button>

    <div class="admin-nav-horizontal-scroll">
      <button
        v-for="item in adminListItems"
        :key="item.slug"
        type="button"
        class="admin-nav-horizontal-item default-title-letter"
        :class="{
          'admin-nav-horizontal-item--active': _store.active_admin_list_item === item.slug,
        }"
        @click="selectSection(item.slug)"
      >
        <v-badge
          v-if="item.slug === 'notifications' && unreadNotificationCount > 0"
          location="top end"
          color="error"
          :content="unreadNotificationCount > 99 ? '99+' : unreadNotificationCount"
        >
          <v-icon :icon="item.icon" size="20" />
        </v-badge>
        <v-icon v-else :icon="item.icon" size="20" />
        <span class="admin-nav-horizontal-label">{{ item.title }}</span>
      </button>
    </div>

    <div class="admin-nav-horizontal-actions">
      <v-btn
        icon="mdi-cog-outline"
        variant="text"
        size="small"
        :ripple="false"
        :color="_store.active_admin_list_item === 'settings' ? '#69f0ae' : undefined"
        @click="selectSection('settings')"
      />
      <v-btn icon="mdi-home-outline" variant="text" size="small" :ripple="false" to="/" />
      <v-btn
        icon="mdi-logout"
        variant="text"
        size="small"
        color="error"
        :ripple="false"
        @click="handleLogout"
      />
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { signOut } from "firebase/auth";
import store from "~/store/store";
import type { AdminListItemSlug } from "~/composables/core/interfaces";
import { useNotificationsStore } from "~/store/notifications";
import {
  adminListItems,
  adminNavFooterItems,
  adminNavSections,
} from "~/utils/Admin";
import adminLogoImg from "~/assets/img/logo_fixed.webp";

const _store = store();
const router = useRouter();
const { $auth } = useNuxtApp();
const display = useDisplay();

const isCompactNav = computed(() => display.smAndDown.value);
const isRail = ref(false);
const navDrawer = ref(true);

const notificationStore = useNotificationsStore();
const unreadNotificationCount = computed(() => notificationStore.unreadCount);

const goToDashboard = () => {
  _store.setActiveAdminListItem("dashboard" as any);
};

const selectSection = (slug: AdminListItemSlug) => {
  _store.setActiveAdminListItem(slug as any);
};

const handleLogout = async () => {
  _store.logOut();

  try {
    await signOut($auth);
  } catch {
    // Oturum zaten kapalı olabilir
  }

  setTimeout(() => {
    router.push("/");
  }, 150);
};

const { $firestore } = useNuxtApp();

onMounted(() => {
  notificationStore.fetchNotifications($firestore);
});
</script>

<style scoped>
@import "~/assets/css/admin_sidebar.css";
</style>
