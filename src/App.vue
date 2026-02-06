<template>
  <div>
    <header style="margin-bottom: 16px;">
      <div class="inline" style="justify-content: space-between; width: 100%; align-items: center;">
        <div>
          <h1>{{ copy.appTitle }}</h1>
          <p class="helper">{{ copy.appSubtitle }}</p>
        </div>
        <label class="inline" style="gap: 8px;">
          <span>{{ copy.languageLabel }}</span>
          <select :value="locale" @change="setLocale($event.target.value)">
            <option value="nl">{{ copy.languageOptions.nl }}</option>
            <option value="fr">{{ copy.languageOptions.fr }}</option>
          </select>
        </label>
      </div>
    </header>

    <CalculationPicker
      :calculations="sortedCalculations"
      :active-id="activeId"
      :address="address"
      :notes="notes"
      :created-at="currentDoc?.createdAt"
      :updated-at="currentDoc?.updatedAt"
      :error="saveError"
      :copy="copy"
      :locale-code="localeCode"
      @new="handleNew"
      @save="handleSave"
      @duplicate="handleDuplicate"
      @delete="handleDelete"
      @select="handleSelect"
      @share="handleShare"
      @reset="handleReset"
      @update:address="address = $event"
      @update:notes="notes = $event"
    />

    <PurchaseInputs
      :state="currentState"
      :copy="copy"
      :locale-code="localeCode"
      :loan-amount="requestedLoanAmount"
      @update:state="updateState"
    />

    <UnitsTable :units="currentState.units" :copy="copy" @update:units="updateUnits" />

    <CostsTable :costs="currentState.costsCatalog" :copy="copy" @update:costs="updateCosts" @add="addCost" @reset="resetCosts" />

    <ResultsPanel :results="results" :copy="copy" :locale-code="localeCode" />

    <LoanDecisionGuide :copy="copy" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import CalculationPicker from './components/CalculationPicker.vue';
import PurchaseInputs from './components/PurchaseInputs.vue';
import UnitsTable from './components/UnitsTable.vue';
import CostsTable from './components/CostsTable.vue';
import ResultsPanel from './components/ResultsPanel.vue';
import LoanDecisionGuide from './components/LoanDecisionGuide.vue';
import { useDb, defaultState, defaultCostsCatalog, DRAFT_KEY } from './useDb';
import { getCopy, getInitialLocale, getLocaleCode, setLocaleCookie } from './i18n';

const { db, activeId, loadDb, createNewCalculation, saveCurrent, duplicateCurrent, deleteCurrent, setActiveCalculation, resetAll } = useDb();

const locale = ref(getInitialLocale());
const currentState = ref(defaultState(locale.value));
const address = ref('');
const notes = ref('');
const saveError = ref('');
setLocaleCookie(locale.value);
let draftTimer = null;

