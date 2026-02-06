<template>
  <div class="percent-field">
    <input
      type="text"
      inputmode="decimal"
      :value="displayValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <span class="suffix" aria-hidden="true">%</span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  localeCode: {
    type: String,
    required: true
  },
  maxFractionDigits: {
    type: Number,
    default: 2
  }
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);

const formatValue = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  const percentValue = value * 100;
  return new Intl.NumberFormat(props.localeCode, {
    minimumFractionDigits: 0,
    maximumFractionDigits: props.maxFractionDigits
  }).format(percentValue);
};

const displayValue = ref(formatValue(props.modelValue));

watch(
  () => props.modelValue,
  (next) => {
    if (!isFocused.value) {
      displayValue.value = formatValue(next);
    }
  }
);

watch(
  () => [props.localeCode, props.maxFractionDigits],
  () => {
    // Reformat display value when locale or formatting options change
    displayValue.value = formatValue(props.modelValue);
  }
);
const parseValue = (raw) => {
  if (!raw) return 0;
  const normalized = raw.replace(/\s/g, '').replace('%', '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed / 100 : 0;
};

const handleInput = (event) => {
  displayValue.value = event.target.value;
  emit('update:modelValue', parseValue(event.target.value));
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleBlur = () => {
  isFocused.value = false;
  displayValue.value = formatValue(props.modelValue);
};
</script>
