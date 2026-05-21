<template>
  <v-row class="d-flex justify-center align-center mx-auto mt-5 mt-lg-10">
    <v-col cols="12" lg="10" class="d-flex justify-space-between align-center">
      <div
        class="d-flex align-center justify-center justify-sm-start ga-2 ga-lg-5 mt-2 mt-lg-5"
      >
        <Animated_Text
          text="Oynayacağım Oyunlar"
          class="cursor-pointer"
          :msPerChar="50"
          :duration="550"
          :loop="true"
        />
      </div>

      <div class="d-flex align-center ga-1 ga-lg-2">
        <!-- View Selector -->
        <v-menu :close-on-content-click="true" :offset="[5, 10]" location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-if="!display.xs.value"
              v-bind="props"
              icon="mdi-view-module"
              class="rounded text-caption text-lg-subtitle-2"
              :ripple="false"
              variant="text"
              rounded="xl"
              color="grey-lighten-1"
              :size="display.smAndDown.value ? 'x-small' : 'small'"
            />
          </template>

          <v-card
            class="pa-1 pa-sm-2"
            :ripple="false"
            style="
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(0.5rem);
              -webkit-backdrop-filter: blur(0.5rem);
            "
            elevation="2"
          >
            <v-list density="compact" class="bg-transparent">
              <v-list-item @click="viewMode = 'card'" prepend-icon="mdi-view-grid">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Kart Görünümü</v-list-item-title
                >
              </v-list-item>

              <v-list-item @click="viewMode = 'list'" prepend-icon="mdi-view-list">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Liste Görünümü</v-list-item-title
                >
              </v-list-item>

              <v-list-item @click="viewMode = 'table'" prepend-icon="mdi-table">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tablo Görünümü</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <v-menu :close-on-content-click="true" :offset="[5, 10]" location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-if="!display.xs.value"
              v-bind="props"
              icon="mdi-sort"
              class="rounded text-caption text-lg-subtitle-2"
              :ripple="false"
              variant="text"
              rounded="xl"
              color="grey-lighten-1"
              :size="display.smAndDown.value ? 'x-small' : 'small'"
            />
          </template>

          <v-card
            class="pa-1 pa-sm-2"
            :ripple="false"
            style="
              background: rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.15);
              backdrop-filter: blur(0.5rem);
              -webkit-backdrop-filter: blur(0.5rem);
            "
            elevation="2"
          >
            <v-list density="compact" class="bg-transparent">
              <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tarihe Göre En Yeni</v-list-item-title
                >
              </v-list-item>

              <v-list-item
                @click="sortBy('old')"
                :ripple="false"
                prepend-icon="mdi-arrow-down"
              >
                <v-list-item-title
                  class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                  >Tarihe Göre En Eski</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>

        <v-btn
          icon="mdi-refresh"
          class="rounded text-caption text-lg-subtitle-2"
          :ripple="false"
          variant="text"
          rounded="xl"
          :color="isGettingToPlayGames ? 'green-accent-2' : 'grey-lighten-1'"
          @click="getToPlayGames"
          :size="smallScreen ? 'x-small' : 'small'"
          :loading="isGettingToPlayGames"
        />

        <v-btn
          :icon="bulkDeleteMode ? 'mdi-close' : 'mdi-checkbox-multiple-marked-outline'"
          class="rounded text-caption text-lg-subtitle-2"
          :ripple="false"
          variant="text"
          rounded="xl"
          :color="bulkDeleteMode ? 'error' : 'grey-lighten-1'"
          :size="smallScreen ? 'x-small' : 'small'"
          @click="toggleBulkMode"
        />

        <v-btn
          icon="mdi-plus"
          class="rounded text-caption text-lg-subtitle-2"
          :ripple="false"
          variant="text"
          rounded="xl"
          color="green-accent-2"
          @click="isAddGame = true"
          :size="smallScreen ? 'x-small' : 'small'"
        />
      </div>
    </v-col>

    <v-col cols="12" v-if="display.xs.value">
      <v-row dense>
        <v-col cols="6">
          <v-menu :close-on-content-click="true" :offset="[5, 0]" location="bottom end">
            <template #activator="{ props }">
              <v-btn
                prepend-icon="mdi-view-module"
                v-bind="props"
                class="text-caption text-lg-subtitle-2"
                :ripple="false"
                text="Görünüm"
                variant="tonal"
                rounded="xl"
                color="grey-lighten-1"
                size="small"
                block
              />
            </template>

            <v-card
              class="pa-1 pa-sm-2"
              :ripple="false"
              style="
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(0.5rem);
                -webkit-backdrop-filter: blur(0.5rem);
              "
              elevation="2"
            >
              <v-list density="compact" class="bg-transparent">
                <v-list-item @click="viewMode = 'card'" prepend-icon="mdi-view-grid">
                  <v-list-item-title
                    class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                    >Kart</v-list-item-title
                  >
                </v-list-item>

                <v-list-item @click="viewMode = 'list'" prepend-icon="mdi-view-list">
                  <v-list-item-title
                    class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                    >Liste</v-list-item-title
                  >
                </v-list-item>

                <v-list-item @click="viewMode = 'table'" prepend-icon="mdi-table">
                  <v-list-item-title
                    class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                    >Tablo</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-col>
        <v-col cols="6">
          <v-menu :close-on-content-click="true" :offset="[5, 0]" location="bottom end">
            <template #activator="{ props }">
              <v-btn
                prepend-icon="mdi-sort"
                v-bind="props"
                class="text-caption text-lg-subtitle-2"
                :ripple="false"
                text="Sırala"
                variant="tonal"
                rounded="xl"
                color="grey-lighten-1"
                size="small"
                block
              />
            </template>

            <v-card
              class="pa-1 pa-sm-2"
              :ripple="false"
              style="
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(0.5rem);
                -webkit-backdrop-filter: blur(0.5rem);
              "
              elevation="2"
            >
              <v-list density="compact" class="bg-transparent">
                <v-list-item @click="sortBy('new')" prepend-icon="mdi-arrow-up">
                  <v-list-item-title
                    class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                    >Tarihe Göre En Yeni</v-list-item-title
                  >
                </v-list-item>

                <v-list-item
                  @click="sortBy('old')"
                  :ripple="false"
                  prepend-icon="mdi-arrow-down"
                >
                  <v-list-item-title
                    class="text-caption text-sm-subtitle-2 text-grey-lighten-1"
                    >Tarihe Göre En Eski</v-list-item-title
                  >
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </v-col>
      </v-row>
    </v-col>

    <!-- 2026 Target Games Section - Mobile Add Button -->
    <v-col cols="12" v-if="display.xs.value">
      <v-btn
        @click="isAddGame2026 = true"
        class="rounded text-caption text-lg-subtitle-2"
        :ripple="false"
        variant="tonal"
        rounded="xl"
        color="green-accent-2"
        size="small"
        block
        prepend-icon="mdi-plus"
        text="2026 Hedef Oyunları Ekle"
      />
    </v-col>

    <!-- All To Play Games Section -->
    <v-col cols="12" lg="10">
      <div class="d-flex align-center ga-2 mb-3">
        <v-icon icon="mdi-gamepad-variant-outline" color="blue-grey-lighten-1" />
        <p
          class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
        >
          Tüm Oynayacaklarım ({{ toPlayGames.length }})
        </p>
      </div>

      <Admin_Bulk_Delete_Bar
        :active="bulkDeleteMode"
        :selected-count="selectedCount"
        :total-count="toPlayGames.length"
        @select-all="selectAll(toPlayGames)"
        @clear="clearSelection"
        @delete="openBulkDeleteDialog"
        @cancel="exitBulkMode"
      />

      <!-- Card View -->
      <Game_Card
        v-if="viewMode === 'card'"
        :loading="isGettingToPlayGames"
        :arr="toPlayGames"
        :onRowClick="handleRowClick"
        :bulk-delete-mode="bulkDeleteMode"
        :is-selected="isSelected"
        :on-toggle-select="toggleSelect"
      />

      <!-- List View -->
      <Admin_Game_List
        v-else-if="viewMode === 'list'"
        :loading="isGettingToPlayGames"
        :arr="toPlayGames"
        :on-delete-click="bulkDeleteMode ? undefined : handleDeleteGame"
        :on-row-click="handleRowClick"
        :bulk-delete-mode="bulkDeleteMode"
        :is-selected="isSelected"
        :on-toggle-select="toggleSelect"
      />

      <!-- Table View -->
      <Admin_Game_Table
        v-else
        :loading="isGettingToPlayGames"
        :arr="toPlayGames"
        :on-delete-click="handleDeleteGame"
        :on-row-click="handleRowClick"
        :bulk-delete-mode="bulkDeleteMode"
        :is-selected="isSelected"
        :on-toggle-select="toggleSelect"
      />
    </v-col>
  </v-row>

  <!-- Bulk Delete Confirmation -->
  <v-dialog
    v-model="isOpenBulkConfirmationDialog"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="delete-game-pop-up d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <p
        class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 default-title-letter text-grey-lighten-1"
      >
        {{ selectedCount }} oyunu veritabanından silmek istediğinden emin misin?
      </p>

      <v-divider color="white" class="w-100" />

      <div class="w-100" style="max-height: 200px; overflow-y: auto">
        <p
          v-for="game in bulkDeletePreviewGames"
          :key="game.firestoreId"
          class="text-caption text-grey-lighten-2 default-title-letter mb-1"
        >
          • {{ game.name }}
        </p>
      </div>

      <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
        <v-btn
          @click="isOpenBulkConfirmationDialog = false"
          :ripple="false"
          class="rounded"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          color="grey-lighten-2"
          variant="text"
          prepend-icon="mdi-close"
          text="İptal"
        />

        <v-btn
          @click="deleteSelectedGamesFromDb"
          :loading="isDeletingGameFromDb"
          :ripple="false"
          class="rounded"
          color="error"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          variant="tonal"
          prepend-icon="mdi-delete"
          text="Evet, sil"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Confirmation Pop Up -->
  <v-dialog
    v-model="isOpenConfirmationDialog"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="delete-game-pop-up d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <p
        class="text-subtitle-2 text-md-subtitle-1 text-xl-h5 default-title-letter text-grey-lighten-1"
      >
        Bu oyunu veri tabanından silmek istediğinden emin misin ?
      </p>

      <v-divider color="white" class="w-100" />

      <div class="d-flex flex-column align-start ga-1">
        <v-img :src="activeGame?.background_image" width="75" />
        <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1">
          {{
            `${activeGame?.name}
          (${new Date(activeGame?.released).getFullYear()})`
          }}
        </p>
        <p
          v-html="truncateText(activeGame?.description, 150)"
          class="text-caption text-grey-lighten-3"
        ></p>
      </div>

      <div class="w-100 d-flex align-center justify-end ga-1 mt-2">
        <v-btn
          @click="isOpenConfirmationDialog = false"
          :ripple="false"
          class="rounded"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          color="grey-lighten-2"
          variant="text"
          prepend-icon="mdi-close"
          text="Iptal"
        />

        <v-btn
          @click="
            deleteThisGameFromDb(
              activeGame?.firestoreId,
              activeGame?.collectionName || 'to_play_games'
            )
          "
          :loading="isDeletingGameFromDb"
          :ripple="false"
          class="rounded"
          color="error"
          :size="isExtraLargeScreen ? 'default' : 'small'"
          variant="tonal"
          prepend-icon="mdi-delete"
          text="Evet"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Game Detail Pop Up -->
  <v-dialog
    v-model="isOpenGameDetail"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.7rem);
      -webkit-backdrop-filter: blur(0.7rem);
    "
  >
    <div
      class="game-detail-pop-up d-flex flex-column align-start ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <v-btn
        @click="isOpenGameDetail = false"
        icon="mdi-close"
        color="grey-darken-1"
        class="close-btn ma-1"
        variant="text"
        size="small"
        :ripple="false"
      />

      <!-- Game Detail Header -->
      <div class="d-flex align-center ga-2">
        <v-img :src="activeGame?.background_image" width="75" class="rounded-lg" />
        <div class="d-flex flex-column align-start">
          <p
            class="text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-lighten-1 default-title-letter"
          >
            {{ activeGame?.name }}
          </p>
          <p
            class="text-caption text-xl-subtitle-2 text-grey-darken-1 default-title-letter"
          >
            {{ new Date(activeGame?.released).getFullYear() }}
          </p>
        </div>
      </div>

      <v-divider color="white" class="w-100" />

      <!-- Game Detail Body -->

      <!-- metacritic -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Metacritic"
        />

        <p
          class="text-caption text-lg-subtitle-2 default-title-letter"
          :class="`text-${useMetacriticStyle(activeGame?.metacritic).color}`"
        >
          {{ activeGame?.metacritic ?? "N/A" }}
        </p>
      </div>

      <!-- genres -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Genre"
        />

        <v-chip
          v-for="(genre, index) in activeGame?.genres"
          :key="index"
          :size="smallScreen ? 'x-small' : 'small'"
          color="green-accent-2"
          class="rounded-xl"
          variant="tonal"
          :ripple="false"
          :text="genre.name"
        />
      </div>

      <!-- Platforms -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Platform"
        />
        <template
          v-for="icon in getUniquePlatformIcons(activeGame?.platforms)"
          :key="icon"
        >
          <v-icon v-if="icon" size="small" color="grey-lighten-1" :icon="icon" />
        </template>
      </div>

      <!-- playtime -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Playtime"
        />

        <p
          class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
        >
          {{ activeGame?.playtime ? `${activeGame?.playtime} saat` : "N/A" }}
        </p>
      </div>

      <!-- Stores -->
      <div class="d-flex flex-wrap align-center ga-2">
        <v-chip
          size="small"
          :ripple="false"
          class="rounded default-title-letter"
          color="grey-darken-1"
          text="Store"
        />
        <template v-for="s in activeGame?.stores ?? []" :key="s.id">
          <v-chip
            :size="smallScreen ? 'x-small' : 'small'"
            :ripple="false"
            class="rounded default-title-letter"
            color="primary"
            :text="s.store.name"
          />
        </template>
      </div>

      <v-divider
        v-if="activeGame?.description?.length > 250"
        color="white"
        class="w-100"
      />

      <!-- description -->
      <p
        class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter"
        v-html="displayedDescription"
      ></p>

      <!-- toggle button -->
      <div
        v-if="activeGame?.description?.length > 250"
        class="d-flex align-center justify-end w-100"
      >
        <v-btn
          variant="text"
          size="small"
          :ripple="false"
          class="text-grey-lighten-1"
          @click="showFullDescription = !showFullDescription"
          :text="showFullDescription ? 'Daha az göster' : 'Açıklamanın tamamını oku'"
        />
      </div>
    </div>
  </v-dialog>

  <!-- Add Game -->
  <v-dialog
    v-model="isAddGame"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="add-game-pop-up d-flex flex-column align-center ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <v-btn
        @click="isAddGame = false"
        icon="mdi-close"
        color="grey-darken-1"
        class="close-btn ma-1"
        variant="text"
        size="small"
        :ripple="false"
      />

      <div class="d-flex justify-center align-center ga-2">
        <p
          class="text-center text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-darken-1 default-title-letter"
        >
          Oyun Ekle
        </p>
        <v-icon icon="mdi-plus" color="grey-darken-1" />
      </div>

      <v-text-field
        v-model="searchGameText"
        @input="searchGame"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        class="w-100 text-grey-lighten-1"
        color="grey-lighten-1"
        rounded="xl"
        label="Oyun Ara"
        placeholder="Black Myth Wukong..."
        :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
        clearable
      />

      <!-- 🔥 Arama sonuç alanı -->
      <div class="w-100" style="max-height: 350px; overflow-y: auto">
        <!-- Loading -->
        <div v-if="isSearchingGameLoading" class="d-flex justify-start py-2 py-lg-4">
          <v-progress-circular indeterminate size="24" color="grey-lighten-1" />
        </div>

        <!-- Search Results -->
        <template v-else>
          <p
            v-if="searchResults?.length"
            class="text-caption text-grey-darken-1 text-start default-title-letter"
          >
            {{ `${searchResults?.length} oyun bulundu` }}
          </p>
          <v-card
            v-for="game in searchResults"
            :key="game.id"
            :ripple="false"
            class="research-game pa-2 mb-2 d-flex align-center ga-3 rounded-lg cursor-pointer"
            @click="selectGameAfterSearch(game)"
            :class="{
              'selected-research-game': selectedGamesAfterResearch.some(
                (i) => i.id === game.id
              ),
            }"
          >
            <v-avatar :size="smallScreen ? 30 : 48" rounded>
              <v-img :src="game.background_image" :alt="game.name" cover />
            </v-avatar>

            <div class="d-flex flex-column">
              <p
                class="text-caption text-lg-subtitle-2 default-title-letter"
                :class="
                  selectedGamesAfterResearch.some((i) => i.id === game.id)
                    ? 'text-black'
                    : 'text-grey-lighten-1'
                "
              >
                {{ `${game.name}` }}
                <span v-if="game.released"
                  >({{ new Date(game.released).getFullYear() }})</span
                >
              </p>

              <p
                class="text-caption"
                :class="`text-${useMetacriticStyle(game?.metacritic).color}`"
              >
                Metacritic: {{ game.metacritic ?? "N/A" }}
              </p>
            </div>
          </v-card>

          <!-- No Result -->
          <p
            v-if="searchResults?.length === 0 && searchGameText?.length > 2"
            class="text-center text-grey-darken-1 mt-3"
          >
            Sonuç bulunamadı
          </p>
        </template>
      </div>

      <transition name="slide-up">
        <v-row
          v-if="selectedGamesAfterResearch?.length > 0"
          class="w-100 mx-auto d-flex align-center"
          dense
        >
          <v-col cols="12" sm="6">
            <v-btn
              @click="addGameToDb('to_play_games')"
              :loading="isAddingToDb"
              :text="`Oynayacaklarım'a Ekle (${selectedGamesAfterResearch?.length})`"
              size="small"
              :ripple="false"
              prepend-icon="mdi-plus"
              class="text-capitalize"
              block
              color="blue-grey-lighten-1"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-btn
              @click="selectedGamesAfterResearch = []"
              text="Tüm Seçimleri Kaldır"
              size="small"
              :ripple="false"
              class="text-capitalize"
              prepend-icon="mdi-broom"
              block
            />
          </v-col>
        </v-row>
      </transition>

      <transition name="slide-up">
        <v-row class="w-100" v-if="isAddedToDb">
          <v-col cols="12">
            <v-alert
              class="w-100 text-caption text-lg-subtitle-2"
              density="compact"
              color="success"
              variant="text"
              :text="`${addedGameToDbCount} oyun eklendi`"
            />
          </v-col>
        </v-row>
      </transition>
    </div>
  </v-dialog>

  <!-- Add Game 2026 -->
  <v-dialog
    v-model="isAddGame2026"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="add-game-pop-up d-flex flex-column align-center ga-2 ga-lg-4 rounded pa-2 pa-lg-5"
    >
      <v-btn
        @click="isAddGame2026 = false"
        icon="mdi-close"
        color="grey-darken-1"
        class="close-btn ma-1"
        variant="text"
        size="small"
        :ripple="false"
      />

      <div class="d-flex justify-center align-center ga-2">
        <p
          class="text-center text-subtitle-2 text-lg-subtitle-1 text-xl-h5 text-grey-darken-1 default-title-letter"
        >
          2026 Hedef Oyunları Ekle
        </p>
        <v-icon icon="mdi-calendar-check" color="green-accent-2" />
      </div>

      <v-text-field
        v-model="searchGameText2026"
        @input="searchGame2026"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        class="w-100 text-grey-lighten-1"
        color="grey-lighten-1"
        rounded="xl"
        label="Oyun Ara"
        placeholder="Black Myth Wukong..."
        :density="isExtraLargeScreen ? 'comfortable' : 'compact'"
        clearable
      />

      <!-- 🔥 Arama sonuç alanı -->
      <div class="w-100" style="max-height: 350px; overflow-y: auto">
        <!-- Loading -->
        <div v-if="isSearchingGameLoading2026" class="d-flex justify-start py-2 py-lg-4">
          <v-progress-circular indeterminate size="24" color="grey-lighten-1" />
        </div>

        <!-- Search Results -->
        <template v-else>
          <p
            v-if="searchResults2026?.length"
            class="text-caption text-grey-darken-1 text-start default-title-letter"
          >
            {{ `${searchResults2026?.length} oyun bulundu` }}
          </p>
          <v-card
            v-for="game in searchResults2026"
            :key="game.id"
            :ripple="false"
            class="research-game pa-2 mb-2 d-flex align-center ga-3 rounded-lg cursor-pointer"
            @click="selectGameAfterSearch2026(game)"
            :class="{
              'selected-research-game': selectedGamesAfterResearch2026.some(
                (i) => i.id === game.id
              ),
            }"
          >
            <v-avatar :size="smallScreen ? 30 : 48" rounded>
              <v-img :src="game.background_image" :alt="game.name" cover />
            </v-avatar>

            <div class="d-flex flex-column">
              <p
                class="text-caption text-lg-subtitle-2 default-title-letter"
                :class="
                  selectedGamesAfterResearch2026.some((i) => i.id === game.id)
                    ? 'text-black'
                    : 'text-grey-lighten-1'
                "
              >
                {{ `${game.name}` }}
                <span v-if="game.released"
                  >({{ new Date(game.released).getFullYear() }})</span
                >
              </p>

              <p
                class="text-caption"
                :class="`text-${useMetacriticStyle(game?.metacritic).color}`"
              >
                Metacritic: {{ game.metacritic ?? "N/A" }}
              </p>
            </div>
          </v-card>

          <!-- No Result -->
          <p
            v-if="searchResults2026?.length === 0 && searchGameText2026?.length > 2"
            class="text-center text-grey-darken-1 mt-3"
          >
            Sonuç bulunamadı
          </p>
        </template>
      </div>

      <transition name="slide-up">
        <v-row
          v-if="selectedGamesAfterResearch2026?.length > 0"
          class="w-100 mx-auto d-flex align-center"
          dense
        >
          <v-col cols="12" sm="6">
            <v-btn
              @click="addGameToDb2026"
              :loading="isAddingToDb2026"
              :text="`2026 Hedef'e Ekle (${selectedGamesAfterResearch2026?.length})`"
              size="small"
              :ripple="false"
              prepend-icon="mdi-calendar-check"
              class="text-capitalize"
              block
              color="green-accent-2"
            />
          </v-col>

          <v-col cols="12" sm="6">
            <v-btn
              @click="selectedGamesAfterResearch2026 = []"
              text="Tüm Seçimleri Kaldır"
              size="small"
              :ripple="false"
              class="text-capitalize"
              prepend-icon="mdi-broom"
              block
            />
          </v-col>
        </v-row>
      </transition>

      <transition name="slide-up">
        <v-row class="w-100" v-if="isAddedToDb2026">
          <v-col cols="12">
            <v-alert
              class="w-100 text-caption text-lg-subtitle-2"
              density="compact"
              color="success"
              variant="text"
              :text="`${addedGameToDbCount2026} oyun eklendi`"
            />
          </v-col>
        </v-row>
      </transition>
    </div>
  </v-dialog>

  <!-- Toast -->
  <v-dialog
    v-model="notificationModels.isAvailable"
    :max-width="600"
    style="
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(0.1rem);
      -webkit-backdrop-filter: blur(0.1rem);
    "
  >
    <div
      class="successfully-done-container d-flex flex-column align-center justify-center pa-5 rounded-xl"
    >
      <v-btn
        @click="notificationModels.isAvailable = false"
        class="close-icon-in-successfully-done-container ma-1 ma-lg-2"
        icon="mdi-close"
        :ripple="false"
        variant="text"
        color="grey-darken-1"
        size="small"
      />
      <v-img :src="successfullyDoneImg" :width="smallScreen ? 50 : 75" />
      <p
        class="text-subtitle-2 text-lg-subtitle-1 text-grey-lighten-1 default-title-letter"
      >
        {{ notificationModels?.msg }}
      </p>
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import axios from "axios";
import {
  doc,
  getDocs,
  collection,
  deleteDoc,
  addDoc,
  writeBatch,
} from "firebase/firestore";
import _ from "lodash";
import { truncateText } from "~/composables/core/basicFunc";
import {
  getUniquePlatformIcons,
  useMetacriticStyle,
} from "~/composables/data/handleData";
import successfullyDoneImg from "~/assets/img/successfully_done_anim.gif";
import Admin_Game_Table from "../common/Admin_Game_Table.vue";
import Admin_Game_List from "../common/Admin_Game_List.vue";
import Admin_Bulk_Delete_Bar from "../common/Admin_Bulk_Delete_Bar.vue";
import Game_Card from "../common/Game_Card.vue";
import Animated_Text from "../common/Animated_Text.vue";
import {
  useAdminBulkDelete,
  batchDeleteFromFirestore,
} from "~/composables/admin/useAdminBulkDelete";

