import {
  StockByFinancing,
  StockByRegion,
  StockByYear,
  YearlyStock,
  YearlyStrategy,
} from '@/types/types';

const coefficients = {
  nbsRemoval: [
    0.99592, 0.99592, 0.99592, 0.97068, 0.97068, 0.97068, 0.97068, 0.81757, 0.81757, 0.81757,
    0.81757, 0.37754, 0.37754, 0.37754, 0.37754, 0.07585, 0.07585, 0.07585, 0.07585, 0.01098,
    0.01098, 0.01098, 0.01098, 0, 0, 0,
  ],
  other_types: [
    1, 1, 1, 0.834, 0.834, 0.834, 0.834, 0.667, 0.667, 0.667, 0.667, 0.5, 0.5, 0.5, 0.5, 0.334,
    0.334, 0.334, 0.334, 0.167, 0.167, 0.167, 0.167, 0, 0, 0,
  ],
};

export function calculateStockByTypology(yearlyStrategies: YearlyStrategy[]): StockByYear {
  const stockByYear: StockByYear = {};

  yearlyStrategies.forEach((strategy) => {
    const year = strategy.year;

    strategy.types_purchased.forEach((typeBreakdown) => {
      const typology = typeBreakdown.typology;
      const isNbsRemoval = typology === 'nbsRemoval';
      const coeff = isNbsRemoval ? coefficients.nbsRemoval : coefficients.other_types;

      const totalCoeff = coeff.reduce((sum, c) => sum + c, 0);

      if (typeBreakdown.exPost?.regions) {
        typeBreakdown.exPost.regions.forEach((region) => {
          if (!stockByYear[year]) stockByYear[year] = {};
          stockByYear[year][typology] = (stockByYear[year][typology] || 0) + region.quantity;
        });
      }

      if (typeBreakdown.exAnte?.regions) {
        typeBreakdown.exAnte.regions.forEach((region) => {
          const totalQuantity = region.quantity;

          coeff.forEach((coefficient, offset) => {
            const stockYear = year + offset;
            const distributedQuantity = (totalQuantity * coefficient) / totalCoeff;
            if (!stockByYear[stockYear]) stockByYear[stockYear] = {};
            stockByYear[stockYear][typology] =
              (stockByYear[stockYear][typology] || 0) + distributedQuantity;
          });
        });
      }
    });
  });

  return stockByYear;
}

export function calculateStockByRegion(yearlyStrategies: YearlyStrategy[]): StockByRegion {
  const stockByYear: StockByRegion = {};

  yearlyStrategies.forEach((strategy) => {
    const year = strategy.year;

    strategy.types_purchased.forEach((typeBreakdown) => {
      const isNbsRemoval = typeBreakdown.typology === 'nbsRemoval';
      const coeff = isNbsRemoval ? coefficients.nbsRemoval : coefficients.other_types;

      const totalCoeff = coeff.reduce((sum, c) => sum + c, 0);

      if (typeBreakdown.exPost?.regions) {
        typeBreakdown.exPost.regions.forEach((region) => {
          if (!stockByYear[year]) stockByYear[year] = {};
          stockByYear[year][region.region] =
            (stockByYear[year][region.region] || 0) + region.quantity;
        });
      }

      if (typeBreakdown.exAnte?.regions) {
        typeBreakdown.exAnte.regions.forEach((region) => {
          const totalQuantity = region.quantity;

          coeff.forEach((coefficient, offset) => {
            const stockYear = year + offset;
            const distributedQuantity = (totalQuantity * coefficient) / totalCoeff;
            if (!stockByYear[stockYear]) stockByYear[stockYear] = {};
            stockByYear[stockYear][region.region] =
              (stockByYear[stockYear][region.region] || 0) + distributedQuantity;
          });
        });
      }
    });
  });

  return stockByYear;
}

export function calculateStockByFinancing(yearlyStrategies: YearlyStrategy[]): StockByFinancing {
  const stockByYear: StockByFinancing = {};

  yearlyStrategies.forEach((strategy) => {
    const year = strategy.year;

    strategy.types_purchased.forEach((typeBreakdown) => {
      const isNbsRemoval = typeBreakdown.typology === 'nbsRemoval';
      const coeff = isNbsRemoval ? coefficients.nbsRemoval : coefficients.other_types;

      const totalCoeff = coeff.reduce((sum, c) => sum + c, 0);

      if (typeBreakdown.exPost?.regions) {
        typeBreakdown.exPost.regions.forEach((region) => {
          if (!stockByYear[year]) stockByYear[year] = { exAnte: 0, exPost: 0 };
          stockByYear[year].exPost += region.quantity;
        });
      }

      if (typeBreakdown.exAnte?.regions) {
        typeBreakdown.exAnte.regions.forEach((region) => {
          const totalQuantity = region.quantity;

          coeff.forEach((coefficient, offset) => {
            const stockYear = year + offset;
            const distributedQuantity = (totalQuantity * coefficient) / totalCoeff;
            if (!stockByYear[stockYear]) stockByYear[stockYear] = { exAnte: 0, exPost: 0 };
            stockByYear[stockYear].exAnte += distributedQuantity;
          });
        });
      }
    });
  });

  return stockByYear;
}

export function calculateTotalAndCumulativeStock(yearlyStrategies: YearlyStrategy[]): YearlyStock {
  const stockByTypology = calculateStockByTypology(yearlyStrategies);
  const newStockByYear: { [year: number]: number } = {};
  const cumulativeStockByYear: { [year: number]: number } = {};

  let cumulativeStock = 0;

  Object.keys(stockByTypology)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((yearStr) => {
      const year = parseInt(yearStr);
      const stockForYear = stockByTypology[year];

      const newStock = Object.values(stockForYear).reduce((sum, stock) => sum + stock, 0);
      newStockByYear[year] = newStock;

      cumulativeStock += newStock;
      cumulativeStockByYear[year] = cumulativeStock;
    });

  return { newStockByYear, cumulativeStockByYear };
}
