<template>
  <div class="section">
    <div class="inline" style="justify-content: space-between; width: 100%;">
      <h2>{{ copy.sections.costsCatalog }}</h2>
      <div class="toolbar">
        <button class="secondary" @click="$emit('add')">{{ copy.actions.addCustomCost }}</button>
        <button class="secondary" @click="$emit('reset')">{{ copy.actions.resetDefaults }}</button>
      </div>
    </div>
    <table class="table" style="margin-top: 12px;">
      <thead>
        <tr>
          <th>{{ copy.labels.enabled }}</th>
          <th>{{ copy.labels.name }}</th>
          <th>{{ copy.labels.category }}</th>
          <th>{{ copy.labels.annualAmount }}</th>
          <th>{{ copy.labels.description }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in costs" :key="item.id">
          <td>
            <input type="checkbox" :checked="item.enabled" @change="updateCost(item.id, { enabled: $event.target.checked })" />
          </td>
          <td>
            <input :value="item.name" @input="updateCost(item.id, { name: $event.target.value })" />
          </td>
          <td>
            <select :value="item.category" @change="updateCost(item.id, { category: $event.target.value })">
              <option value="tax">{{ copy.costCategories.tax }}</option>
              <option value="insurance">{{ copy.costCategories.insurance }}</option>
              <option value="maintenance">{{ copy.costCategories.maintenance }}</option>
              <option value="inspection">{{ copy.costCategories.inspection }}</option>
              <option value="utilities">{{ copy.costCategories.utilities }}</option>
              <option value="management">{{ copy.costCategories.management }}</option>
              <option value="capex_reserve">{{ copy.costCategories.capex_reserve }}</option>
              <option value="other">{{ copy.costCategories.other }}</option>
            </select>
          </td>
          <td>
            <input
              type="number"
              min="0"
              step="50"
              :value="item.amountAnnual"
              @input="updateCost(item.id, { amountAnnual: toNumber($event.target.value) })"
            />
          </td>
          <td>
            <input :value="item.description" @input="updateCost(item.id, { description: $event.target.value })" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  costs: {
    type: Array,
    required: true
  },
  copy: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:costs', 'add', 'reset']);

const updateCost = (id, patch) => {
  const next = props.costs.map((item) => (item.id === id ? { ...item, ...patch } : item));
  emit('update:costs', next);
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
</script>
