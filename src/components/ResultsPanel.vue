<template>
  <div class="section">
    <h2>Results</h2>
    <div class="results">
      <div class="card">
        <h3>Income & NOI</h3>
        <div class="result-row"><span>Net rent (after vacancy)</span><strong>{{ formatCurrency(results.totalNetRent) }}</strong></div>
        <div class="result-row"><span>OpEx (excl. capex)</span><strong>{{ formatCurrency(results.opEx) }}</strong></div>
        <div class="result-row"><span>CapEx reserves</span><strong>{{ formatCurrency(results.capexReserves) }}</strong></div>
        <div class="result-row"><span>NOI</span><strong>{{ formatCurrency(results.noi) }}</strong></div>
      </div>

      <div class="card">
        <h3>Purchase costs</h3>
        <div class="result-row"><span>Registration</span><strong>{{ formatCurrency(results.purchaseCosts.registration) }}</strong></div>
        <div class="result-row"><span>Notary purchase</span><strong>{{ formatCurrency(results.purchaseCosts.notaryPurchase) }}</strong></div>
        <div class="result-row"><span>Fixed act</span><strong>{{ formatCurrency(results.purchaseCosts.fixedAct) }}</strong></div>
        <div class="result-row"><span>Total purchase costs</span><strong>{{ formatCurrency(results.purchaseCosts.total) }}</strong></div>
      </div>

      <div class="card">
        <h3>Investment & Yield</h3>
        <div class="result-row"><span>Total investment (excl. loan costs)</span><strong>{{ formatCurrency(results.totalInvestmentExclLoanCosts) }}</strong></div>
        <div class="result-row"><span>Net yield</span><strong>{{ formatPercent(results.netYield) }}</strong></div>
      </div>

      <div class="card">
        <h3>Max bid</h3>
        <div class="result-row"><span>Max purchase price (target yield)</span><strong>{{ results.maxBid.display }}</strong></div>
        <div class="result-row"><span>Max with loan buffer</span><strong>{{ results.maxBid.bufferedDisplay }}</strong></div>
      </div>

      <div v-if="results.loanCosts" class="card">
        <h3>Mortgage costs</h3>
        <div class="result-row"><span>Mortgage basis</span><strong>{{ formatCurrency(results.loanCosts.mortgageBasis) }}</strong></div>
        <div class="result-row"><span>Mortgage registration</span><strong>{{ formatCurrency(results.loanCosts.mortgageRegistration) }}</strong></div>
        <div class="result-row"><span>Notary loan</span><strong>{{ formatCurrency(results.loanCosts.notaryLoan) }}</strong></div>
        <div class="result-row"><span>Total loan costs</span><strong>{{ formatCurrency(results.loanCosts.totalLoanCosts) }}</strong></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  results: {
    type: Object,
    required: true
  }
});

const formatCurrency = (value) =>
  new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(value ?? 0);

const formatPercent = (value) => {
  if (!Number.isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('nl-BE', { style: 'percent', maximumFractionDigits: 2 }).format(value);
};
</script>