const { $firestore } = useNuxtApp();

const display = useDisplay();
const smallScreen = computed(() => display.smAndDown.value);
const isExtraLargeScreen = computed(() => display.xlAndUp.value);

const TO_PLAY_COLLECTION = "to_play_games";

const {
  bulkDeleteMode,
  selectedCount,
  isSelected,
  toggleBulkMode,
  exitBulkMode,
  toggleSelect,
  selectAll,
  clearSelection,
  getSelectedFromList,
} = useAdminBulkDelete();

const isGettingToPlayGames = ref(false);
const isOpenConfirmationDialog = ref(false);
const isOpenBulkConfirmationDialog = ref(false);
const isOpenGameDetail = ref(false);
const isDeletingGameFromDb = ref(false);
const notificationModels = ref({
  isAvailable: false,
  msg: "",
});

const showFullDescription = ref(false);
const isAddGame = ref(false);
const isAddGame2026 = ref(false);
const isAddedToDb = ref(false);
const isAddedToDb2026 = ref(false);
const isSearchingGameLoading = ref(false);
const isSearchingGameLoading2026 = ref(false);
const isAddingToDb = ref(false);
const isAddingToDb2026 = ref(false);

const addedGameToDbCount = ref(0);
const addedGameToDbCount2026 = ref(0);
const toPlayGames = ref<any[]>([]);
const target2026Games = ref<any[]>([]);
const viewMode = ref<"card" | "list" | "table">("card");
const activeGame = ref<any | null>(null);
const selectedGamesAfterResearch = ref<any[]>([]);
const selectedGamesAfterResearch2026 = ref<any[]>([]);
const searchGameText = ref<string>("");
const searchGameText2026 = ref<string>("");
const searchResults = ref<any[]>([]);
const searchResults2026 = ref<any[]>([]);
const isGettingTarget2026Games = ref(false);

