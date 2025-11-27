<template>
  <v-responsive height="100" />

  <v-container class="pa-2 pa-md-5 pa-lg-10 pa-xl-15">
    <v-row class="d-flex justify-start align-center mx-auto" :density="isSmallScreen ? 'compact' : 'comfortable'">
      <!-- Total Blogs -->
      <!-- <v-col cols="12">
        <p class="text-start text-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter text-grey-lighten-1">
          Bloglar <strong>({{ blogs?.length }})</strong>
        </p>

        <v-divider class="w-100 mt-5 mb-8" color="white" />
      </v-col> -->

      <!-- Initial Blog -->
      <v-row :align="'stretch'" :density="isSmallScreen ? 'compact' : 'comfortable'">
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="blog-card rounded-lg cursor-pointer flex-grow-1" :ripple="false">
            <v-img :src="randomInitialBlog?.imageUrl" class="blog-card-img w-100 h-75" cover />

            <v-card-actions class="d-flex flex-column align-start ga-1 ga-lg-2 pa-2 pa-lg-5 mb-3 mb-sm-5 mb-lg-10">
              <p class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1">
                {{ randomInitialBlog?.title }}
              </p>

              <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
                {{ truncateText(randomInitialBlog?.content, 200) }}
              </p>

              <div class="d-flex d-sm-none d-flex flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Tarih :</p>
                <span class="text-caption text-grey-lighten-1">{{
                  formatDateTR(randomInitialBlog?.createdAt)
                  }}</span>
              </div>

              <div class="d-flex flex-wrap d-none d-sm-flex align-center ga-1">
                <v-chip class="rounded" variant="tonal" color="white" prepend-icon="mdi-tag" size="x-small"
                  :ripple="false" v-for="(tag, tagIndex) of randomInitialBlog?.keywords" :text="tag" />
              </div>

              <div class="d-flex d-sm-none flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Etiketler :</p>
                <v-chip class="rounded" variant="tonal" color="green-accent-2" prepend-icon="mdi-tag" size="x-small"
                  :ripple="false" v-for="(tag, tagIndex) of randomInitialBlog?.keywords" :text="tag" />
              </div>
            </v-card-actions>

            <span class="d-none d-sm-flex blog-time text-caption text-grey-lighten-1 ma-1 ma-lg-2">{{
              formatDateTR(randomInitialBlog?.createdAt) }}</span>
          </v-card>
        </v-col>

        <!-- Random Two Blogs -->
        <v-col cols="12" md="6" class="d-flex flex-column ga-4">
          <v-card class="blog-card rounded-lg cursor-pointer" :ripple="false" v-for="(item, index) of randomTwoBlogs"
            :key="index" max-height="400">
            <v-img :src="item.imageUrl" class="blog-card-img w-100 h-75" cover />

            <v-card-actions class="d-flex flex-column align-start ga-1 ga-lg-2 pa-2 pa-lg-5 mb-3 mb-sm-5 mb-lg-10">
              <p class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1">
                {{ item.title }}
              </p>


              <div class="d-flex d-sm-none d-flex flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Tarih :</p>
                <span class="text-caption text-grey-lighten-1">{{
                  formatDateTR(item.createdAt)
                  }}</span>
              </div>

              <div class="d-flex flex-wrap d-none d-sm-flex align-center ga-1">
                <v-chip class="rounded" variant="tonal" color="white" prepend-icon="mdi-tag" size="x-small"
                  :ripple="false" v-for="(tag, tagIndex) of item.keywords" :text="tag" />
              </div>

              <div class="d-flex d-sm-none flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Etiketler :</p>
                <v-chip class="rounded" variant="tonal" color="green-accent-2" prepend-icon="mdi-tag" size="x-small"
                  :ripple="false" v-for="(tag, tagIndex) of item.keywords" :text="tag" />
              </div>
            </v-card-actions>

            <span class="d-none d-sm-flex blog-time text-caption text-grey-lighten-1 ma-1 ma-lg-2">{{
              formatDateTR(item.createdAt) }}</span>
          </v-card>
        </v-col>
      </v-row>

      <!-- All Blogs -->
      <v-row class="mt-5 mt-lg-10" :density="isSmallScreen ? 'compact' : 'comfortable'">
        <v-col cols="12" sm="6" lg="3" v-for="(item, index) of blogs" :key="index">
          <v-card class="blog-card rounded-lg cursor-pointer" :ripple="false">
            <v-img :src="item.imageUrl" class="blog-card-img w-100 h-50" cover />

            <v-card-actions class="d-flex flex-column align-start ga-1 ga-lg-2 pa-2 pa-lg-5 mb-3 mb-sm-5 mb-lg-10">
              <p class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1">
                {{ item.title }}
              </p>

              <p class="text-caption text-lg-subtitle-2 text-grey-darken-1">
                {{ truncateText(item.content, 200) }}
              </p>

              <div class="d-flex d-sm-none d-flex flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Tarih :</p>
                <span class="text-caption text-grey-lighten-1">{{
                  formatDateTR(item.createdAt)
                }}</span>
              </div>

              <div class="d-flex flex-wrap d-none d-sm-flex align-center ga-1">
                <v-chip class="rounded" variant="tonal" color="white" prepend-icon="mdi-tag" size="x-small"
                  :ripple="false" v-for="(tag, tagIndex) of item.keywords" :text="tag" />
              </div>

              <div class="d-flex d-sm-none flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Etiketler :</p>
                <v-chip class="rounded" variant="tonal" color="green-accent-2" prepend-icon="mdi-tag" size="x-small"
                  :ripple="false" v-for="(tag, tagIndex) of item.keywords" :text="tag" />
              </div>
            </v-card-actions>

            <span class="d-none d-sm-flex blog-time text-caption text-grey-lighten-1 ma-1 ma-lg-2">{{
              formatDateTR(item.createdAt) }}</span>
          </v-card>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import { collection, getDocs } from "firebase/firestore";
import { truncateText } from "~/composables/core/basicFunc";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";
import store from "~/store/store";

useHead({
  title: "npmrungame | Blogs"
})

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const route = useRoute();

const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);

const { formatDateTR } = useFirestoreDateFormatted();

const isGettingBlogs = ref(false);

const blogs = ref<any[]>([]);
const randomInitialBlog = ref<any | null>(null)
const randomTwoBlogs = ref<any[]>([]);

const pickRandomBlogs = () => {
  if (!blogs.value?.length) return

  const shuffled = [...blogs.value].sort(() => Math.random() - 0.5)

  randomInitialBlog.value = shuffled[0]
  randomTwoBlogs.value = shuffled.slice(1, 3)
}

const getBlogsFromDb = async () => {
  try {
    isGettingBlogs.value = true;
    const blogsCol = collection($firestore, "blogs");
    const blogsSnapshot = await getDocs(blogsCol);

    const blogsList = blogsSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    console.log("blogs list", blogsList);

    blogs.value = blogsList;
    pickRandomBlogs();

    console.log(randomInitialBlog.value?.createdAt);


  } catch (error: any) {
    console.error("Error while getting blogs : ", error.message);
  } finally {
    isGettingBlogs.value = false;
  }
};

onMounted(() => {
  getBlogsFromDb();
});
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/blogs.css";
</style>
