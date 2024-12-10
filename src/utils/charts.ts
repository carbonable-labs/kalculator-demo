export const PERCENTAGE_MAX_VALUE = 100;

export const displayedNames: Record<string, string> = {
  nbsAvoidance: 'NbS - REDD',
  nbsRemoval: 'NbS - ARR',
  renewableEnergy: 'Renewable Energy',
  biochar: 'Biochar',
  dac: 'DAC',
  africa: 'Africa',
  asia: 'Asia',
  europe: 'Europe',
  northAmerica: 'North America',
  oceania: 'Oceania',
  southAmerica: 'Latin America',
};

export const displayedMethodology: Record<string, string> = {
  nbsAvoidance: 'Avoidance',
  dac: 'Removal',
  nbsRemoval: 'Removal',
  biochar: 'Removal',
  renewableEnergy: 'Avoidance',
};

interface ChartDataItem {
  year: number;
  [key: string]: number | string;
}

interface YearRange {
  minYear: number;
  maxYear: number;
}

export const getYearRange = (data: { [year: string | number]: any }): YearRange => {
  const years = Object.keys(data).map((year) => parseInt(year));
  return {
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
  };
};

export const fillMissingYears = (
  data: ChartDataItem[],
  minYear: number,
  maxYear: number,
): ChartDataItem[] => {
  const filledData: ChartDataItem[] = [];
  const dataMap = new Map(data.map((item) => [item.year, item]));

  for (let year = minYear; year <= maxYear; year++) {
    if (dataMap.has(year)) {
      filledData.push(dataMap.get(year)!);
    } else {
      const emptyItem: ChartDataItem = { year } as ChartDataItem;
      // Add zero values for all possible keys except 'year'
      const sampleItem = data[0];
      if (sampleItem) {
        Object.keys(sampleItem).forEach((key) => {
          if (key !== 'year') {
            emptyItem[key] = 0;
          }
        });
      }
      filledData.push(emptyItem);
    }
  }

  return filledData;
};
