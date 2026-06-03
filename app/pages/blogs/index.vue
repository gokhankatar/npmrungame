<template>
  <div class="blogs-page">
    <div class="blogs-page-glow blogs-page-glow--left" aria-hidden="true" />
    <div class="blogs-page-glow blogs-page-glow--right" aria-hidden="true" />

    <v-responsive :height="display.xs.value ? 70 : 90" />

    <v-container class="blogs-container pa-3 pa-md-6 pa-lg-10 pa-xl-15">
      <header class="blogs-hero">
        <div class="blogs-hero-badge default-title-letter">
          <v-icon icon="mdi-post-outline" size="16" color="#69f0ae" />
          <span>Blog</span>
        </div>
        <div class="blogs-hero-main">
          <h1 class="blogs-hero-title default-title-letter">Oyun dünyasından haberler</h1>
          <p class="blogs-hero-sub default-title-letter">
            Çıkışlar, incelemeler ve stüdyo gelişmeleri — güncel yazılar ve topluluk oyları.
          </p>
        </div>
        <div v-if="!isGettingBlogs" class="blogs-hero-pill default-title-letter">
          <v-icon icon="mdi-file-document-multiple-outline" size="small" color="#69f0ae" />
          <span>{{ allBlogs.length }} yazı</span>
        </div>
        <v-skeleton-loader v-else type="chip" width="100" class="blogs-hero-pill-skeleton" />
      </header>

      <section class="blogs-toolbar">
        <v-text-field
          v-model="searchText"
          variant="outlined"
          label="Blog ara"
          placeholder="Başlıkta ara…"
          :density="isSmallScreen ? 'compact' : 'comfortable'"
          clearable
          rounded="pill"
          prepend-inner-icon="mdi-magnify"
          color="green-accent-2"
          class="blogs-search default-title-letter"
          hide-details
          @update:model-value="onSearchInput"
        />

        <div class="blogs-toolbar__chips">
          <v-chip
            :size="isSmallScreen ? 'small' : 'default'"
            variant="tonal"
            color="green-accent-2"
            :ripple="false"
            class="default-title-letter"
            :prepend-icon="sortOrder === 'desc' ? 'mdi-arrow-down' : 'mdi-arrow-up'"
            text="Puana göre"
            @click="sortByAverage"
          />
          <v-chip
            v-for="kw in visibleKeywords"
            :key="kw"
            :size="isSmallScreen ? 'small' : 'default'"
            :variant="selectedKeyword === kw ? 'flat' : 'tonal'"
            :color="selectedKeyword === kw ? 'green-accent-2' : 'grey-darken-1'"
            :ripple="false"
            class="default-title-letter"
            :prepend-icon="selectedKeyword === kw ? 'mdi-check' : undefined"
            :text="kw"
            @click="filterByKeyword(kw)"
          />
          <v-menu v-if="keywords.length > maxVisibleKeywords" location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-chip
                v-bind="menuProps"
                size="small"
                variant="outlined"
                color="grey-lighten-1"
                :ripple="false"
                prepend-icon="mdi-dots-horizontal"
                :text="`+${keywords.length - maxVisibleKeywords}`"
              />
            </template>
            <v-card class="blogs-keywords-menu pa-2 rounded-xl" :ripple="false">
              <v-chip
                v-for="kw in overflowKeywords"
                :key="kw"
                size="small"
                class="ma-1 default-title-letter"
                :variant="selectedKeyword === kw ? 'flat' : 'tonal'"
                :color="selectedKeyword === kw ? 'green-accent-2' : 'grey-darken-1'"
                :text="kw"
                :ripple="false"
                @click="filterByKeyword(kw)"
              />
            </v-card>
          </v-menu>
          <v-chip
            v-if="selectedKeyword || searchText.length >= 3"
            size="small"
            variant="outlined"
            color="grey-lighten-1"
            prepend-icon="mdi-close"
            text="Temizle"
            :ripple="false"
            class="default-title-letter"
            @click="clearFilters"
          />
        </div>
      </section>

      <!-- Netflix hero — en son yazı -->
      <section
        v-if="showFeaturedLayout"
        class="blogs-featured"
        :class="{ 'blogs-featured--loading': isGettingBlogs }"
      >
        <template v-if="isGettingBlogs">
          <v-skeleton-loader type="image" class="blogs-featured__loader" />
        </template>

        <template v-else-if="featuredBlog">
          <v-img
            v-if="featuredBlog.imageUrl"
            :src="featuredBlog.imageUrl"
            :alt="featuredBlog.title"
            cover
            class="blogs-featured__bg"
          />
          <div v-else class="blogs-featured__bg blogs-featured__bg--empty">
            <v-icon icon="mdi-post-outline" size="64" color="rgba(255,255,255,0.2)" />
          </div>
          <div class="blogs-featured__shade" aria-hidden="true" />
          <div class="blogs-featured__vignette" aria-hidden="true" />

          <div class="blogs-featured__inner">
            <div class="blogs-featured__labels">
              <span class="blogs-featured__label blogs-featured__label--hot">
                <v-icon icon="mdi-star-shooting" size="14" />
                Son yazı
              </span>
              <v-chip
                v-if="featuredBlog.average_votes > 0"
                size="small"
                variant="elevated"
                :color="getRatingColor(featuredBlog.average_votes)"
                class="blogs-featured__rating"
                prepend-icon="mdi-thumb-up"
                :text="`${featuredBlog.average_votes.toFixed(1)} / 5`"
              />
            </div>

            <h2 class="blogs-featured__title default-title-letter">
              {{ featuredBlog.title }}
            </h2>

            <p class="blogs-featured__excerpt default-title-letter">
              {{ truncateText(stripHtml(featuredBlog.content_raw), 220) }}
            </p>

            <div class="blogs-featured__meta">
              <span class="blogs-featured__date default-title-letter">
                <v-icon icon="mdi-calendar-outline" size="16" />
                {{ formatDateTR(featuredBlog.createdAt) }}
              </span>
              <div v-if="featuredBlog.keywords?.length" class="blogs-featured__tags">
                <v-chip
                  v-for="(tag, idx) in featuredBlog.keywords.slice(0, 4)"
                  :key="idx"
                  size="x-small"
                  variant="tonal"
                  color="green-accent-2"
                  class="default-title-letter"
                  :text="tag"
                />
              </div>
            </div>

            <div class="blogs-featured__actions">
              <v-btn
                color="green-accent-2"
                variant="flat"
                rounded="pill"
                size="large"
                class="blogs-featured__btn text-black font-weight-bold text-capitalize default-title-letter"
                prepend-icon="mdi-book-open-page-variant"
                text="Yazıyı oku"
                :ripple="false"
                @click="handleBlogClick(featuredBlog)"
              />
            </div>
          </div>
        </template>
      </section>

      <!-- Öne çıkanlar — yatay şerit -->
      <section v-if="showFeaturedLayout && !isGettingBlogs && spotlightBlogs.length" class="blogs-spotlight">
        <div class="blogs-spotlight__head">
          <h3 class="blogs-spotlight__title default-title-letter">Öne çıkanlar</h3>
        </div>
        <v-row class="blogs-spotlight__row" :dense="isSmallScreen" role="list">
          <v-col
            v-for="(item, index) in spotlightBlogs"
            :key="item.firestoreId"
            cols="12"
            sm="4"
            role="listitem"
          >
            <article
              class="blogs-spotlight-card"
              :style="{ animationDelay: `${index * 0.06}s` }"
              tabindex="0"
              @click="handleBlogClick(item)"
              @keydown.enter="handleBlogClick(item)"
            >
              <v-img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.title"
                cover
                class="blogs-spotlight-card__img"
              />
              <div v-else class="blogs-spotlight-card__img blogs-spotlight-card__img--empty">
                <v-icon icon="mdi-post-outline" size="40" color="rgba(255,255,255,0.2)" />
              </div>
              <div class="blogs-spotlight-card__shade" />
              <div class="blogs-spotlight-card__body">
                <h4 class="blogs-spotlight-card__title default-title-letter">{{ item.title }}</h4>
                <p class="blogs-spotlight-card__date default-title-letter mb-0">
                  {{ formatDateTR(item.createdAt) }}
                </p>
              </div>
            </article>
          </v-col>
        </v-row>
      </section>

      <!-- Liste -->
      <section class="blogs-feed">
        <div class="blogs-feed__head">
          <h3 class="blogs-feed__title default-title-letter">
            {{ feedTitle }}
          </h3>
          <div v-if="isLoadingSearchBlog" class="d-flex align-center ga-2">
            <v-progress-circular indeterminate size="16" width="2" color="#69f0ae" />
            <span class="text-caption text-grey-lighten-1 default-title-letter">Aranıyor…</span>
          </div>
        </div>

        <p
          v-if="!isGettingBlogs && !isLoadingSearchBlog && !blogs.length"
          class="blogs-feed__empty default-title-letter"
        >
          <v-icon icon="mdi-magnify-close" size="20" class="mr-1" />
          Eşleşen blog bulunamadı.
        </p>

        <Blog_Card
          v-else
          class="blogs-feed-grid"
          :loading="isGettingBlogs"
          :skeleton_number="8"
          :arr="blogs"
          :on-row-click="handleBlogClick"
        />
      </section>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { collection, getDocs } from "firebase/firestore";