const displayedDescription = computed(() => {
  if (showFullDescription.value) return activeGame.value?.description;
  return truncateText(activeGame.value?.description, 250);
});

const bulkDeletePreviewGames = computed(() =>
  getSelectedFromList(toPlayGames.value).slice(0, 12)
);

const openBulkDeleteDialog = () => {
  if (selectedCount.value === 0) return;
  isOpenBulkConfirmationDialog.value = true;
};

const selectGameAfterSearch = (item: any) => {
  const exists = selectedGamesAfterResearch.value.some(
    (game: any) => game.id === item.id
  );

  if (exists) {
    selectedGamesAfterResearch.value = selectedGamesAfterResearch.value.filter(
      (game: any) => game.id !== item.id
    );
  } else {
    selectedGamesAfterResearch.value.push(item);
  }
};

const getToPlayGames = async () => {
  try {
    isGettingToPlayGames.value = true;

    const gamesCol = collection($firestore, "to_play_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    toPlayGames.value = gamesList;
  } catch (error) {
    console.error("Error getting games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingToPlayGames.value = false;
    }, 250);
  }
};

const getTarget2026Games = async () => {
  try {
    isGettingTarget2026Games.value = true;

    const gamesCol = collection($firestore, "target_2026_games");
    const gamesSnapshot = await getDocs(gamesCol);

    const gamesList = gamesSnapshot.docs.map((doc) => ({
      firestoreId: doc.id,
      ...doc.data(),
    }));

    target2026Games.value = gamesList;
  } catch (error) {
    console.error("Error getting target 2026 games :", error);
    return [];
  } finally {
    setTimeout(() => {
      isGettingTarget2026Games.value = false;
    }, 250);
  }
};

