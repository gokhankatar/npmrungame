<template>
    <v-row>
        <v-col cols="12">
            <div class="d-flex flex column align-start ga-1 ga-lg-3">
                <p class="text-subtitle-2 text-lg-subtitle-1">Admin</p>

                <div class="d-flex align-center ga-2">
                    <v-chip :ripple="false" text="Son Giriş" color="grey" variant="tonal" rounded="xl" />
                    <p class="text-grey-lighten-1 text-caption text-lg-subtitle-2">{{
                        formatTR(_store.admin_user?.lastLoginAt as string) }}</p>
                </div>
            </div>
        </v-col>
    </v-row>
</template>
<script lang="ts" setup>
import { useTRFormat } from '~/composables/data/handleData';
import store from '~/store/store';

const _store = store();

const { formatTR } = useTRFormat()

</script>
<style scoped></style>