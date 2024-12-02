'use client';

import CustomTable from '@/components/form/CustomTable';
import { useBudget } from '@/context/BudgetContext';
import { displayedMethodology, displayedNames } from '@/utils/charts';
import { useEffect, useState } from 'react';

interface RecoData {
  date: string;
  carbonUnits: number;
  typology: string;
  mecanism: string;
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
    'Region',
    'Total Purchased ($)',
    'Price/t ($)',
  ];

  const { budgetResults } = useBudget();
  const [data, setData] = useState<RecoData[]>([]);
  const [footerData, setFooterData] = useState<RecoData[]>([]);

  useEffect(() => {
    if (budgetResults) {
      const recoData = budgetResults.strategies.flatMap((strategy) =>
        strategy.types_purchased.flatMap((typeBreakdown) =>
          // Iterate over exAnte and exPost
          ['exAnte', 'exPost'].flatMap((financingType) => {
            const financingDetails = typeBreakdown[financingType];
            if (!financingDetails) {
              return []; // Skip if undefined
            }
            return financingDetails.regions.map((region) => ({
              date: strategy.year.toString(),
              carbonUnits: region.quantity,
              typology: displayedNames[typeBreakdown.typology] || typeBreakdown.typology,
              mecanism: displayedMethodology[typeBreakdown.typology] || '',
              region: displayedNames[region.region] || region.region,
              totalPurchased: region.cost,
              price: financingDetails.price_per_ton,
            }));
          }),
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
          region: '',
          totalPurchased: totals.totalPurchased,
          price: averagePrice,
        },
      ]);
    }
  }, [budgetResults]);

  if (budgetResults === null) {
    return null;
  }

  return (
    <div>
      <CustomTable headers={headers} data={data} footer={footerData} />
    </div>
  );
}