const handleRowClick = (item: any) => {
  activeGame.value = item;
  isOpenGameDetail.value = true;
};

const handleDeleteGame = (game: any) => {
  // Determine which collection the game belongs to
  const isTarget2026 = target2026Games.value.some(
    (g) => g.firestoreId === game.firestoreId
  );
  activeGame.value = {
    ...game,
    collectionName: isTarget2026 ? "target_2026_games" : "to_play_games",
  };
  isOpenConfirmationDialog.value = true;
};

const sendNotification = (msg: string) => {
  notificationModels.value.msg = msg;
  notificationModels.value.isAvailable = true;

  setTimeout(() => {
    notificationModels.value.isAvailable = false;
  }, 3500);
};

const deleteThisGameFromDb = async (
  firestoreId: string,
  collectionName: string = "to_play_games"
) => {
  try {
    isDeletingGameFromDb.value = true;

    await deleteDoc(doc($firestore, collectionName, firestoreId));

    console.log("The game deleted from DB :", firestoreId);
    sendNotification(`${activeGame.value?.name} adlı oyun veritabanından silindi!`);
  } catch (error) {
    console.error("Silme hatası:", error);
  } finally {
    isOpenConfirmationDialog.value = false;
    isDeletingGameFromDb.value = false;

    await getToPlayGames();
    await getTarget2026Games();
  }
};

