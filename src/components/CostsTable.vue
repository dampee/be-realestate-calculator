<template>
  <div class="section">
    <div class="inline" style="justify-content: space-between; width: 100%;">
      <h2>Costs Catalog</h2>
      <div class="toolbar">
        <button class="secondary" @click="$emit('add')">Add custom cost</button>
        <button class="secondary" @click="$emit('reset')">Reset to defaults</button>
      </div>
    </div>
    <table class="table" style="margin-top: 12px;">
      <thead>
        <tr>
          <th>Enabled</th>
          <th>Name</th>
          <th>Category</th>
          <th>Annual Amount</th>
          <th>Description</th>
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
              <option value="tax">Tax</option>
              <option value="insurance">Insurance</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="utilities">Utilities</option>
              <option value="management">Management</option>
              <option value="capex_reserve">Capex reserve</option>
              <option value="other">Other</option>
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
