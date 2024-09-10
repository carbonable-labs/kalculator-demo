'use client';

import { StrategyProvider } from '@/context/StrategyContext';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StrategyProvider>
      <div>{children}</div>
    </StrategyProvider>
  );
}