const deleteSelectedGamesFromDb = async () => {
  const selected = getSelectedFromList(toPlayGames.value);
  if (!selected.length) return;

  try {
    isDeletingGameFromDb.value = true;
    const ids = selected.map((g) => g.firestoreId);
    await batchDeleteFromFirestore($firestore, TO_PLAY_COLLECTION, ids);
    sendNotification(`${ids.length} oyun veritabanından silindi!`);
  } catch (error) {
    console.error("Toplu silme hatası:", error);
  } finally {
    isOpenBulkConfirmationDialog.value = false;
    isDeletingGameFromDb.value = false;
    exitBulkMode();
    await getToPlayGames();
    await getTarget2026Games();
  }
};

const searchGame = async () => {
  try {
    if (searchGameText.value.length > 2) {
      isSearchingGameLoading.value = true;

      const { data } = await axios.get("/api/search-games", {
        params: {
          search: searchGameText.value,
        },
      });

      searchResults.value = data?.results ?? [];
    } else {
      searchResults.value = [];
    }
  } catch (error: any) {
    console.log(error.message);
  } finally {
    isSearchingGameLoading.value = false;
  }
};

const searchGame2026 = async () => {
  try {
    if (searchGameText2026.value.length > 2) {
      isSearchingGameLoading2026.value = true;

      const { data } = await axios.get("/api/search-games", {
        params: {
          search: searchGameText2026.value,
        },
      });

      searchResults2026.value = data?.results ?? [];
    } else {
      searchResults2026.value = [];
    }
  } catch (error: any) {
    console.log(error.message);
  } finally {
    isSearchingGameLoading2026.value = false;
  }
};