const sortedCalculations = computed(() => {
  return [...db.calculations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
});

const copy = computed(() => getCopy(locale.value));
const localeCode = computed(() => getLocaleCode(locale.value));

const setLocale = (next) => {
  locale.value = next;
};

const currentDoc = computed(() => {
  return db.calculations.find((item) => item.calculationId === activeId.value) || null;
});

const mergeWithDefaults = (partial, defaults) => {
  if (Array.isArray(partial)) return partial;
  if (partial && typeof partial === 'object') {
    const merged = Array.isArray(defaults) ? [] : { ...defaults };
    Object.keys(partial).forEach((key) => {
      merged[key] = mergeWithDefaults(partial[key], defaults?.[key]);
    });
    return merged;
  }
  return partial ?? defaults;
};

const getRegRate = (region) => (region === 'Vlaanderen' ? 0.12 : 0.125);

const getPurchaseCosts = (state) => {
  const registration = state.purchasePrice * getRegRate(state.region);
  const notaryPurchase = state.purchasePrice * state.assumptions.notaryPurchaseFactor;
  const fixedAct = state.assumptions.purchaseFixedActCost;
  return {
    registration,
    notaryPurchase,
    fixedAct,
    total: registration + notaryPurchase + fixedAct
  };
};

const getTotalInvestmentExclLoanCosts = (state) => {
  const purchase = getPurchaseCosts(state);
  return state.purchasePrice + purchase.total + state.renovationOneOff;
};

const normalizeState = (state) => {
  const merged = mergeWithDefaults(state, defaultState(locale.value));
  if (!Number.isFinite(state?.ownInvestment)) {
    const priorLoan = Number(state?.loanAmount);
    if (Number.isFinite(priorLoan) && priorLoan > 0) {
      const totalInvestment = getTotalInvestmentExclLoanCosts(merged);
      merged.ownInvestment = Math.max(0, totalInvestment - priorLoan);
    } else {
      merged.ownInvestment = 0;
    }
  }
  delete merged.loanAmount;
  return merged;
};

const ensureActive = () => {
  if (!db.calculations.length) {
    const doc = createNewCalculation();
    loadFromDoc(doc);
    return;
  }
  if (!activeId.value) {
    setActiveCalculation(db.calculations[0].calculationId);
  }
  const doc = currentDoc.value;
  if (doc) {
    loadFromDoc(doc);
  }
};

const loadFromDoc = (doc) => {
  currentState.value = normalizeState(JSON.parse(JSON.stringify(doc.state)));
  address.value = doc.address;
  notes.value = doc.notes;
};

const updateState = (next) => {
  currentState.value = next;
};

const updateUnits = (units) => {
  currentState.value = {
    ...currentState.value,
    units
  };
};

const updateCosts = (costsCatalog) => {
  currentState.value = {
    ...currentState.value,
    costsCatalog
  };
};

const addCost = () => {
  const newCost = {
    id: `cost-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    name: copy.value.misc.customCost,
    category: 'other',
    amountAnnual: 0,
    enabled: true,
    defaultEnabled: true,
    description: ''
  };
  updateCosts([...currentState.value.costsCatalog, newCost]);
};

const resetCosts = () => {
  updateCosts(defaultCostsCatalog(locale.value));
};

const handleNew = () => {
  const doc = createNewCalculation();
  loadFromDoc(doc);
};

const handleSave = () => {
  saveError.value = '';
  const trimmed = address.value.trim();
  if (!trimmed) {
    saveError.value = copy.value.errors.addressRequired;
    return;
  }
  const conflict = db.calculations.find((item) => {
    return item.calculationId !== currentDoc.value?.calculationId && item.address.trim().toLowerCase() === trimmed.toLowerCase();
  });
  if (conflict) {
    saveError.value = copy.value.errors.addressUnique;
    return;
  }
  if (!currentDoc.value) return;
  currentDoc.value.address = trimmed;
  currentDoc.value.notes = notes.value;
  saveCurrent(currentDoc.value, currentState.value);
};

const handleDuplicate = () => {
  if (!currentDoc.value) return;
  const doc = duplicateCurrent(currentDoc.value);
  loadFromDoc(doc);
};

const handleDelete = () => {
  if (!currentDoc.value) return;
  const ok = window.confirm(copy.value.confirmations.deleteCalculation);
  if (!ok) return;
  const deletedId = currentDoc.value.calculationId;
  deleteCurrent(deletedId);
  if (currentDoc.value) {
    loadFromDoc(currentDoc.value);
  }
};

const handleSelect = (id) => {
  setActiveCalculation(id);
  if (currentDoc.value) {
    loadFromDoc(currentDoc.value);
  }
};

const handleReset = () => {
  const ok = window.confirm(copy.value.confirmations.resetAll);
  if (!ok) return;
  resetAll();
  const doc = createNewCalculation();
  loadFromDoc(doc);
};

const isStateDifferent = (a, b) => {
  return JSON.stringify(a) !== JSON.stringify(b);
};

const saveDraft = () => {
  if (!currentDoc.value) return;
  const draft = {
    calculationId: currentDoc.value.calculationId,
    state: currentState.value,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

const promptDraftRestore = () => {
  if (!currentDoc.value) return;
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    if (draft.calculationId === currentDoc.value.calculationId && isStateDifferent(draft.state, currentDoc.value.state)) {
      const ok = window.confirm(copy.value.confirmations.restoreDraft);
      if (ok) {
        currentState.value = draft.state;
      }
    }
  } catch (error) {
    console.warn('Failed to read draft.', error);
  }
};

const formatCurrency = (value) => new Intl.NumberFormat(localeCode.value, { style: 'currency', currency: 'EUR' }).format(value ?? 0);

const regRate = computed(() => getRegRate(currentState.value.region));

const purchaseCosts = computed(() => {
  return getPurchaseCosts(currentState.value);
});

const totalInvestmentExclLoanCosts = computed(() => {
  return getTotalInvestmentExclLoanCosts(currentState.value);
});

const maxLoanAmount = computed(() => currentState.value.purchasePrice * (currentState.value.loanToValuePct ?? 0));

const requestedLoanAmount = computed(() => {
  return Math.max(0, totalInvestmentExclLoanCosts.value - currentState.value.ownInvestment);
});

const effectiveLoanAmount = computed(() => {
  if (requestedLoanAmount.value <= 0) return 0;
  return Math.min(requestedLoanAmount.value, maxLoanAmount.value);
});

const loanCosts = computed(() => {
  if (effectiveLoanAmount.value <= 0) return null;
  const mortgageBasis = effectiveLoanAmount.value * currentState.value.assumptions.mortgageBasisFactor;
  const mortgageRegistration = mortgageBasis * currentState.value.assumptions.mortgageRegistrationRate;
  const notaryLoan = effectiveLoanAmount.value * currentState.value.assumptions.notaryLoanFactor;
  return {
    mortgageBasis,
    mortgageRegistration,
    notaryLoan,
    totalLoanCosts: mortgageRegistration + notaryLoan
  };
});

const totalNetRent = computed(() => {
  return currentState.value.units.reduce((sum, unit) => {
    const annualGross = unit.monthlyRent * 12;
    const vacancyRate = unit.type === 'apartment' ? currentState.value.vacancyRateApartment : currentState.value.vacancyRateCommercial;
    const annualNet = annualGross * (1 - vacancyRate);
    return sum + annualNet;
  }, 0);
});

const opEx = computed(() => {
  return currentState.value.costsCatalog
    .filter((item) => item.enabled && item.category !== 'capex_reserve')
    .reduce((sum, item) => sum + item.amountAnnual, 0);
});

const capexReserves = computed(() => {
  return currentState.value.costsCatalog
    .filter((item) => item.enabled && item.category === 'capex_reserve')
    .reduce((sum, item) => sum + item.amountAnnual, 0);
});

const noi = computed(() => totalNetRent.value - opEx.value - capexReserves.value);

const netYield = computed(() => {
  if (totalInvestmentExclLoanCosts.value <= 0) return NaN;
  return noi.value / totalInvestmentExclLoanCosts.value;
});

const maxBid = computed(() => {
  const target = currentState.value.targetNetYield;
  if (noi.value <= 0 || target <= 0) {
    return { display: copy.value.results.notAvailable, bufferedDisplay: copy.value.results.notAvailable };
  }
  const fixedAct = currentState.value.assumptions.purchaseFixedActCost;
  const reno = currentState.value.renovationOneOff;
  const numerator = noi.value / target - fixedAct - reno;
  const denominator = 1 + regRate.value + currentState.value.assumptions.notaryPurchaseFactor;
  const maxPurchasePrice = numerator / denominator;
  const maxWithBuffer = maxPurchasePrice / (1 + currentState.value.assumptions.loanCostBufferPct);
  return {
    display: formatCurrency(Math.max(0, maxPurchasePrice)),
    bufferedDisplay: formatCurrency(Math.max(0, maxWithBuffer))
  };
});

const results = computed(() => ({
  totalNetRent: totalNetRent.value,
  opEx: opEx.value,
  capexReserves: capexReserves.value,
  noi: noi.value,
  purchaseCosts: purchaseCosts.value,
  totalInvestmentExclLoanCosts: totalInvestmentExclLoanCosts.value,
  netYield: netYield.value,
  maxBid: maxBid.value,
  loanCosts: loanCosts.value,
  effectiveLoanAmount: effectiveLoanAmount.value,
  maxLoanAmount: maxLoanAmount.value,
  requestedLoanAmount: requestedLoanAmount.value
}));

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const encodeStateMinimal = (state, defaults) => {
  const result = {};
  Object.keys(defaults).forEach((key) => {
    const value = state[key];
    const defValue = defaults[key];
    if (Array.isArray(value)) {
      const arrayDiff = !Array.isArray(defValue) || value.length !== defValue.length || value.some((item, index) => !deepEqual(item, defValue[index]));
      if (arrayDiff) {
        result[key] = value;
      }
    } else if (value && typeof value === 'object') {
      const nested = encodeStateMinimal(value, defValue || {});
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    } else if (value !== defValue) {
      result[key] = value;
    }
  });
  return result;
};

const toBase64Url = (str) => {
  const encoded = btoa(unescape(encodeURIComponent(str)));
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const decoded = atob(padded);
  return decodeURIComponent(escape(decoded));
};

const handleShare = async () => {
  const minimal = encodeStateMinimal(currentState.value, defaultState(locale.value));
  const payload = toBase64Url(JSON.stringify(minimal));
  const url = new URL(window.location.href);
  url.searchParams.set('s', payload);
  window.history.replaceState({}, '', url.toString());
  try {
    await navigator.clipboard.writeText(url.toString());
    window.alert(copy.value.alerts.shareCopied);
  } catch (error) {
    window.prompt(copy.value.alerts.shareCopyPrompt, url.toString());
  }
};

const importFromShare = () => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('s');
  if (!encoded) return;
  try {
    const raw = fromBase64Url(encoded);
    const decoded = JSON.parse(raw);
    const merged = mergeWithDefaults(decoded, defaultState(locale.value));
    const now = new Date();
    const timestamp = new Intl.DateTimeFormat(localeCode.value, {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(now);
    const doc = {
      calculationId: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      address: `${copy.value.misc.imported} - ${timestamp}`,
      notes: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      state: merged
    };
    db.calculations.unshift(doc);
    setActiveCalculation(doc.calculationId);
    currentState.value = merged;
    address.value = doc.address;
    notes.value = doc.notes;
    localStorage.removeItem(DRAFT_KEY);
    params.delete('s');
    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', url);
  } catch (error) {
    console.warn('Failed to import shared calculation.', error);
  }
};

watch(
  () => currentState.value,
  () => {
    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 300);
  },
  { deep: true }
);

watch([address, notes], () => {
  if (draftTimer) clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraft, 300);
});

watch(locale, (next) => {
  setLocaleCookie(next);
});

watch(activeId, () => {
  if (currentDoc.value) {
    loadFromDoc(currentDoc.value);
    promptDraftRestore();
  }
});

onMounted(() => {
  loadDb();
  importFromShare();
  ensureActive();
  promptDraftRestore();
});
</script>
