<template>
    <v-data-table :items="arr" :headers="header_games" :loading="loading" class="admin-data-table rounded-lg w-100"
        :items-per-page-text="display.smAndDown.value ? 'Oyun Sayısı' : 'Sayfa Başı Oyun Sayısı'"
        :hide-default-header="display.smAndDown.value" hover>
        <template #item="{ item, index }">

            <!-- Small Screen -->
            <template v-if="display.smAndDown.value">
                <tr class="table-row cursor-pointer" @click="onRowClick(item)">
                    <td>
                        <div class="d-flex flex-column align-start ga-1 ga-sm-2 py-1">
                            <img :src="item.background_image" :width="display.smAndDown.value ? 30 : 60"
                                class="rounded-lg h-100" cover />
                            <p class="text-caption text-sm-subtitle-2 text-grey-lighten-1 default-title-letter">
                                {{ item.name }}
                            </p>

                            <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                                {{ new Date(item.released).getFullYear() }}
                            </p>

                            <div class="d-flex align-center ga-1 flex-wrap py-1">
                                <v-chip v-for="(genre, index) in item.genres" :key="index" size="x-small"
                                    color="green-accent-2" variant="tonal" :ripple="false"
                                    :text="truncateText(genre.name, 22)" />
                            </div>

                            <div class="d-flex align-center flex-wrap ga-1">
                                <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
                                    <v-icon v-if="icon" size="x-small" color="grey-lighten-1" :icon="icon" />
                                </template>
                            </div>

                            <v-chip :ripple="false" class="rounded" size="x-small" :color="item.metacritic ? useMetacriticStyle(item?.metacritic).color : 'warning'
                                " :text="item.metacritic ? `Metacritic ${item.metacritic}` : 'N/A'" />
                        </div>
                    </td>
                </tr>
            </template>

            <!-- Large Screen -->
            <template v-else>
                <tr class="table-row cursor-pointer" @click="onRowClick(item)">
                    <td>
                        <div class="d-flex align-center ga-1 ga-lg-2 py-2">
                            <img :src="item.background_image" :width="display.smAndDown.value ? 30 : 60"
                                class="rounded-lg h-100" cover />
                            <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                                {{ item.name }}
                            </p>
                        </div>
                    </td>

                    <td>
                        <p class="text-caption text-lg-subtitle-2 text-grey-lighten-1 default-title-letter">
                            {{ new Date(item.released).getFullYear() }}
                        </p>
                    </td>

                    <td>
                        <div class="d-flex align-center ga-1 flex-wrap py-1">
                            <v-chip v-for="(genre, index) in item.genres" :key="index" size="x-small"
                                color="green-accent-2" variant="tonal" :ripple="false" :text="genre.name" />
                        </div>
                    </td>

                    <td>
                        <div class="d-flex align-center flex-wrap ga-1">
                            <template v-for="icon in getUniquePlatformIcons(item.platforms)" :key="icon">
                                <v-icon v-if="icon" size="small" color="grey-lighten-1" :icon="icon" />
                            </template>
                        </div>
                    </td>

                    <td>
                        <v-chip :ripple="false" size="small" :color="item.metacritic ? useMetacriticStyle(item?.metacritic).color : 'warning'
                            " :text="item.metacritic ?? 'N/A'" />
                    </td>

                    <td>
                        <v-btn @click.stop="onDeleteClick(item)" variant="tonal" prepend-icon="mdi-delete"
                            class="text-caption text-lg-subtitle-2 default-title-letter rounded-xl" text="Sil"
                            color="error" block />
                    </td>
                </tr>
            </template>
        </template>

        <!-- Loading -->
        <template #loading>
            <v-skeleton-loader class="bg-transparent" :type="arr.length > 10
                ? 'table-row@10'
                : `table-row@${arr.length}`
                " />
        </template>
    </v-data-table>
</template>
<script lang="ts" setup>
import { truncateText } from '~/composables/core/basicFunc';
import { getUniquePlatformIcons, useMetacriticStyle } from '~/composables/data/handleData';
import { header_games } from '~/composables/data/headerTables';

defineProps<{
    arr: any[];
    loading: boolean;
    onDeleteClick: (item: any) => void;
    onRowClick: (item: any) => void;
}>();

const display = useDisplay();
</script>

<style scoped>
@import "~/assets/css/main.css";
@import "~/assets/css/admin.css";
@import "~/assets/css/completed_games.css";
</style>