<template>
  <v-responsive height="100" />

  <v-container class="py-2 py-lg-5 px-md-5 px-lg-10 px-xl-15">
    <v-row
      class="d-flex align-center mx-auto"
      :density="isSmallScreen ? 'compact' : 'comfortable'"
    >
      <v-col cols="12">
        <div class="d-flex justify-center justify-sm-end w-100">
          <v-btn
            @click="router.replace('/blogs')"
            text="Bloglara Dön"
            prepend-icon="mdi-arrow-left"
            :ripple="false"
            variant="tonal"
          />
        </div>
      </v-col>

      <v-col cols="12">
        <img class="rounded-lg w-100 w-lg-75 w-xl-50" :src="blog?.imageUrl" cover />
        <div class="d-flex flex-column align-start ga-2 ga-lg-5 mt-2 mt-lg-5">
          <p
            class="text-center text-md-start text-subtitle-2 text-md-subtitle-1 text-lg-h5 text-xl-h4 text-grey-lighten-1 default-title-letter"
          >
            {{ blog?.title }}
          </p>

          <p
            class="text-center text-md-start text-caption text-md-subtitle-2 text-lg-subtitle-1 text-grey-darken-1 default-title-letter"
          >
            {{ blog?.content }}
          </p>

          <div class="d-flex flex-wrap align-center ga-2 ga-lg-3">
            <span
              class="text-grey-darken-1 text-caption text-md-subtitle-2 text-lg-subtitle-1 default-title-letter"
              >Anahtar Kelimeler :
            </span>
            <v-chip
              class="rounded-xl"
              variant="tonal"
              prepend-icon="mdi-tag"
              :ripple="false"
              v-for="(tag, tagIndex) of blog?.keywords"
              :text="tag"
            />
          </div>

          <div class="d-flex flex-wrap align-center ga-2 ga-lg-3">
            <span
              class="text-grey-darken-1 text-caption text-md-subtitle-2 text-lg-subtitle-1 default-title-letter"
              >Tarih :
            </span>

            <v-chip
              class="rounded-xl"
              variant="tonal"
              prepend-icon="mdi-update"
              :ripple="false"
              :text="formatDateTR(blog?.createdAt)"
            />
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { doc, getDoc } from "firebase/firestore";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";
import store from "~/store/store";

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);

const { formatDateTR } = useFirestoreDateFormatted();

const isFetchingBlog = ref(false);
const blog = ref<any | null>(null);

const fetchActiveBlog = async () => {
  const activeId = _store.active_blog_id;
  if (!activeId) {
    console.warn("No active blog ID set in the store");
    return null;
  }

  try {
    isFetchingBlog.value = true;
    const blogRef = doc($firestore, "blogs", activeId);
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
      console.error("Blog not found for ID:", activeId);
      return null;
    }

    const blogData = {
      firestoreId: blogSnap.id,
      ...blogSnap.data(),
    };

    blog.value = blogData;
  } catch (error: any) {
    console.error("Error fetching active blog:", error.message);
    return null;
  } finally {
    isFetchingBlog.value = false;
  }
};

onMounted(() => {
  fetchActiveBlog();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/blogs.css";
</style>
