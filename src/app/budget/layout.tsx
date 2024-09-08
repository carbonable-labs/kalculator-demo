'use client';

import { BudgetProvider } from '@/context/BudgetContext';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BudgetProvider>
      <div>{children}</div>
    </BudgetProvider>
  );
}
