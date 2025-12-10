<template>
  <v-responsive height="100" v-if="!display.smAndDown.value" />
  <v-responsive height="70" v-else />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row class="w-100 mx-auto d-flex justify-center align-center">
      <v-col cols="12" class="d-flex flex-column align-center align-sm-start ga-6">
        <!-- Avatar -->
        <template v-if="isGettingMyInfos">
          <v-skeleton-loader
            type="avatar"
            :loading="true"
            :elevation="0"
            :width="display.smAndDown.value ? 120 : 200"
            :height="display.smAndDown.value ? 120 : 200"
            class="rounded-circle"
          />
        </template>
        <template v-else>
          <v-avatar
            :image="myInfos?.profile_img"
            :size="display.smAndDown.value ? 120 : 200"
          />
        </template>

        <!-- Info Section -->
        <div
          class="d-flex flex-column align-center align-sm-start ga-2 ga-lg-5"
          style="width: 100%"
        >
          <!-- Email -->
          <template v-if="isGettingMyInfos">
            <v-skeleton-loader type="text" width="70%" />
          </template>
          <template v-else>
            <a
              href="mailto:katar_gokhan@hotmail.com"
              class="text-decoration-none"
              target="_blank"
            >
              <div class="d-flex align-center ga-2 cursor-pointer">
                <v-icon
                  icon="mdi-email"
                  :size="display.smAndDown.value ? 'small' : 'large'"
                  color="grey-lighten-1"
                />
                <p
                  class="text-subtitle-2 text-sm-subtitle-1 text-lg-h5 text-grey-lighten-1"
                >
                  {{ myInfos?.email }}
                </p>
              </div>
            </a>
          </template>

          <!-- Name -->
          <template v-if="isGettingMyInfos">
            <v-skeleton-loader type="text" width="50%" height="28px" />
          </template>
          <template v-else>
            <p
              class="text-blue-grey-darken-1 text-h5 text-sm-h4 text-lg-h3 font-weight-medium"
            >
              {{ myInfos?.full_name }}
            </p>
          </template>

          <!-- Summary HTML (Description) -->
          <template v-if="isGettingMyInfos">
            <v-skeleton-loader
              type="paragraph"
              width="100%"
              max-width="100%"
              class="mt-2"
            />
          </template>
          <template v-else>
            <div v-html="myInfos?.summary_html"></div>
          </template>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import { getDocs, collection } from "firebase/firestore";

useHead({
  title: "npmrungame | Hakkımda",
});

const { $firestore } = useNuxtApp();

const display = useDisplay();

const isGettingMyInfos = ref(false);
const myInfos = ref<any | null>(null);

const getMyInfos = async () => {
  try {
    isGettingMyInfos.value = true;

    const myInfoCol = collection($firestore, "my_profile_infos");
    const myInfoSnapshot = await getDocs(myInfoCol);

    const myInfo = myInfoSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    myInfos.value = myInfo[0];
  } catch (error) {
    console.error("Error getting my infos :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingMyInfos.value = false;
    }, 250);
  }
};

onMounted(() => {
  getMyInfos();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
</style>
