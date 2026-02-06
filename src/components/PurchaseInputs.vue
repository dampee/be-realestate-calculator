<template>
  <div class="section">
    <h2>Purchase Inputs</h2>
    <div class="grid grid-2">
      <div>
        <label>Region</label>
        <select :value="state.region" @change="updateField('region', $event.target.value)">
          <option value="Vlaanderen">Vlaanderen</option>
          <option value="Brussel">Brussel</option>
          <option value="Wallonie">Wallonie</option>
        </select>
        <p v-if="state.region !== 'Vlaanderen'" class="helper">Registration rate is approximate; verify exact rate.</p>
      </div>
      <div>
        <label>Purchase price (€)</label>
        <input type="number" min="0" step="1000" :value="state.purchasePrice" @input="updateNumber('purchasePrice', $event.target.value)" />
      </div>
      <div>
        <label>Renovation budget (one-off)</label>
        <input type="number" min="0" step="1000" :value="state.renovationOneOff" @input="updateNumber('renovationOneOff', $event.target.value)" />
      </div>
      <div>
        <label>Loan amount (optional)</label>
        <input type="number" min="0" step="1000" :value="state.loanAmount" @input="updateNumber('loanAmount', $event.target.value)" />
      </div>
      <div>
        <label>Vacancy rate (apartment)</label>
        <input type="number" min="0" step="0.01" :value="state.vacancyRateApartment" @input="updateNumber('vacancyRateApartment', $event.target.value)" />
      </div>
      <div>
        <label>Vacancy rate (commercial)</label>
        <input type="number" min="0" step="0.01" :value="state.vacancyRateCommercial" @input="updateNumber('vacancyRateCommercial', $event.target.value)" />
      </div>
      <div>
        <label>Target net yield</label>
        <input type="number" min="0" step="0.005" :value="state.targetNetYield" @input="updateNumber('targetNetYield', $event.target.value)" />
      </div>
    </div>

    <h3 style="margin-top: 16px;">Assumptions</h3>
    <div class="grid grid-2">
      <div>
        <label>Mortgage basis factor</label>
        <input type="number" min="0" step="0.01" :value="state.assumptions.mortgageBasisFactor" @input="updateAssumption('mortgageBasisFactor', $event.target.value)" />
      </div>
      <div>
        <label>Notary purchase factor</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.notaryPurchaseFactor" @input="updateAssumption('notaryPurchaseFactor', $event.target.value)" />
      </div>
      <div>
        <label>Purchase fixed act cost</label>
        <input type="number" min="0" step="100" :value="state.assumptions.purchaseFixedActCost" @input="updateAssumption('purchaseFixedActCost', $event.target.value)" />
      </div>
      <div>
        <label>Mortgage registration rate</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.mortgageRegistrationRate" @input="updateAssumption('mortgageRegistrationRate', $event.target.value)" />
      </div>
      <div>
        <label>Notary loan factor</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.notaryLoanFactor" @input="updateAssumption('notaryLoanFactor', $event.target.value)" />
      </div>
      <div>
        <label>Loan cost buffer (%)</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.loanCostBufferPct" @input="updateAssumption('loanCostBufferPct', $event.target.value)" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  state: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:state']);

const updateField = (key, value) => {
  emit('update:state', { ...props.state, [key]: value });
};

const updateNumber = (key, value) => {
  const parsed = Number(value);
  emit('update:state', { ...props.state, [key]: Number.isFinite(parsed) ? parsed : 0 });
};

const updateAssumption = (key, value) => {
  const parsed = Number(value);
  emit('update:state', {
    ...props.state,
    assumptions: {
      ...props.state.assumptions,
      [key]: Number.isFinite(parsed) ? parsed : 0
    }
  });
};
</script>
