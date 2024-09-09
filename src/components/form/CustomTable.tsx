import { formatLargeNumber } from '@/utils/output';
import React from 'react';

interface CustomTableProps {
  headers: string[];
  data: any[];
  footer: any[];
}

export default function CustomTable({ headers, data, footer }: CustomTableProps) {
  const gridTemplateColumns = `repeat(${headers.length}, minmax(0, 1fr))`;

  const formatCellValue = (value: any) => {
    if (typeof value === 'number') {
      return formatLargeNumber(value);
    }
    return value;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-opacityLight-10 text-neutral-200">
      <div className="bg-neutral-600" style={{ display: 'grid', gridTemplateColumns }}>
        {headers.map((header, index) => (
          <div key={index} className="flex items-center px-4 py-2 text-sm font-light">
            {header}
          </div>
        ))}
      </div>
      <div className="h-[400px] flex-grow overflow-y-auto">
        {data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="hover:bg-opacityLight-5 hover:brightness-110"
            style={{ display: 'grid', gridTemplateColumns }}
          >
            {Object.values(row).map((cell, cellIndex) => (
              <div key={cellIndex} className="border-b border-opacityLight-5 px-4 py-2">
                {formatCellValue(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="bg-neutral-600" style={{ display: 'grid', gridTemplateColumns }}>
        {footer.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {Object.values(row).map((cell, cellIndex) => (
              <div key={cellIndex} className="px-4 py-2 font-light">
                {formatCellValue(cell)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
