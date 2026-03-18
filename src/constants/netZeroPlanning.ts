// Net Zero Planning trajectory - SBTi-aligned
// Company baseline: 960,000 tCO2/year
// ~4.2% annual reduction target (SBTi near-term for Scope 1+2)
// Actual reduction pace: 2.5% (realistic corporate trajectory)
// Gap = actual - target → carbon units needed to offset

export interface NetZeroPlanningEntry {
  year: number;
  targetEmissions: number;
  actualEmissions: number;
  gap: number;
}

export const NET_ZERO_CONFIG = {
  baseline: 960_000,
  baseYear: 2025,
  targetYear: 2050,
  targetReductionRate: 0.042, // SBTi-aligned
  actualReductionRate: 0.025, // Realistic corporate pace
} as const;

function buildTrajectory(): NetZeroPlanningEntry[] {
  const { baseline, targetYear, baseYear, targetReductionRate, actualReductionRate } =
    NET_ZERO_CONFIG;
  const years = targetYear - baseYear;

  return Array.from({ length: years }, (_, i) => {
    const year = baseYear + 1 + i;
    const n = i + 1;
    const targetEmissions = Math.round(baseline * Math.pow(1 - targetReductionRate, n));
    const actualEmissions = Math.round(baseline * Math.pow(1 - actualReductionRate, n));
    const gap = Math.max(0, actualEmissions - targetEmissions);
    return { year, targetEmissions, actualEmissions, gap };
  });
}

export const netZeroPlanningData = buildTrajectory();

/** First 10 years (2026-2035) — demo pre-fill */
export const demoNetzeroNeeds = netZeroPlanningData.slice(0, 10);
