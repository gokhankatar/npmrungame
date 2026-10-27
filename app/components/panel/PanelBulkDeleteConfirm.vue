<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    count: number;
    loading?: boolean;
    /** Varsayılan: oyun */
    entityLabel?: string;
  }>(),
  {
    entityLabel: "oyun",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="440"
    scrim="rgba(0,0,0,0.85)"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="pbc d-flex flex-column ga-3 pa-5">
      <div class="d-flex align-center ga-3">
        <span class="pbc__icon">
          <v-icon icon="mdi-delete-outline" size="22" />
        </span>
        <div>
          <h3 class="pbc__title mb-0">
            Seçilen {{ props.entityLabel }}lar silinsin mi?
          </h3>
          <p class="pbc__sub mb-0">
            <strong>{{ count }}</strong>
            {{ props.entityLabel }} kalıcı olarak kaldırılacak.
          </p>
        </div>
      </div>

      <div class="d-flex justify-end ga-2 mt-2">
        <v-btn
          variant="text"
          color="grey-lighten-1"
          class="text-capitalize"
          :disabled="loading"
          text="Vazgeç"
          @click="emit('update:modelValue', false)"
        />
        <v-btn
          color="error"
          variant="flat"
          class="text-capitalize"
          prepend-icon="mdi-delete-outline"
          :loading="loading"
          :text="count > 0 ? `Sil (${count})` : 'Sil'"
          @click="emit('confirm')"
        />
      </div>
    </div>
  </v-dialog>
</template>

<style scoped>
.pbc {
  border-radius: 1rem;
  background: #12161d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.pbc__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.75rem;
  background: rgba(239, 83, 80, 0.14);
  color: #ef9a9a;
  flex-shrink: 0;
}

.pbc__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
}

.pbc__sub {
  margin-top: 0.25rem;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.4;
}
</style>
