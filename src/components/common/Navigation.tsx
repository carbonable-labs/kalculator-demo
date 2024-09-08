'use client';

import { Tab, Tabs } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [selectedKey, setSelectedKey] = useState<string>('/budget');
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/' || pathname === null) {
      setSelectedKey('/budget');
      return;
    }

    setSelectedKey(pathname);
  }, [pathname]);

  return (
    <div className="mb-16">
      <div className="font-semibold">What is your main objective?</div>
      <div className="mt-4">
        <Tabs
          selectedKey={selectedKey}
          radius={'full'}
          color={'primary'}
          classNames={{
            tabList: 'bg-opacityLight-5 text-neutral-100',
          }}
        >
          <Tab
            key="/budget"
            title={
              <Link href="/budget" prefetch>
                Budget estimation
              </Link>
            }
          />
          <Tab
            key="/typology"
            title={
              <Link href="/typology" prefetch>
                Projects typologies
              </Link>
            }
          />
          <Tab
            key="/strategy"
            title={
              <Link href="/strategy" prefetch>
                Strategy optimization
              </Link>
            }
          />
        </Tabs>
      </div>
    </div>
  );
}
