<template>
  <div class="percent-field">
    <input
      type="text"
      inputmode="decimal"
      :value="displayValue"
      :min="min"
      :max="max"
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
  },
  min: {
    type: Number,
    default: undefined
  },
  max: {
    type: Number,
    default: undefined
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

const getLocaleNumberSeparators = (locale) => {
  const example = 12345.6;
  const parts = new Intl.NumberFormat(locale).formatToParts(example);
  let group = '';
  let decimal = '.';
  for (const part of parts) {
    if (part.type === 'group' && !group) {
      group = part.value;
    }
    if (part.type === 'decimal' && decimal === '.') {
      decimal = part.value;
    }
  }
  return { group, decimal };
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseValue = (raw) => {
  if (!raw) return 0;
  const { group, decimal } = getLocaleNumberSeparators(props.localeCode);
  let normalized = raw.replace(/\s/g, '').replace('%', '');

  if (group) {
    const groupRegex = new RegExp(escapeRegExp(group), 'g');
    normalized = normalized.replace(groupRegex, '');
  }

  if (decimal && decimal !== '.') {
    const decimalRegex = new RegExp(escapeRegExp(decimal), 'g');
    normalized = normalized.replace(decimalRegex, '.');
  }

  const parsed = Number(normalized);
  let fractional = Number.isFinite(parsed) ? parsed / 100 : 0;

  // Apply min/max constraints if specified
  if (props.min !== undefined && fractional < props.min) {
    fractional = props.min;
  }
  if (props.max !== undefined && fractional > props.max) {
    fractional = props.max;
  }

  return fractional;
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
