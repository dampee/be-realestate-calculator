import { describe, expect, it } from 'vitest';
import {
  calcLoanAmounts,
  calcMaxBid,
  calcNetYield,
  calcNoi,
  calcOpEx,
  calcTotalNetRent,
  getPurchaseCosts,
  getTotalInvestmentExclLoanCosts
} from '../src/calculations';

const baseState = () => ({
  region: 'Vlaanderen',
  purchasePrice: 200000,
  renovationOneOff: 15000,
  ownInvestment: 50000,
  loanToValuePct: 0.9,
  targetNetYield: 0.05,
  assumptions: {
    mortgageBasisFactor: 1.1,
    notaryPurchaseFactor: 0.01,
    purchaseFixedActCost: 1800,
    mortgageRegistrationRate: 0.01,
    notaryLoanFactor: 0.006,
    loanCostBufferPct: 0.01
  },
  vacancyRateApartment: 0.05,
  vacancyRateCommercial: 0.15,
  units: [
    { id: 'unit-1', type: 'apartment', label: 'Apt', monthlyRent: 900 },
    { id: 'unit-2', type: 'commercial', label: 'Shop', monthlyRent: 1500 }
  ],
  costsCatalog: [
    { id: 'op-1', category: 'insurance', amountAnnual: 600, enabled: true },
    { id: 'capex', category: 'capex_reserve', amountAnnual: 1200, enabled: true }
  ]
});

describe('calculations', () => {
  it('computes purchase costs for Vlaanderen', () => {
    const state = baseState();
    state.purchasePrice = 100000;
    const costs = getPurchaseCosts(state);
    expect(costs.registration).toBe(12000);
    expect(costs.notaryPurchase).toBe(1000);
    expect(costs.fixedAct).toBe(1800);
    expect(costs.total).toBe(14800);
  });

  it('computes total investment excluding loan costs', () => {
    const state = baseState();
    const total = getTotalInvestmentExclLoanCosts(state);
    expect(total).toBe(200000 + 15000 + 200000 * 0.12 + 200000 * 0.01 + 1800);
  });

  it('computes loan amounts with caps', () => {
    const state = baseState();
    const totals = calcLoanAmounts(state);
    const maxLoan = state.purchasePrice * state.loanToValuePct;
    const requested = totals.totalInvestmentExclLoanCosts - state.ownInvestment;
    expect(totals.maxLoanAmount).toBe(maxLoan);
    expect(totals.requestedLoanAmount).toBe(requested);
    expect(totals.effectiveLoanAmount).toBe(Math.min(requested, maxLoan));
  });

  it('handles non-finite ownInvestment gracefully', () => {
    const state = baseState();
    state.ownInvestment = undefined;
    const totals = calcLoanAmounts(state);
    expect(totals.requestedLoanAmount).toBe(totals.totalInvestmentExclLoanCosts);
    expect(Number.isFinite(totals.requestedLoanAmount)).toBe(true);

    state.ownInvestment = NaN;
    const totals2 = calcLoanAmounts(state);
    expect(totals2.requestedLoanAmount).toBe(totals2.totalInvestmentExclLoanCosts);
    expect(Number.isFinite(totals2.requestedLoanAmount)).toBe(true);
  });

  it('computes NOI and net yield', () => {
    const state = baseState();
    const totalNetRent = calcTotalNetRent(state);
    const opEx = calcOpEx(state);
    const noi = calcNoi(state);
    const totalInvestment = getTotalInvestmentExclLoanCosts(state);
    expect(noi).toBe(totalNetRent - opEx - 1200);
    expect(calcNetYield(noi, totalInvestment)).toBeCloseTo(noi / totalInvestment);
  });

  it('computes max bid when NOI is positive', () => {
    const state = baseState();
    const noi = calcNoi(state);
    const maxBid = calcMaxBid(state, noi);
    expect(maxBid).not.toBeNull();
    expect(maxBid.maxPurchasePrice).toBeGreaterThan(0);
    expect(maxBid.maxWithBuffer).toBeLessThan(maxBid.maxPurchasePrice);
  });
});
