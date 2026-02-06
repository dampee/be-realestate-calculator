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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import CalculationPicker from './components/CalculationPicker.vue';
import PurchaseInputs from './components/PurchaseInputs.vue';
import UnitsTable from './components/UnitsTable.vue';
import CostsTable from './components/CostsTable.vue';
import ResultsPanel from './components/ResultsPanel.vue';
import { useDb, defaultState, defaultCostsCatalog, DRAFT_KEY } from './useDb';
import { getCopy, getInitialLocale, getLocaleCode, setLocaleCookie } from './i18n';
import {
  calcCapexReserves,
  calcLoanAmounts,
  calcLoanCosts,
  calcMaxBid,
  calcNetYield,
  calcNoi,
  calcOpEx,
  calcTotalNetRent,
  getPurchaseCosts,
  getTotalInvestmentExclLoanCosts
} from './calculations';

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

const getSafeLoanTotals = (state) => {
  const normalized = {
    ...state,
    ownInvestment: Number.isFinite(state.ownInvestment) ? state.ownInvestment : 0
  };
  return calcLoanAmounts(normalized);
};

const normalizeState = (state) => {
  const merged = mergeWithDefaults(state, defaultState(locale.value));
  if (!Number.isFinite(state?.ownInvestment)) {
    const priorLoan = Number(state?.loanAmount);
    if (Number.isFinite(priorLoan) && priorLoan > 0) {
      const totals = getSafeLoanTotals(merged);
      merged.ownInvestment = Math.max(0, totals.totalInvestmentExclLoanCosts - priorLoan);
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
  if (!currentDoc.value) {
    const doc = createNewCalculation();
    doc.address = trimmed;
    doc.notes = notes.value;
    saveCurrent(doc, currentState.value);
    loadFromDoc(doc);
    return;
  }
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

const purchaseCosts = computed(() => {
  return getPurchaseCosts(currentState.value);
});

const totalInvestmentExclLoanCosts = computed(() => getTotalInvestmentExclLoanCosts(currentState.value));

const loanTotals = computed(() => getSafeLoanTotals(currentState.value));

const maxLoanAmount = computed(() => loanTotals.value.maxLoanAmount);

const requestedLoanAmount = computed(() => loanTotals.value.requestedLoanAmount);

const effectiveLoanAmount = computed(() => loanTotals.value.effectiveLoanAmount);

const loanCosts = computed(() => calcLoanCosts(currentState.value, effectiveLoanAmount.value));

const totalNetRent = computed(() => calcTotalNetRent(currentState.value));

const opEx = computed(() => calcOpEx(currentState.value));

const capexReserves = computed(() => calcCapexReserves(currentState.value));

const noi = computed(() => calcNoi(currentState.value));

const netYield = computed(() => calcNetYield(noi.value, totalInvestmentExclLoanCosts.value));

const maxBid = computed(() => {
  const raw = calcMaxBid(currentState.value, noi.value);
  if (!raw) {
    return { display: copy.value.results.notAvailable, bufferedDisplay: copy.value.results.notAvailable };
  }
  return {
    display: formatCurrency(Math.max(0, raw.maxPurchasePrice)),
    bufferedDisplay: formatCurrency(Math.max(0, raw.maxWithBuffer))
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
  if (saveError.value && address.value.trim()) {
    saveError.value = '';
  }
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
