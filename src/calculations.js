export const getRegRate = (region) => (region === 'Vlaanderen' ? 0.12 : 0.125);

export const getPurchaseCosts = (state) => {
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

export const getTotalInvestmentExclLoanCosts = (state) => {
  const purchase = getPurchaseCosts(state);
  return state.purchasePrice + purchase.total + state.renovationOneOff;
};

export const calcLoanAmounts = (state) => {
  const totalInvestmentExclLoanCosts = getTotalInvestmentExclLoanCosts(state);
  const maxLoanAmount = state.purchasePrice * (state.loanToValuePct ?? 0);
  const requestedLoanAmount = Math.max(0, totalInvestmentExclLoanCosts - state.ownInvestment);
  const effectiveLoanAmount = requestedLoanAmount <= 0 ? 0 : Math.min(requestedLoanAmount, maxLoanAmount);
  return {
    totalInvestmentExclLoanCosts,
    maxLoanAmount,
    requestedLoanAmount,
    effectiveLoanAmount
  };
};

export const calcLoanCosts = (state, effectiveLoanAmount) => {
  if (effectiveLoanAmount <= 0) return null;
  const mortgageBasis = effectiveLoanAmount * state.assumptions.mortgageBasisFactor;
  const mortgageRegistration = mortgageBasis * state.assumptions.mortgageRegistrationRate;
  const notaryLoan = effectiveLoanAmount * state.assumptions.notaryLoanFactor;
  return {
    mortgageBasis,
    mortgageRegistration,
    notaryLoan,
    totalLoanCosts: mortgageRegistration + notaryLoan
  };
};

export const calcTotalNetRent = (state) => {
  return state.units.reduce((sum, unit) => {
    const annualGross = unit.monthlyRent * 12;
    const vacancyRate = unit.type === 'apartment' ? state.vacancyRateApartment : state.vacancyRateCommercial;
    const annualNet = annualGross * (1 - vacancyRate);
    return sum + annualNet;
  }, 0);
};

export const calcOpEx = (state) => {
  return state.costsCatalog
    .filter((item) => item.enabled && item.category !== 'capex_reserve')
    .reduce((sum, item) => sum + item.amountAnnual, 0);
};

export const calcCapexReserves = (state) => {
  return state.costsCatalog
    .filter((item) => item.enabled && item.category === 'capex_reserve')
    .reduce((sum, item) => sum + item.amountAnnual, 0);
};

export const calcNoi = (state) => {
  const totalNetRent = calcTotalNetRent(state);
  const opEx = calcOpEx(state);
  const capexReserves = calcCapexReserves(state);
  return totalNetRent - opEx - capexReserves;
};

export const calcNetYield = (noiValue, totalInvestmentExclLoanCosts) => {
  if (totalInvestmentExclLoanCosts <= 0) return NaN;
  return noiValue / totalInvestmentExclLoanCosts;
};

export const calcMaxBid = (state, noiValue) => {
  const target = state.targetNetYield;
  if (noiValue <= 0 || target <= 0) return null;
  const fixedAct = state.assumptions.purchaseFixedActCost;
  const reno = state.renovationOneOff;
  const numerator = noiValue / target - fixedAct - reno;
  const denominator = 1 + getRegRate(state.region) + state.assumptions.notaryPurchaseFactor;
  const maxPurchasePrice = numerator / denominator;
  const maxWithBuffer = maxPurchasePrice / (1 + state.assumptions.loanCostBufferPct);
  return {
    maxPurchasePrice,
    maxWithBuffer
  };
};
