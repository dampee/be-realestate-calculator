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
        <PercentInput
          :model-value="state.loanToValuePct"
          :locale-code="localeCode"
          :max-fraction-digits="2"
          :min="0"
          @update:modelValue="updateNumber('loanToValuePct', $event)"
        />
        <p class="helper">{{ copy.helpers.loanToValueHint }}</p>
        <p class="helper">{{ formattedLoanMax }}</p>
      </div>
      <div>
        <label>{{ copy.labels.loanAmount }}</label>
        <input type="number" min="0" step="1000" :value="state.loanAmount" @input="updateNumber('loanAmount', $event.target.value)" />
        <p v-if="isLoanTooHigh" class="helper">{{ copy.helpers.loanToValueExceeded }}</p>
      </div>
      <div>
        <label>{{ copy.labels.targetNetYield }}</label>
        <PercentInput
          :model-value="state.targetNetYield"
          :locale-code="localeCode"
          :max-fraction-digits="3"
          :min="0"
          @update:modelValue="updateNumber('targetNetYield', $event)"
        />
      </div>
    </div>

    <h3 style="margin-top: 16px;">{{ copy.sections.assumptions }}</h3>
    <div class="grid grid-2">
      <div>
        <label>{{ copy.labels.mortgageBasisFactor }}</label>
        <PercentInput
          :model-value="state.assumptions.mortgageBasisFactor"
          :locale-code="localeCode"
          :max-fraction-digits="2"
          :min="0"
          @update:modelValue="updateAssumption('mortgageBasisFactor', $event)"
        />
      </div>
      <div>
        <label>{{ copy.labels.notaryPurchaseFactor }}</label>
        <PercentInput
          :model-value="state.assumptions.notaryPurchaseFactor"
          :locale-code="localeCode"
          :max-fraction-digits="3"
          :min="0"
          @update:modelValue="updateAssumption('notaryPurchaseFactor', $event)"
        />
      </div>
      <div>
        <label>{{ copy.labels.purchaseFixedActCost }}</label>
        <input type="number" min="0" step="100" :value="state.assumptions.purchaseFixedActCost" @input="updateAssumption('purchaseFixedActCost', $event.target.value)" />
      </div>
      <div>
        <label>{{ copy.labels.mortgageRegistrationRate }}</label>
        <PercentInput
          :model-value="state.assumptions.mortgageRegistrationRate"
          :locale-code="localeCode"
          :max-fraction-digits="3"
          :min="0"
          @update:modelValue="updateAssumption('mortgageRegistrationRate', $event)"
        />
      </div>
      <div>
        <label>{{ copy.labels.notaryLoanFactor }}</label>
        <PercentInput
          :model-value="state.assumptions.notaryLoanFactor"
          :locale-code="localeCode"
          :max-fraction-digits="3"
          :min="0"
          @update:modelValue="updateAssumption('notaryLoanFactor', $event)"
        />
      </div>
      <div>
        <label>{{ copy.labels.loanCostBufferPct }}</label>
        <PercentInput
          :model-value="state.assumptions.loanCostBufferPct"
          :locale-code="localeCode"
          :max-fraction-digits="3"
          :min="0"
          @update:modelValue="updateAssumption('loanCostBufferPct', $event)"
        />
      </div>
      <div>
        <label>{{ copy.labels.vacancyApartment }}</label>
        <PercentInput
          :model-value="state.vacancyRateApartment"
          :locale-code="localeCode"
          :max-fraction-digits="2"
          :min="0"
          @update:modelValue="updateNumber('vacancyRateApartment', $event)"
        />
      </div>
      <div>
        <label>{{ copy.labels.vacancyCommercial }}</label>
        <PercentInput
          :model-value="state.vacancyRateCommercial"
          :locale-code="localeCode"
          :max-fraction-digits="2"
          :min="0"
          @update:modelValue="updateNumber('vacancyRateCommercial', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import PercentInput from './PercentInput.vue';
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
  }
});

const emit = defineEmits(['update:state']);

const formatCurrency = (value) => new Intl.NumberFormat(props.localeCode, { style: 'currency', currency: 'EUR' }).format(value ?? 0);
const maxLoanAmount = computed(() => props.state.purchasePrice * props.state.loanToValuePct);
const formattedLoanMax = computed(() => props.copy.helpers.loanToValueMax.replace('{amount}', formatCurrency(maxLoanAmount.value)));
const isLoanTooHigh = computed(() => props.state.loanAmount > maxLoanAmount.value && maxLoanAmount.value > 0);

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