const selectGameAfterSearch2026 = (item: any) => {
  const exists = selectedGamesAfterResearch2026.value.some(
    (game: any) => game.id === item.id
  );

  if (exists) {
    selectedGamesAfterResearch2026.value = selectedGamesAfterResearch2026.value.filter(
      (game: any) => game.id !== item.id
    );
  } else {
    selectedGamesAfterResearch2026.value.push(item);
  }
};

const addGameToDb2026 = async () => {
  const games = selectedGamesAfterResearch2026.value;

  if (!games || games.length === 0) return;

  try {
    isAddingToDb2026.value = true;

    addedGameToDbCount2026.value = games.length;

    // 🔥 Single
    if (games.length === 1) {
      await addDoc(collection($firestore, "target_2026_games"), games[0]);
      console.log("Tek oyun eklendi:", games[0].name);
      isAddedToDb2026.value = true;

      setTimeout(() => {
        isAddedToDb2026.value = false;
      }, 2500);
    } else {
      // 🔥 Multiple
      const batch = writeBatch($firestore);

      games.forEach((g) => {
        const ref = doc(collection($firestore, "target_2026_games"));
        batch.set(ref, g);
      });

      await batch.commit();

      console.log(`${games.length} oyun toplu olarak eklendi`);
      isAddedToDb2026.value = true;

      setTimeout(() => {
        isAddedToDb2026.value = false;
      }, 2500);
    }
  } catch (error: any) {
    console.error("Error while add to db : ", error.message);
  } finally {
    await getTarget2026Games();
    isAddingToDb2026.value = false;
    selectedGamesAfterResearch2026.value = [];
    searchGameText2026.value = "";
    searchResults2026.value = [];
  }
};

