// Net Zero Planning trajectory - SBTi-aligned
// Company baseline: 960,000 tCO2/year
// ~4.2% annual reduction target from baseline
// Gap = actual emissions - target emissions (carbon units needed to offset)

export interface NetZeroPlanningEntry {
  year: number;
  targetEmissions: number;
  actualEmissions: number;
  gap: number;
}

const BASELINE = 960000;
const REDUCTION_RATE = 0.042; // 4.2% annual reduction (SBTi-aligned)
// Actual emissions reduce slower than target (realistic company trajectory)
const ACTUAL_REDUCTION_RATE = 0.025; // 2.5% actual reduction

export const netZeroPlanningData: NetZeroPlanningEntry[] = Array.from(
  { length: 25 },
  (_, i) => {
    const year = 2026 + i;
    const yearsFromBase = i + 1;
    const targetEmissions = Math.round(BASELINE * Math.pow(1 - REDUCTION_RATE, yearsFromBase));
    const actualEmissions = Math.round(BASELINE * Math.pow(1 - ACTUAL_REDUCTION_RATE, yearsFromBase));
    const gap = Math.max(0, actualEmissions - targetEmissions);
    return { year, targetEmissions, actualEmissions, gap };
  },
);

// First 10 years (2026-2035) for demo pre-fill
export const demoNetzeroNeeds = netZeroPlanningData.slice(0, 10);
