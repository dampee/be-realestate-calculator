<template>
  <div class="section">
    <div class="inline" style="justify-content: space-between; width: 100%;">
      <h2>{{ copy.sections.units }}</h2>
      <button class="secondary" @click="addUnit">{{ copy.actions.addUnit }}</button>
    </div>
    <table class="table" style="margin-top: 12px;">
      <thead>
        <tr>
          <th>{{ copy.labels.type }}</th>
          <th>{{ copy.labels.label }}</th>
          <th>{{ copy.labels.monthlyRent }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in units" :key="unit.id">
          <td>
            <select :value="unit.type" @change="updateUnit(unit.id, { type: $event.target.value })">
              <option value="apartment">{{ copy.unitTypes.apartment }}</option>
              <option value="commercial">{{ copy.unitTypes.commercial }}</option>
            </select>
          </td>
          <td>
            <input :value="unit.label" @input="updateUnit(unit.id, { label: $event.target.value })" :placeholder="copy.placeholders.unitLabel" />
          </td>
          <td>
            <input
              type="number"
              min="0"
              step="50"
              :value="unit.monthlyRent"
              @input="updateUnit(unit.id, { monthlyRent: toNumber($event.target.value) })"
            />
          </td>
          <td>
            <button class="secondary" @click="removeUnit(unit.id)">{{ copy.actions.remove }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  units: {
    type: Array,
    required: true
  },
  copy: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:units']);

const updateUnit = (id, patch) => {
  const next = props.units.map((unit) => (unit.id === id ? { ...unit, ...patch } : unit));
  emit('update:units', next);
};

const addUnit = () => {
  const newUnit = {
    id: `unit-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    type: 'apartment',
    label: '',
    monthlyRent: 0
  };
  emit('update:units', [...props.units, newUnit]);
};

const removeUnit = (id) => {
  emit('update:units', props.units.filter((unit) => unit.id !== id));
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
</script>
