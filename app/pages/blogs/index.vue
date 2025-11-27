<template>
  <v-responsive height="100" />

  <v-container class="py-2 py-lg-5 px-md-5 px-lg-10 px-xl-15">
    <v-row
      class="d-flex align-center mx-auto"
      :density="isSmallScreen ? 'compact' : 'comfortable'"
    >
      <!-- Total Blogs -->
      <v-col cols="12" md="6" xl="8">
        <div class="d-flex flex-wrap justify-center justify-sm-start align-center ga-2">
          <img :src="blogAnimImg" width="50" />
          <p
            class="text-center text-sm-start text-subtitle-1 text-lg-h5 text-xl-h4 default-title-letter text-grey-lighten-1"
          >
            Oyun Dünyasından En Son Haberler
          </p>
        </div>
      </v-col>

      <v-col cols="12" md="6" xl="4">
        <v-text-field
          variant="solo"
          label="Blog Ara"
          rounded="lg"
          :elevation="0"
          prepend-inner-icon="mdi-magnify"
          class="text-grey-lighten-1"
        />
      </v-col>

      <v-divider class="w-100 mt-1 mb-3 mb-lg-5" color="white" />

      <v-row
        v-if="!isSmallScreen"
        :align="'stretch'"
        :density="isSmallScreen ? 'compact' : 'comfortable'"
      >
        <!-- Initial Blog -->
        <v-col cols="12" md="6">
          <template v-if="isGettingBlogs">
            <v-card class="d-flex flex-column flex-grow-1" height="100%">
              <v-skeleton-loader type="image" class="w-100 h-100" />

              <v-card-actions class="px-3 py-4 d-flex align-start flex-column ga-2">
                <v-skeleton-loader type="text" width="70%" />
                <v-skeleton-loader type="text" width="90%" />
                <v-skeleton-loader type="text" width="50%" />
              </v-card-actions>
            </v-card>
          </template>

          <v-card
            v-else
            class="blog-card cursor-pointer d-flex flex-column ga-2 flex-grow-1"
            height="100%"
            @click="handleBlogClick(randomInitialBlog)"
            :ripple="false"
            :elevation="0"
          >
            <v-img
              :src="randomInitialBlog?.imageUrl"
              class="blog-card-img rounded-lg w-100 h-75"
              cover
            />

            <v-card-actions
              class="d-flex flex-column align-start ga-1 ga-lg-2 px-2 px-lg-5"
            >
              <p
                class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
              >
                {{ randomInitialBlog?.title }}
              </p>

              <p
                class="d-flex d-lg-none text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(randomInitialBlog?.content, 250) }}
              </p>

              <p
                class="d-none d-lg-flex d-xl-none text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(randomInitialBlog?.content, 125) }}
              </p>

              <p
                class="d-none d-xl-flex text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(randomInitialBlog?.content, 300) }}
              </p>

              <div
                class="w-100 d-none d-lg-flex justiy-start justify-lg-end align-center"
              >
                <span class="text-subtitle-2 text-grey-lighten-1">{{
                  formatDateTR(randomInitialBlog?.createdAt)
                }}</span>
              </div>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Random Two Blogs Skeleton -->
        <v-col cols="12" md="6" class="d-flex flex-column ga-4" v-if="isGettingBlogs">
          <div
            class="blog-card d-flex flex-column flex-lg-row h-100 ga-3"
            v-for="i in 2"
            :key="i"
          >
            <!-- Image Container -->
            <div class="rounded-lg w-100 w-lg-50" style="aspect-ratio: 16/9">
              <v-skeleton-loader type="image" class="w-100 h-100" />
            </div>

            <!-- Content -->
            <div class="d-flex flex-column ga-2 px-2 px-lg-5 mt-2 mt-lg-0 w-100">
              <v-skeleton-loader type="text" width="60%" />
              <v-skeleton-loader type="text" width="90%" />
              <v-skeleton-loader type="text" width="70%" />
              <v-skeleton-loader type="chip" class="mt-1" />
              <v-skeleton-loader type="text" width="40%" />
            </div>
          </div>
        </v-col>

        <!-- Random Two Blogs -->
        <v-col cols="12" md="6" class="d-flex flex-column ga-4">
          <div
            class="blog-card cursor-pointer d-flex flex-column flex-lg-row justify-space-between alig-center h-100"
            v-for="(item, index) of randomTwoBlogs"
            :key="index"
            @click="handleBlogClick(item)"
          >
            <v-img
              :src="item.imageUrl"
              class="blog-card-img rounded-lg w-100 w-lg-50 h-auto h-lg-100"
              cover
            />

            <div
              class="d-flex flex-column align-start justify-start ga-1 ga-lg-2 px-2 px-lg-5 mt-2 mt-lg-0"
            >
              <p
                class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
              >
                {{ item.title }}
              </p>

              <p
                class="d-flex d-lg-none text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(item.content, 200) }}
              </p>

              <p
                class="d-none d-lg-flex d-xl-none text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(item.content, 125) }}
              </p>

              <p
                class="d-none d-xl-flex text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(item.content, 300) }}
              </p>

              <div class="d-flex flex-wrap align-center ga-1">
                <v-chip
                  class="rounded-xl cursor-default"
                  variant="outlined"
                  size="small"
                  color="grey-lighten-1"
                  prepend-icon="mdi-tag"
                  :ripple="false"
                  v-for="(tag, tagIndex) of item.keywords"
                  :text="tag"
                />
              </div>

              <div class="d-none d-lg-flex align-center w-100">
                <span class="text-subtitle-2 text-grey-lighten-1 ma-1 ma-lg-2">{{
                  formatDateTR(item.createdAt)
                }}</span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- All Blogs Skeleton -->
      <v-row class="mt-5 mt-lg-10 w-100 mx-auto" v-if="isGettingBlogs">
        <v-col cols="12" sm="6" lg="3" v-for="i in 8" :key="i">
          <v-card class="rounded-lg d-flex flex-column" :elevation="0">
            <!-- Skeleton Image -->
            <div class="w-100" style="aspect-ratio: 16/9">
              <v-skeleton-loader type="image" class="w-100 h-100" />
            </div>

            <!-- Skeleton Content -->
            <v-card-actions class="d-flex flex-column ga-2 pa-2 pa-lg-5 mb-4">
              <v-skeleton-loader type="text" width="70%" />
              <v-skeleton-loader type="text" width="90%" />
              <v-skeleton-loader type="chip" width="60%" />
            </v-card-actions>

            <!-- Skeleton Date -->
            <div class="px-2 mb-2">
              <v-skeleton-loader type="text" width="40%" />
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- All Blogs -->
      <v-row class="mt-5 mt-lg-10" :density="isSmallScreen ? 'compact' : 'comfortable'">
        <v-col cols="12" sm="6" lg="3" v-for="(item, index) of blogs" :key="index">
          <v-card
            class="blog-card cursor-pointer"
            :ripple="false"
            :elevation="0"
            @click="handleBlogClick(item)"
          >
            <v-img
              :src="item.imageUrl"
              class="blog-card-img rounded-lg w-100 h-50"
              cover
            />

            <v-card-actions class="d-flex flex-column align-start ga-1 ga-lg-2">
              <p
                class="text-subtitle-2 text-lg-subtitle-1 default-title-letter text-grey-lighten-1"
              >
                {{ item.title }}
              </p>

              <p
                class="d-flex d-md-none text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(item.content, 200) }}
              </p>

              <p
                class="d-none d-md-flex text-caption text-lg-subtitle-2 text-grey-darken-1"
              >
                {{ truncateText(item.content, 125) }}
              </p>

              <div class="d-flex d-sm-none d-flex flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Tarih :</p>
                <span class="text-caption text-grey-lighten-1">{{
                  formatDateTR(item.createdAt)
                }}</span>
              </div>

              <div class="d-none d-sm-flex flex-wrap align-center ga-1">
                <v-chip
                  class="rounded"
                  variant="tonal"
                  color="white"
                  prepend-icon="mdi-tag"
                  size="x-small"
                  :ripple="false"
                  v-for="(tag, tagIndex) of item.keywords"
                  :text="tag"
                />
              </div>

              <div class="d-flex d-sm-none flex-wrap align-center ga-1">
                <p class="text-caption text-grey-darken-1">Etiketler :</p>
                <v-chip
                  class="rounded"
                  variant="tonal"
                  color="green-accent-2"
                  prepend-icon="mdi-tag"
                  size="x-small"
                  :ripple="false"
                  v-for="(tag, tagIndex) of item.keywords"
                  :text="tag"
                />
              </div>
            </v-card-actions>

            <span
              class="d-none d-sm-flex text-caption text-grey-lighten-1 ma-1 ma-lg-2"
              >{{ formatDateTR(item.createdAt) }}</span
            >
          </v-card>
        </v-col>
      </v-row>
    </v-row>
  </v-container>