import { slugify, truncateText } from "~/composables/core/basicFunc";
import {
  getRatingColor,
  normalizeText,
  useFirestoreDateFormatted,
} from "~/composables/data/handleData";
import store from "~/store/store";
import Blog_Card from "~/components/common/Blog_Card.vue";
import _ from "lodash";

useHead({
  title: "Blog | npmrungame",
  meta: [
    {
      name: "description",
      content: "npmrungame blog — oyun haberleri, incelemeler ve güncel yazılar.",
    },
  ],
});

const { $firestore } = useNuxtApp();
const _store = store();
const router = useRouter();
const display = useDisplay();
const isSmallScreen = computed(() => display.smAndDown.value);
const { formatDateTR } = useFirestoreDateFormatted();

const maxVisibleKeywords = 5;

const isGettingBlogs = ref(false);
const isLoadingSearchBlog = ref(false);
const sortOrder = ref<"asc" | "desc">("desc");
const allBlogs = ref<any[]>([]);
const blogs = ref<any[]>([]);
const keywords = ref<string[]>([]);
const selectedKeyword = ref<string | null>(null);
const searchText = ref("");

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

const stripHtml = (html?: string) => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

const getCreatedTime = (blog: { createdAt?: unknown }) => {
  const raw = blog.createdAt;
  if (!raw) return 0;
  if (typeof raw === "object" && raw !== null && "seconds" in raw) {
    return (raw as { seconds: number }).seconds * 1000;
  }
  return new Date(raw as string | number).getTime() || 0;
};

