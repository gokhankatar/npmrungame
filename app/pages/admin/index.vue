<template>

  <template v-if="_store.isAdmin">
    <v-navigation-drawer class="admin-nav-drawer" permanent :rail="false">
      <template v-slot:prepend>
        <v-list class="bg-transparent" :density="isExtraLargeScreen ? 'comfortable' : 'compact'">
          <v-list-item v-for="(item, index) of adminListItems" :key="index" :prepend-icon="item.icon"
            @click="_store.setActiveAdminListItem(item.slug)" :ripple="false" class="rounded-xl"
            :class="_store.active_admin_list_item == item.slug ? 'active-admin-list-item' : ''">
            <v-list-item-title class="default-title-letter text-caption text-lg-subtitle-2">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </template>

      <template v-slot:append>
        <v-btn @click="router.replace('/')" text="Anasayfaya Dön"
          class="mb-1 default-title-letter rounded-xl text-capitalize" variant="tonal" color="primary" :elevation="0"
          :size="isExtraLargeScreen ? 'large' : 'small'" prepend-icon="mdi-home-outline" :ripple="false" block />
        <v-btn @click="handleLogout" text="Çıkış Yap" class="mb-1 default-title-letter rounded-xl text-capitalize"
          variant="tonal" color="red-accent-1" :elevation="0" :size="isExtraLargeScreen ? 'large' : 'small'"
          prepend-icon="mdi-logout" :ripple="false" block />
      </template>
    </v-navigation-drawer>
  </template>

  <template v-else>
    <v-form class="admin-form rounded-lg pa-5 w-100" ref="adminForm" @submit.prevent="handleAdminAuth">
      <v-btn class="back-to-home-btn ma-1 ma-lg-2 text-caption text-lg-subtitle-2 pa-1" @click="router.replace('/')"
        size="xs" icon="mdi-arrow-left" variant="tonal" color="grey-lighten-1" :ripple="false" />

      <div class="d-flex align-center justify-center ga-2 ga-lg-4 mt-5 mb-5 mb-lg-10">
        <v-icon icon="mdi-security" color="grey-lighten-1" :size="isSmallScreen ? 'small' : 'large'" />

        <p class="default-title-letter text-grey-lighten-1 text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-center">
          Admin Girişi</p>
      </div>

      <v-text-field v-model="adminModels.email" type="email" variant="outlined" rounded="xl" label="Email"
        prepend-inner-icon="mdi-email" clearable :density="isExtraLargeScreen ? 'comfortable' : 'compact'" />

      <v-text-field v-model="adminModels.password" type="password" variant="outlined" rounded="xl" label="Şifre"
        prepend-inner-icon="mdi-lock" clearable :density="isExtraLargeScreen ? 'comfortable' : 'compact'" />

      <v-btn text="Giriş" class="text-caption text-lg-subtitle-2 text-capitalize" prepend-icon="mdi-send" block
        variant="tonal" :ripple="false" type="submit" />
    </v-form>
  </template>

</template>

<script lang="ts" setup>
import store from '~/store/store';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"



definePageMeta({
  layout: "admin"
})

useHead({
  title: "npmrungame | Admin"
})

const _store = store()
const router = useRouter()
const display = useDisplay()
const isSmallScreen = computed(() => display.smAndDown.value)
const isExtraLargeScreen = computed(() => display.lgAndUp.value)

const adminForm = ref<HTMLFormElement | null>(null)
const adminModels = ref({
  email: "",
  password: ""
})


const handleLogout = (): void => {
  _store.logOut()
  router.replace('/')
}

const { $auth } = useNuxtApp()

const handleAdminAuth = async () => {
  /*
  const { isValid } = await adminForm.value?.validate()

  if (!isValid) return

  */

  try {
    const userCredential = await signInWithEmailAndPassword($auth, adminModels.value?.email, adminModels.value.password)

    const user = userCredential.user
    console.log(userCredential, user);

  } catch (error: any) {
    console.error("Error while admin login", error.message)
  }
}
</script>

<style scoped>
@import url("~/assets/css/main.css");
@import url("~/assets/css/admin.css");
</style>
