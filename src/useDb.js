import { reactive, ref } from 'vue';
import { defaultCostContent, getCopy, getInitialLocale, getLocaleCode } from './i18n';

const DB_KEY = 'recalc_db_v1';
const DRAFT_KEY = 'recalc_draft_v1';

const defaultAssumptions = () => ({
  mortgageBasisFactor: 1.1,
  notaryPurchaseFactor: 0.009,
  purchaseFixedActCost: 1800,
  mortgageRegistrationRate: 0.01,
  notaryLoanFactor: 0.006,
  loanCostBufferPct: 0.01
});

const resolveCostText = (id, locale) => {
  const entry = defaultCostContent[id];
  if (!entry) return { name: id, description: '' };
  return entry[locale] ?? entry.nl;
};

const defaultCostsCatalog = (locale = getInitialLocale()) => [
  {
    id: 'insurance-building',
    ...resolveCostText('insurance-building', locale),
    category: 'insurance',
    amountAnnual: 600,
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'insurance-liability',
    ...resolveCostText('insurance-liability', locale),
    category: 'insurance',
    amountAnnual: 150,
    enabled: false,
    defaultEnabled: false
  },
  {
    id: 'maintenance-general',
    ...resolveCostText('maintenance-general', locale),
    category: 'maintenance',
    amountAnnual: 1200,
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'capex-reserve',
    ...resolveCostText('capex-reserve', locale),
    category: 'capex_reserve',
    amountAnnual: 1500,
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'inspection-fire-safety',
    ...resolveCostText('inspection-fire-safety', locale),
    category: 'inspection',
    amountAnnual: 250,
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'inspection-electrical',
    ...resolveCostText('inspection-electrical', locale),
    category: 'inspection',
    amountAnnual: 120,
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'inspection-gas',
    ...resolveCostText('inspection-gas', locale),
    category: 'inspection',
    amountAnnual: 80,
    enabled: false,
    defaultEnabled: false
  },
  {
    id: 'inspection-elevator',
    ...resolveCostText('inspection-elevator', locale),
    category: 'inspection',
    amountAnnual: 300,
    enabled: false,
    defaultEnabled: false
  },
  {
    id: 'tax-property',
    ...resolveCostText('tax-property', locale),
    category: 'tax',
    amountAnnual: 1800,
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'tax-municipality',
    ...resolveCostText('tax-municipality', locale),
    category: 'tax',
    amountAnnual: 300,
    enabled: true,
    defaultEnabled: true
  },
  {
    id: 'management',
    ...resolveCostText('management', locale),
    category: 'management',
    amountAnnual: 600,
    enabled: false,
    defaultEnabled: false
  },
  {
    id: 'reletting',
    ...resolveCostText('reletting', locale),
    category: 'other',
    amountAnnual: 250,
    enabled: false,
    defaultEnabled: false
  }
];

const defaultState = (locale = getInitialLocale()) => ({
  region: 'Vlaanderen',
  purchasePrice: 0,
  renovationOneOff: 0,
  loanAmount: 0,
  loanToValuePct: 0.9,
  vacancyRateApartment: 0.05,
  vacancyRateCommercial: 0.15,
  targetNetYield: 0.05,
  assumptions: defaultAssumptions(),
  units: [
    {
      id: 'unit-apt-1',
      type: 'apartment',
      label: getCopy(locale).defaultUnitLabel,
      monthlyRent: 900
    }
  ],
  costsCatalog: defaultCostsCatalog(locale)
});

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const emptyDb = () => ({
  version: 1,
  activeCalculationId: null,
  calculations: []
});

const createCalculationDocument = (state, locale = getInitialLocale()) => {
  const now = new Date();
  const copy = getCopy(locale);
  const label = new Intl.DateTimeFormat(getLocaleCode(locale), {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(now);
  return {
    calculationId: createId(),
    address: `${copy.misc.newCalculation} - ${label}`,
    notes: '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    state: JSON.parse(JSON.stringify(state))
  };
};

export const useDb = () => {
  const db = reactive(emptyDb());
  const activeId = ref(null);

  const loadDb = () => {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        db.version = parsed.version ?? 1;
        db.activeCalculationId = parsed.activeCalculationId ?? null;
        db.calculations = parsed.calculations ?? [];
        activeId.value = db.activeCalculationId;
      } catch (error) {
        console.warn('Failed to load DB, starting fresh.', error);
      }
    }
  };

  const saveDb = () => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  };

  const setActiveCalculation = (id) => {
    db.activeCalculationId = id;
    activeId.value = id;
    saveDb();
  };

  const createNewCalculation = () => {
    const doc = createCalculationDocument(defaultState());
    db.calculations.unshift(doc);
    setActiveCalculation(doc.calculationId);
    saveDb();
    return doc;
  };

  const saveCurrent = (doc, state) => {
    const now = new Date().toISOString();
    doc.state = JSON.parse(JSON.stringify(state));
    doc.updatedAt = now;
    saveDb();
  };

  const duplicateCurrent = (doc) => {
    const copy = {
      ...doc,
      calculationId: createId(),
      address: `${doc.address} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(doc.state))
    };
    db.calculations.unshift(copy);
    setActiveCalculation(copy.calculationId);
    saveDb();
    return copy;
  };

  const deleteCurrent = (id) => {
    const index = db.calculations.findIndex((item) => item.calculationId === id);
    if (index >= 0) {
      db.calculations.splice(index, 1);
      const fallback = db.calculations[0]?.calculationId ?? null;
      setActiveCalculation(fallback);
      saveDb();
    }
  };

  const resetAll = () => {
    db.version = 1;
    db.activeCalculationId = null;
    db.calculations = [];
    activeId.value = null;
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(DRAFT_KEY);
  };

  return {
    db,
    activeId,
    loadDb,
    saveDb,
    setActiveCalculation,
    createNewCalculation,
    saveCurrent,
    duplicateCurrent,
    deleteCurrent,
    resetAll,
    defaultState,
    defaultCostsCatalog,
    defaultAssumptions,
    DB_KEY,
    DRAFT_KEY
  };
};

export { defaultState, defaultCostsCatalog, defaultAssumptions, DB_KEY, DRAFT_KEY };
