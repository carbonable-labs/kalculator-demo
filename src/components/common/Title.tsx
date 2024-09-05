import Image from 'next/image';

export default function Title() {
  return (
    <div className="mt-4 flex items-center justify-center">
      <Image src="/assets/logo.svg" alt="Logo" width={80} height={80} />
      <div className="ml-1 text-4xl font-bold text-neutral-50">ALCULTATOR</div>
    </div>
  );
}
