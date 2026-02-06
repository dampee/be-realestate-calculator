<template>
  <div class="section">
    <h2>{{ copy.sections.purchaseInputs }}</h2>
    <div class="grid grid-2">
      <div>
        <label>{{ copy.labels.region }}</label>
        <select :value="state.region" @change="updateField('region', $event.target.value)">
          <option value="Vlaanderen">{{ copy.regions.vlaanderen }}</option>
          <option value="Brussel">{{ copy.regions.brussel }}</option>
          <option value="Wallonie">{{ copy.regions.wallonie }}</option>
        </select>
        <p v-if="state.region !== 'Vlaanderen'" class="helper">{{ copy.helpers.regionRate }}</p>
      </div>
      <div>
        <label>{{ copy.labels.purchasePrice }}</label>
        <input type="number" min="0" step="1000" :value="state.purchasePrice" @input="updateNumber('purchasePrice', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.renovationBudget }}</label>
        <input type="number" min="0" step="1000" :value="state.renovationOneOff" @input="updateNumber('renovationOneOff', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.loanToValue }}</label>
        <input type="number" min="0" step="0.01" :value="state.loanToValuePct" @input="updateNumber('loanToValuePct', $event.target.value)" />
        <p class="helper">{{ copy.helpers.loanToValueHint }}</p>
        <p class="helper">{{ formattedLoanMax }}</p>
      </div>
      <div>
        <label>{{ copy.labels.ownInvestment }}</label>
        <input type="number" min="0" step="1000" :value="state.ownInvestment" @input="updateNumber('ownInvestment', $event.target.value)" />
        <p class="helper">{{ formattedLoanAmount }}</p>
        <p v-if="isLoanTooHigh" class="helper">{{ copy.helpers.loanToValueExceeded }}</p>
      </div>
      <div>
        <label>{{ copy.labels.vacancyApartment }}</label>
        <input type="number" min="0" step="0.01" :value="state.vacancyRateApartment" @input="updateNumber('vacancyRateApartment', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.vacancyCommercial }}</label>
        <input type="number" min="0" step="0.01" :value="state.vacancyRateCommercial" @input="updateNumber('vacancyRateCommercial', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.targetNetYield }}</label>
        <input type="number" min="0" step="0.005" :value="state.targetNetYield" @input="updateNumber('targetNetYield', $event.target.value)" />
      </div>
    </div>

    <h3 style="margin-top: 16px;">{{ copy.sections.assumptions }}</h3>
    <div class="grid grid-2">
      <div>
        <label>{{ copy.labels.mortgageBasisFactor }}</label>
        <input type="number" min="0" step="0.01" :value="state.assumptions.mortgageBasisFactor" @input="updateAssumption('mortgageBasisFactor', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.notaryPurchaseFactor }}</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.notaryPurchaseFactor" @input="updateAssumption('notaryPurchaseFactor', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.purchaseFixedActCost }}</label>
        <input type="number" min="0" step="100" :value="state.assumptions.purchaseFixedActCost" @input="updateAssumption('purchaseFixedActCost', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.mortgageRegistrationRate }}</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.mortgageRegistrationRate" @input="updateAssumption('mortgageRegistrationRate', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.notaryLoanFactor }}</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.notaryLoanFactor" @input="updateAssumption('notaryLoanFactor', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.loanCostBufferPct }}</label>
        <input type="number" min="0" step="0.001" :value="state.assumptions.loanCostBufferPct" @input="updateAssumption('loanCostBufferPct', $event.target.value)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  state: {
    type: Object,
    required: true
  },
  copy: {
    type: Object,
    required: true
  },
  localeCode: {
    type: String,
    required: true
  },
  loanAmount: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:state']);

const formatCurrency = (value) => new Intl.NumberFormat(props.localeCode, { style: 'currency', currency: 'EUR' }).format(value ?? 0);
const maxLoanAmount = computed(() => props.state.purchasePrice * props.state.loanToValuePct);
const formattedLoanMax = computed(() => props.copy.helpers.loanToValueMax.replace('{amount}', formatCurrency(maxLoanAmount.value)));
const formattedLoanAmount = computed(() => props.copy.helpers.loanAmountCalculated.replace('{amount}', formatCurrency(props.loanAmount)));
const isLoanTooHigh = computed(() => props.loanAmount > maxLoanAmount.value && maxLoanAmount.value > 0);

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
