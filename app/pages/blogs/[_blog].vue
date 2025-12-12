<template>
  <v-responsive height="100" />

  <v-container class="py-2 py-lg-5 px-md-5 px-lg-10 px-xl-15">
    <v-row class="d-flex justify-center align-center mx-auto" :density="isSmallScreen ? 'compact' : 'comfortable'">
      <v-col cols="12" lg="10" xl="8">
        <div class="d-flex justify-center justify-sm-end w-100">
          <v-btn @click="router.replace('/blogs')" text="Bloglara Dön" prepend-icon="mdi-arrow-left" :ripple="false"
            variant="tonal" />
        </div>
      </v-col>


      <v-col cols="12" lg="10" xl="8">
        <template v-if="isFetchingBlog">
          <v-skeleton-loader type="image, heading, paragraph, paragraph, paragraph" class="rounded-lg w-100" />
          <v-skeleton-loader type="chip, chip, chip" class="mt-3" />
          <v-skeleton-loader type="chip, chip" class="mt-2" />
        </template>
        <template v-else>
          <img class="rounded-lg w-100" :src="blog?.imageUrl" cover />
          <div class="d-flex flex-column align-start ga-2 ga-lg-3 ga-xl-5 mt-2 mt-lg-5">
            <p class="text-center text-md-start text-subtitle-2 text-sm-subtitle-1 text-md-h5 text-lg-h4 text-xl-h3 shadowed-text default-title-letter"
              style="text-transform: capitalize !important">
              {{ blog?.title }}
            </p>

            <v-divider class="w-100 w-lg-50" />

            <div class="d-flex flex-column ga-1 ga-lg-2" v-html="blog?.content"></div>

            <div v-if="blog?.average_votes > 0" class="d-flex flex-wrap align-center ga-2 ga-lg-3">
              <span v-if="!display.smAndDown.value"
                class="text-grey-darken-1 text-caption text-md-subtitle-2 text-lg-subtitle-1 default-title-letter">
                Ortalama Verilen Puan
              </span>

              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-chip v-bind="props" class="rounded-xl" variant="text" prepend-icon="mdi-thumb-up"
                    :color="getRatingColor(blog?.average_votes)" :size="display.smAndDown.value ? 'small' : 'default'"
                    :ripple="false" :text="`5 / ${blog?.average_votes.toFixed(1)}`" />
                </template>
                <span>{{ blog?.total_voters }} kişi oy verdi</span>
              </v-tooltip>
            </div>

            <div class="d-flex flex-wrap align-center ga-2 ga-lg-3">
              <span v-if="!display.smAndDown.value"
                class="text-grey-darken-1 text-caption text-md-subtitle-2 text-lg-subtitle-1 default-title-letter">Anahtar
                Kelimeler
              </span>
              <v-chip class="rounded-xl" variant="tonal" prepend-icon="mdi-tag" color="primary"
                :size="display.smAndDown.value ? 'small' : 'default'" :ripple="false"
                v-for="(tag, tagIndex) of blog?.keywords" :text="tag" />
            </div>

            <div class="d-flex flex-wrap align-center ga-2 ga-lg-3">
              <span v-if="!display.smAndDown.value"
                class="text-grey-darken-1 text-caption text-md-subtitle-2 text-lg-subtitle-1 default-title-letter">Tarih
              </span>

              <v-chip class="rounded-xl" variant="outlined" color="grey-lighten-1"
                :size="display.smAndDown.value ? 'small' : 'default'" prepend-icon="mdi-update" :ripple="false"
                :text="formatDateTR(blog?.createdAt)" />
            </div>

            <div v-if="blog" class="d-flex flex-wrap align-center ga-2 ga-lg-3">
              <span v-if="!display.smAndDown.value"
                class="text-grey-darken-1 text-caption text-md-subtitle-2 text-lg-subtitle-1 default-title-letter">
                Oyla
              </span>

              <v-rating hover :length="5" :size="26" :model-value="ratingValue" active-color="primary"
                :readonly="votesStore.hasVoted(blog?.firestoreId ?? '')"
                @update:model-value="(value) => blog?.firestoreId && voteBlog(blog.firestoreId, value as number)" />

              <span v-if="votesStore.hasVoted(blog.firestoreId) && !showThanksMessage"
                class="text-grey-lighten-1 text-caption text-lg-subtitle-2 default-title-letter">
                Oyladınız
              </span>

              <transition name="slide-up-fade" appear>
                <div v-if="showThanksMessage" class="w-100 my-2 d-flex align-center ga-2">
                  <img :src="successfullImg" width="40" />
                  <span class="text-success text-caption text-lg-subtitle-2 default-title-letter">
                    Oy verdiğiniz için teşekkürler!
                  </span>
                </div>
              </transition>
            </div>
          </div>
        </template>

      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { doc, getDoc, increment, setDoc, updateDoc } from "firebase/firestore";
import { getRatingColor, useFirestoreDateFormatted } from "~/composables/data/handleData";
import store from "~/store/store";
import { useVotesStore } from "~/store/votes";
import successfullImg from "~/assets/img/successfully_done_anim.gif";

const { $firestore } = useNuxtApp();

const _store = store();
const router = useRouter();
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);

const { formatDateTR } = useFirestoreDateFormatted();

const isFetchingBlog = ref(false);
const showThanksMessage = ref(false);

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

    const blogData: any = {
      firestoreId: blogSnap.id,
      ...blogSnap.data(),
    };

    const voteDocRef = doc($firestore, "blog_votes", activeId);
    const voteDocSnap = await getDoc(voteDocRef);

    if (voteDocSnap.exists()) {
      const voteData = voteDocSnap.data();
      const total = voteData.total ?? 0;
      const count = voteData.count ?? 0;
      blogData.average_votes = count > 0 ? total / count : 0;
      blogData.total_votes = total;
      blogData.total_voters = count;
    } else {
      blogData.average_votes = 0;
      blogData.total_votes = 0;
      blogData.total_voters = 0;
    }

    blog.value = blogData;
  } catch (error: any) {
    console.error("Error fetching active blog:", error.message);
    return null;
  } finally {
    isFetchingBlog.value = false;
  }
};

const votesStore = useVotesStore();
const ratingValue = ref(3);

const voteBlog = async (firestoreId: string, rating: number) => {
  if (votesStore.hasVoted(firestoreId)) return;

  const voteDocRef = doc($firestore, "blog_votes", firestoreId);
  const voteDoc = await getDoc(voteDocRef);

  if (voteDoc.exists()) {
    await updateDoc(voteDocRef, {
      total: increment(rating),
      count: increment(1),
    });
  } else {
    await setDoc(voteDocRef, {
      total: rating,
      count: 1,
    });
  }

  votesStore.addVote(firestoreId);
  showThanksMessage.value = true;

  setTimeout(() => {
    showThanksMessage.value = false;
  }, 3000);
};

const defaultTitle = "npmrungame - Blog Detayı";

useHead({
  title: defaultTitle,
});

watch(blog, (newBlog) => {
  if (newBlog?.title) {
    useHead({
      title: `${newBlog.title} - NPM Run Game`,
    });
  } else {
    useHead({
      title: defaultTitle,
    });
  }
});

onMounted(() => {
  fetchActiveBlog();
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/blogs.css";
</style>
