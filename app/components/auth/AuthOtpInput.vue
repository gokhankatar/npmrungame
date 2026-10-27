<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string;
    length?: number;
    disabled?: boolean;
    id?: string;
  }>(),
  {
    length: 6,
    disabled: false,
    id: "otp",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  complete: [value: string];
}>();

const digits = ref<string[]>(
  Array.from({ length: props.length }, (_, i) => props.modelValue[i] || "")
);
const inputs = ref<(HTMLInputElement | null)[]>([]);

watch(
  () => props.modelValue,
  (val) => {
    const next = Array.from({ length: props.length }, (_, i) => val[i] || "");
    if (next.join("") !== digits.value.join("")) {
      digits.value = next;
    }
  }
);

function sync() {
  const code = digits.value.join("");
  emit("update:modelValue", code);
  if (code.length === props.length && /^\d+$/.test(code)) {
    emit("complete", code);
  }
}

function setDigit(index: number, value: string) {
  const digit = value.replace(/\D/g, "").slice(-1);
  digits.value[index] = digit;
  sync();
  if (digit && index < props.length - 1) {
    inputs.value[index + 1]?.focus();
    inputs.value[index + 1]?.select();
  }
}

function onKeydown(index: number, e: KeyboardEvent) {
  if (e.key === "Backspace") {
    if (digits.value[index]) {
      digits.value[index] = "";
      sync();
      return;
    }
    if (index > 0) {
      e.preventDefault();
      digits.value[index - 1] = "";
      sync();
      inputs.value[index - 1]?.focus();
    }
    return;
  }
  if (e.key === "ArrowLeft" && index > 0) {
    e.preventDefault();
    inputs.value[index - 1]?.focus();
  }
  if (e.key === "ArrowRight" && index < props.length - 1) {
    e.preventDefault();
    inputs.value[index + 1]?.focus();
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault();
  const pasted = (e.clipboardData?.getData("text") || "")
    .replace(/\D/g, "")
    .slice(0, props.length);
  if (!pasted) return;
  digits.value = Array.from({ length: props.length }, (_, i) => pasted[i] || "");
  sync();
  const focusAt = Math.min(pasted.length, props.length - 1);
  inputs.value[focusAt]?.focus();
}

function setInputRef(el: unknown, index: number) {
  inputs.value[index] = (el as HTMLInputElement) || null;
}

onMounted(() => {
  nextTick(() => inputs.value[0]?.focus());
});
</script>

<template>
  <div
    class="auth-otp"
    role="group"
    :aria-label="id"
    @paste="onPaste"
  >
    <input
      v-for="(_, i) in length"
      :id="i === 0 ? id : undefined"
      :key="i"
      :ref="(el) => setInputRef(el, i)"
      class="auth-otp__cell"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="1"
      pattern="[0-9]"
      :disabled="disabled"
      :aria-label="`Kod ${i + 1}`"
      :value="digits[i]"
      @input="setDigit(i, ($event.target as HTMLInputElement).value)"
      @keydown="onKeydown(i, $event)"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>

<style scoped>
.auth-otp {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.45rem;
  width: 100%;
}

.auth-otp__cell {
  width: 100%;
  aspect-ratio: 1 / 1.1;
  max-height: 3.35rem;
  box-sizing: border-box;
  border-radius: 0.85rem;
  border: 1.5px solid rgb(203 213 225 / 0.95);
  background: rgb(255 255 255 / 0.9);
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: center;
  letter-spacing: 0;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.06);
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.12s ease,
    background 0.15s ease;
}

:global(.auth-screen[data-theme="dark"]) .auth-otp__cell {
  border-color: rgb(255 255 255 / 0.14);
  background: rgb(30 41 59 / 0.85);
  color: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.18);
}

.auth-otp__cell:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgb(16 185 129 / 0.28);
  transform: translateY(-1px);
}

:global(.auth-screen[data-theme="dark"]) .auth-otp__cell:focus {
  border-color: #69f0ae;
  box-shadow: 0 0 0 3px rgb(105 240 174 / 0.28);
}

.auth-otp__cell:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 380px) {
  .auth-otp {
    gap: 0.3rem;
  }

  .auth-otp__cell {
    font-size: 1.15rem;
    border-radius: 0.7rem;
  }
}
</style>
