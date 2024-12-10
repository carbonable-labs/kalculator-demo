import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';

interface CSVExportButtonProps<T> {
  headers: string[];
  data: T[];
  filename?: string;
  getRowData: (item: T) => (string | number)[];
}

export default function CSVExportButton<T>({
  headers,
  data,
  filename = 'export.csv',
  getRowData,
}: CSVExportButtonProps<T>) {
  const exportToCSV = () => {
    const csvContent = [
      // Headers
      headers.join(','),
      // Data rows
      ...data.map((item) => getRowData(item).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="assets/images/download-csv.svg"
      alt="Download CSV"
      onClick={exportToCSV}
      className="mr-2 flex w-6 cursor-pointer items-center hover:brightness-110"
    />
  );
}
