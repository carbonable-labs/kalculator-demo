import { NextResponse } from 'next/server';
import {
  netZeroPlanningData,
  demoNetzeroNeeds,
  NET_ZERO_CONFIG,
} from '@/constants/netZeroPlanning';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo');

  const data = demo !== null ? demoNetzeroNeeds : netZeroPlanningData;

  return NextResponse.json({
    config: NET_ZERO_CONFIG,
    years: data.length,
    data,
    summary: {
      firstYear: data[0]?.year,
      lastYear: data[data.length - 1]?.year,
      totalGap: data.reduce((sum, e) => sum + e.gap, 0),
      avgAnnualGap: Math.round(data.reduce((sum, e) => sum + e.gap, 0) / data.length),
    },
  });
}
