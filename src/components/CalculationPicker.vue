<template>
  <div class="section">
    <div class="inline" style="justify-content: space-between; width: 100%;">
      <h2>{{ copy.sections.calculationPicker }}</h2>
      <div class="toolbar">
        <button class="secondary" @click="$emit('new')">{{ copy.actions.new }}</button>
        <button @click="$emit('save')">{{ copy.actions.save }}</button>
        <button class="secondary" @click="$emit('duplicate')">{{ copy.actions.duplicate }}</button>
        <button class="danger" @click="$emit('delete')" :disabled="!activeId">{{ copy.actions.delete }}</button>
        <button class="secondary" @click="$emit('share')">{{ copy.actions.share }}</button>
        <button class="secondary" @click="$emit('reset')">{{ copy.actions.reset }}</button>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top: 16px;">
      <div>
        <label>{{ copy.labels.savedCalculations }}</label>
        <select :value="activeId" @change="$emit('select', $event.target.value)">
          <option value="" disabled>{{ copy.labels.selectCalculation }}</option>
          <option v-for="calc in calculations" :key="calc.calculationId" :value="calc.calculationId">
            {{ calc.address }} — {{ formatDate(calc.updatedAt) }}
          </option>
        </select>
      </div>
      <div>
        <label>{{ copy.labels.addressUnique }}</label>
        <input :value="address" @input="$emit('update:address', $event.target.value)" :placeholder="copy.placeholders.address" />
        <p v-if="error" class="error">{{ error }}</p>
      </div>
      <div>
        <label>{{ copy.labels.notes }}</label>
        <textarea :value="notes" @input="$emit('update:notes', $event.target.value)"></textarea>
      </div>
      <div>
        <label>{{ copy.labels.metadata }}</label>
        <p class="helper">{{ copy.labels.created }}: {{ createdAt ? formatDate(createdAt) : '—' }}</p>
        <p class="helper">{{ copy.labels.updated }}: {{ updatedAt ? formatDate(updatedAt) : '—' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  calculations: {
    type: Array,
    required: true
  },
  activeId: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  copy: {
    type: Object,
    required: true
  },
  localeCode: {
    type: String,
    required: true
  }
});

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat(props.localeCode, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
</script>
