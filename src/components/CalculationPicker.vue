<template>
  <div class="section">
    <div class="inline" style="justify-content: space-between; width: 100%;">
      <h2>Calculation Picker</h2>
      <div class="toolbar">
        <button class="secondary" @click="$emit('new')">New</button>
        <button @click="$emit('save')">Save</button>
        <button class="secondary" @click="$emit('duplicate')">Duplicate</button>
        <button class="danger" @click="$emit('delete')" :disabled="!activeId">Delete</button>
        <button class="secondary" @click="$emit('share')">Share current</button>
        <button class="secondary" @click="$emit('reset')">Reset all</button>
      </div>
    </div>

    <div class="grid grid-2" style="margin-top: 16px;">
      <div>
        <label>Saved calculations</label>
        <select :value="activeId" @change="$emit('select', $event.target.value)">
          <option value="" disabled>Select a calculation</option>
          <option v-for="calc in calculations" :key="calc.calculationId" :value="calc.calculationId">
            {{ calc.address }} — {{ formatDate(calc.updatedAt) }}
          </option>
        </select>
      </div>
      <div>
        <label>Address (unique)</label>
        <input :value="address" @input="$emit('update:address', $event.target.value)" placeholder="e.g., Rue de la Loi 10" />
        <p v-if="error" class="error">{{ error }}</p>
      </div>
      <div>
        <label>Notes</label>
        <textarea :value="notes" @input="$emit('update:notes', $event.target.value)"></textarea>
      </div>
      <div>
        <label>Metadata</label>
        <p class="helper">Created: {{ createdAt ? formatDate(createdAt) : '—' }}</p>
        <p class="helper">Updated: {{ updatedAt ? formatDate(updatedAt) : '—' }}</p>
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
  }
});

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('nl-BE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
</script>
