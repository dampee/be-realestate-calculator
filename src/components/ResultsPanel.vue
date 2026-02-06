<template>
  <div class="section">
    <h2>{{ copy.sections.results }}</h2>
    <div class="results">
      <div class="card">
        <h3>{{ copy.results.incomeNoi }}</h3>
        <div class="result-row"><span>{{ copy.results.netRent }}</span><strong>{{ formatCurrency(results.totalNetRent) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.opEx }}</span><strong>{{ formatCurrency(results.opEx) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.capexReserves }}</span><strong>{{ formatCurrency(results.capexReserves) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.noi }}</span><strong>{{ formatCurrency(results.noi) }}</strong></div>
      </div>

      <div class="card">
        <h3>{{ copy.results.purchaseCosts }}</h3>
        <div class="result-row"><span>{{ copy.results.registration }}</span><strong>{{ formatCurrency(results.purchaseCosts.registration) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.notaryPurchase }}</span><strong>{{ formatCurrency(results.purchaseCosts.notaryPurchase) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.fixedAct }}</span><strong>{{ formatCurrency(results.purchaseCosts.fixedAct) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.totalPurchaseCosts }}</span><strong>{{ formatCurrency(results.purchaseCosts.total) }}</strong></div>
      </div>

      <div class="card">
        <h3>{{ copy.results.investmentYield }}</h3>
        <div class="result-row"><span>{{ copy.results.totalInvestmentExclLoan }}</span><strong>{{ formatCurrency(results.totalInvestmentExclLoanCosts) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.netYield }}</span><strong>{{ formatPercent(results.netYield) }}</strong></div>
      </div>

      <div class="card">
        <h3>{{ copy.results.maxBid }}</h3>
        <div class="result-row"><span>{{ copy.results.maxPurchasePrice }}</span><strong>{{ results.maxBid.display }}</strong></div>
        <div class="result-row"><span>{{ copy.results.maxWithLoanBuffer }}</span><strong>{{ results.maxBid.bufferedDisplay }}</strong></div>
      </div>

      <div v-if="results.loanCosts" class="card">
        <h3>{{ copy.results.mortgageCosts }}</h3>
        <div class="result-row"><span>{{ copy.results.mortgageBasis }}</span><strong>{{ formatCurrency(results.loanCosts.mortgageBasis) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.mortgageRegistration }}</span><strong>{{ formatCurrency(results.loanCosts.mortgageRegistration) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.notaryLoan }}</span><strong>{{ formatCurrency(results.loanCosts.notaryLoan) }}</strong></div>
        <div class="result-row"><span>{{ copy.results.totalLoanCosts }}</span><strong>{{ formatCurrency(results.loanCosts.totalLoanCosts) }}</strong></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  results: {
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

const formatCurrency = (value) =>
  new Intl.NumberFormat(props.localeCode, { style: 'currency', currency: 'EUR' }).format(value ?? 0);

const formatPercent = (value) => {
  if (!Number.isFinite(value)) return props.copy.results.notAvailable;
  return new Intl.NumberFormat(props.localeCode, { style: 'percent', maximumFractionDigits: 2 }).format(value);
};
</script>
