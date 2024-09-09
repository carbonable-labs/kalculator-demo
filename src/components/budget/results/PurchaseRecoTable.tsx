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
    'Mecanism',
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
        strategy.types_purchased.flatMap((reco) =>
          reco.regions.map((region) => ({
            date: strategy.year.toString(),
            carbonUnits: region.quantity,
            typology: displayedNames[reco.typology] || reco.typology,
            mecanism: displayedMethodology[reco.typology] || '',
            region: displayedNames[region.region] || region.region,
            totalPurchased: region.cost,
            price: reco.price_per_ton,
          })),
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
