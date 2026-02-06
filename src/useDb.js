import { reactive, ref } from 'vue';

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

const defaultCostsCatalog = () => [
  {
    id: 'insurance-building',
    name: 'Building insurance (brandverzekering)',
    category: 'insurance',
    amountAnnual: 600,
    enabled: true,
    defaultEnabled: true,
    description: 'Fire and structural insurance.'
  },
  {
    id: 'insurance-liability',
    name: 'Liability insurance (BA)',
    category: 'insurance',
    amountAnnual: 150,
    enabled: false,
    defaultEnabled: false,
    description: 'Civil liability coverage.'
  },
  {
    id: 'maintenance-general',
    name: 'General maintenance',
    category: 'maintenance',
    amountAnnual: 1200,
    enabled: true,
    defaultEnabled: true,
    description: 'Minor repairs and upkeep.'
  },
  {
    id: 'capex-reserve',
    name: 'CAPEX reserve (major repairs reserve)',
    category: 'capex_reserve',
    amountAnnual: 1500,
    enabled: true,
    defaultEnabled: true,
    description: 'Annual reserve for large repairs.'
  },
  {
    id: 'inspection-fire-safety',
    name: 'Fire safety / extinguishers checks',
    category: 'inspection',
    amountAnnual: 250,
    enabled: true,
    defaultEnabled: true,
    description: 'Periodic fire equipment checks.'
  },
  {
    id: 'inspection-electrical',
    name: 'Electrical inspection annualized',
    category: 'inspection',
    amountAnnual: 120,
    enabled: true,
    defaultEnabled: true,
    description: 'Average yearly electrical checks.'
  },
  {
    id: 'inspection-gas',
    name: 'Gas inspection annualized',
    category: 'inspection',
    amountAnnual: 80,
    enabled: false,
    defaultEnabled: false,
    description: 'Average yearly gas inspections.'
  },
  {
    id: 'inspection-elevator',
    name: 'Elevator inspection',
    category: 'inspection',
    amountAnnual: 300,
    enabled: false,
    defaultEnabled: false,
    description: 'Elevator certification.'
  },
  {
    id: 'tax-property',
    name: 'Property tax (onroerende voorheffing)',
    category: 'tax',
    amountAnnual: 1800,
    enabled: true,
    defaultEnabled: true,
    description: 'Annual property tax.'
  },
  {
    id: 'tax-municipality',
    name: 'Municipality taxes',
    category: 'tax',
    amountAnnual: 300,
    enabled: true,
    defaultEnabled: true,
    description: 'Local municipal taxes.'
  },
  {
    id: 'management',
    name: 'Management / syndic / accounting',
    category: 'management',
    amountAnnual: 600,
    enabled: false,
    defaultEnabled: false,
    description: 'Administrative or management support.'
  },
  {
    id: 'reletting',
    name: 'Re-letting / advertising',
    category: 'other',
    amountAnnual: 250,
    enabled: false,
    defaultEnabled: false,
    description: 'Tenant change and advertising costs.'
  }
];

const defaultState = () => ({
  region: 'Vlaanderen',
  purchasePrice: 0,
  renovationOneOff: 0,
  loanAmount: 0,
  vacancyRateApartment: 0.05,
  vacancyRateCommercial: 0.15,
  targetNetYield: 0.05,
  assumptions: defaultAssumptions(),
  units: [
    {
      id: 'unit-apt-1',
      type: 'apartment',
      label: 'Apartment 1',
      monthlyRent: 900
    }
  ],
  costsCatalog: defaultCostsCatalog()
});

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const emptyDb = () => ({
  version: 1,
  activeCalculationId: null,
  calculations: []
});

const createCalculationDocument = (state) => {
  const now = new Date();
  const label = new Intl.DateTimeFormat('nl-BE', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(now);
  return {
    calculationId: createId(),
    address: `New calculation - ${label}`,
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