const sortedAllBlogs = computed(() =>
  [...allBlogs.value].sort((a, b) => getCreatedTime(b) - getCreatedTime(a))
);

const featuredBlog = computed(() => sortedAllBlogs.value[0] ?? null);

const spotlightBlogs = computed(() => sortedAllBlogs.value.slice(1, 4));

const featuredIds = computed(() => {
  const ids = new Set<string>();
  if (featuredBlog.value?.firestoreId) ids.add(featuredBlog.value.firestoreId);
  spotlightBlogs.value.forEach((b) => ids.add(b.firestoreId));
  return ids;
});

const showFeaturedLayout = computed(
  () => !selectedKeyword.value && searchText.value.trim().length < 3
);

const visibleKeywords = computed(() => keywords.value.slice(0, maxVisibleKeywords));
const overflowKeywords = computed(() => keywords.value.slice(maxVisibleKeywords));

const feedTitle = computed(() => {
  if (selectedKeyword.value) return `“${selectedKeyword.value}” etiketli yazılar`;
  if (searchText.value.trim().length >= 3) return "Arama sonuçları";
  if (showFeaturedLayout.value) return "Diğer yazılar";
  return "Tüm yazılar";
});

const applyListFilters = () => {
  const q = searchText.value.trim().toLowerCase();
  let list = [...allBlogs.value];

  if (selectedKeyword.value) {
    list = list.filter((blog) => blog.keywords?.includes(selectedKeyword.value));
  } else if (q.length >= 3) {
    list = list.filter((blog) => blog.title?.toLowerCase().includes(q));
  }

  if (showFeaturedLayout.value) {
    list = list.filter((blog) => !featuredIds.value.has(blog.firestoreId));
  }

  blogs.value = list;
};

const extractKeywords = () => {
  const set = new Set<string>();
  allBlogs.value.forEach((blog) => {
    blog.keywords?.forEach((kw: string) => set.add(kw));
  });
  keywords.value = [...set].sort();
};

const clearFilters = () => {
  selectedKeyword.value = null;
  searchText.value = "";
  applyListFilters();
};

const getBlogsFromDb = async () => {
  try {
    isGettingBlogs.value = true;

    const blogsSnapshot = await getDocs(collection($firestore, "blogs"));
    const blogsList = blogsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        firestoreId: doc.id,
        ...data,
        keywords: (data.keywords ?? []).map((k: string) => normalizeText(k)),
      };
    });

    const votesSnapshot = await getDocs(collection($firestore, "blog_votes"));
    const blogVotes: Record<string, { total: number; count: number }> = {};
    votesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      blogVotes[doc.id] = { total: data.total ?? 0, count: data.count ?? 0 };
    });

    allBlogs.value = blogsList.map((blog) => {
      const votes = blogVotes[blog.firestoreId];
      const count = votes?.count ?? 0;
      return {
        ...blog,
        average_votes: count > 0 ? (votes?.total ?? 0) / count : 0,
        total_votes: votes?.total ?? 0,
        total_voters: count,
      };
    });

    extractKeywords();
    applyListFilters();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Error while getting blogs:", msg);
  } finally {
    isGettingBlogs.value = false;
  }
};

const filterByKeyword = (kw: string) => {
  selectedKeyword.value = selectedKeyword.value === kw ? null : kw;
  applyListFilters();
};

const handleBlogClick = (blog: any) => {
  if (!blog?.title) return;
  _store.setActiveBlogId(blog.firestoreId);
  router.push(`/blogs/${slugify(blog.title)}`);
};

const onSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  isLoadingSearchBlog.value = true;
  searchDebounce = setTimeout(() => {
    applyListFilters();
    isLoadingSearchBlog.value = false;
  }, 350);
};

const sortByAverage = () => {
  allBlogs.value = _.orderBy(allBlogs.value, ["average_votes"], [sortOrder.value]);
  sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
  applyListFilters();
};

watch(selectedKeyword, () => applyListFilters());

onMounted(() => {
  getBlogsFromDb();
});

onUnmounted(() => {
  if (searchDebounce) clearTimeout(searchDebounce);
});
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/blogs.css";
</style>
