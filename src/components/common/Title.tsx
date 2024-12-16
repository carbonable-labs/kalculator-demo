import Image from 'next/image';
import { FaChartColumn } from 'react-icons/fa6';

export default function Title() {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="mt-1 flex items-center text-gray-500">
        <FaChartColumn className="text-xl" />
        <span className="ml-2 text-xl font-light">PLANIFIER</span>
      </div>

      <div className="flex items-center">
        <Image src="/assets/logo.svg" alt="Carbonable Logo" width={40} height={40} />
        <span className="ml-2 text-xl font-bold text-white">CARBONABLE</span>
      </div>
    </div>
  );
}
