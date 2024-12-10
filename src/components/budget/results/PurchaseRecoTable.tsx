'use client';

import { useEffect, useState } from 'react';
import CustomTable from '@/components/form/CustomTable';
import { useBudget } from '@/context/BudgetContext';
import { displayedMethodology, displayedNames } from '@/utils/charts';
import { TypologyFinancingBreakdown } from '@/types/types';
import { calculateTotalAndCumulativeStock } from '@/utils/stockCalculator';
import CSVExportButton from './CSVExportButton';
import { ChartTitle } from '@/components/form/Title';

interface RecoData {
  date: string;
  carbonUnits: number;
  typology: string;
  mecanism: string;
  financing: string;
  region: string;
  totalPurchased: number;
  price: number;
}

export default function PurchaseRecoTable() {
  const headers = [
    'Date',
    'Carbon Units (t)',
    'Typology',
    'Mechanism',
    'Financing',
    'Region',
    'Total Purchased ($)',
    'Price/t ($)',
  ];

  const { budgetResults } = useBudget();
  const [data, setData] = useState<RecoData[]>([]);
  const [footerData, setFooterData] = useState<RecoData[]>([]);

  useEffect(() => {
    if (budgetResults) {
      let stock = calculateTotalAndCumulativeStock(budgetResults.strategies);
      console.log('stock', stock);
      const recoData = budgetResults.strategies.flatMap((strategy) =>
        strategy.types_purchased.flatMap((typeBreakdown) =>
          (['exAnte', 'exPost'] as Array<keyof TypologyFinancingBreakdown>).flatMap(
            (financingType) => {
              const financingDetails = typeBreakdown[financingType];
              if (typeof financingDetails !== 'object' || !financingDetails?.regions) {
                return []; // Skip if undefined or not the correct type
              }
              return financingDetails.regions.map((region) => ({
                date: strategy.year.toString(),
                carbonUnits: region.quantity,
                typology: displayedNames[typeBreakdown.typology] || typeBreakdown.typology,
                mecanism: displayedMethodology[typeBreakdown.typology] || '',
                financing: financingType === 'exAnte' ? 'Ex-Ante' : 'Ex-Post',
                region: displayedNames[region.region] || region.region,
                totalPurchased: region.cost,
                price: financingDetails.price_per_ton,
              }));
            },
          ),
        ),
      );

      const totals = recoData.reduce(
        (acc, item) => {
          acc.totalCarbonUnits += item.carbonUnits;
          acc.totalPurchased += item.totalPurchased;
          acc.totalWeightedPrice += item.price * item.carbonUnits;
          return acc;
        },
        {
          totalCarbonUnits: 0,
          totalPurchased: 0,
          totalWeightedPrice: 0,
        },
      );
      const averagePrice = totals.totalWeightedPrice / totals.totalCarbonUnits;

      setData(recoData);
      setFooterData([
        {
          date: 'TOTAL',
          carbonUnits: totals.totalCarbonUnits,
          typology: '',
          mecanism: '',
          financing: '',
          region: '',
          totalPurchased: totals.totalPurchased,
          price: averagePrice,
        },
      ]);
    }
  }, [budgetResults]);

  const getRowData = (row: RecoData) => [
    row.date,
    row.carbonUnits,
    row.typology,
    row.mecanism,
    row.financing,
    row.region,
    row.totalPurchased,
    row.price,
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <ChartTitle title="Purchase Recommendations" />
        <CSVExportButton
          headers={headers}
          data={data}
          filename="purchase_recommendations.csv"
          getRowData={getRowData}
        />
      </div>
      <CustomTable headers={headers} data={data} footer={footerData} />
    </div>
  );
}