const addGameToDb = async (collectionName: string = "to_play_games") => {
  const games = selectedGamesAfterResearch.value;

  if (!games || games.length === 0) return;

  try {
    isAddingToDb.value = true;

    addedGameToDbCount.value = games.length;

    // 🔥 Single
    if (games.length === 1) {
      await addDoc(collection($firestore, collectionName), games[0]);
      console.log("Tek oyun eklendi:", games[0].name);
      isAddedToDb.value = true;

      setTimeout(() => {
        isAddedToDb.value = false;
      }, 2500);
    } else {
      // 🔥 Multiple
      const batch = writeBatch($firestore);

      games.forEach((g) => {
        const ref = doc(collection($firestore, collectionName));
        batch.set(ref, g);
      });

      await batch.commit();

      console.log(`${games.length} oyun toplu olarak eklendi`);
      isAddedToDb.value = true;

      setTimeout(() => {
        isAddedToDb.value = false;
      }, 2500);
    }
  } catch (error: any) {
    console.error("Error while add to db : ", error.message);
  } finally {
    await getToPlayGames();
    await getTarget2026Games();
    isAddingToDb.value = false;
    selectedGamesAfterResearch.value = [];
  }
};

const sortGames = (games: any[], type: "new" | "old") => {
  if (!toPlayGames.value || toPlayGames.value?.length === 0) return [];

  const sorted = _.sortBy(toPlayGames.value, (game: any) => game?.released ?? 0);

  return type === "new" ? sorted.reverse() : sorted;
};

const sortBy = (mode: string) => {
  if (mode === "new") toPlayGames.value = sortGames(toPlayGames.value, "new");
  if (mode === "old") toPlayGames.value = sortGames(toPlayGames.value, "old");
};

watch(
  () => searchGameText.value,
  (val) => {
    if (!val || val.length < 2) {
      searchResults.value = [];
      isSearchingGameLoading.value = false;
      return;
    }
  },
  { immediate: true }
);

watch(
  () => searchGameText2026.value,
  (val) => {
    if (!val || val.length < 2) {
      searchResults2026.value = [];
      isSearchingGameLoading2026.value = false;
      return;
    }
  },
  { immediate: true }
);

onMounted(() => {
  getToPlayGames();
  getTarget2026Games();
});
</script>
<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/admin.css";
@import "~/assets/css/to_play_games.css";
</style>