</template>
<script lang="ts" setup>
import { collection, getDocs } from "firebase/firestore";
import { slugify, truncateText } from "~/composables/core/basicFunc";
import { useFirestoreDateFormatted } from "~/composables/data/handleData";
import store from "~/store/store";
import blogAnimImg from "~/assets/img/blog_anim.gif";

useHead({
  title: "npmrungame | Blogs",
});

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);

const { formatDateTR } = useFirestoreDateFormatted();

const isGettingBlogs = ref(false);

const blogs = ref<any[]>([]);
const randomInitialBlog = ref<any | null>(null);
const randomTwoBlogs = ref<any[]>([]);

const pickRandomBlogs = () => {
  if (!blogs.value?.length) return;

  const shuffled = [...blogs.value].sort(() => Math.random() - 0.5);

  randomInitialBlog.value = shuffled[0];
  randomTwoBlogs.value = shuffled.slice(1, 3);
};

const getBlogsFromDb = async () => {
  try {
    isGettingBlogs.value = true;
    const blogsCol = collection($firestore, "blogs");
    const blogsSnapshot = await getDocs(blogsCol);

    const blogsList = blogsSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    blogs.value = blogsList;
    pickRandomBlogs();
  } catch (error: any) {
    console.error("Error while getting blogs : ", error.message);
  } finally {
    isGettingBlogs.value = false;
  }
};

const handleBlogClick = (blog: any) => {
  const prefixedTitle = slugify(blog?.title);
  _store.setActiveBlogId(blog?.firestoreId);
  router.replace(`/blogs/${prefixedTitle}`);
};

onMounted(() => {
  getBlogsFromDb();
});
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/blogs.css";
</style>
