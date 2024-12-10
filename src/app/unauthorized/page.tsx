import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="mt-24 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-8 text-center">
        {/* Error Status */}
        <h1 className="text-5xl font-bold text-neutral-100">Unauthorized Access</h1>

        {/* Main Message */}
        <div className="space-y-4">
          <p className="text-neutral-200">
            You don&apos;t have permission to access this application. Please ensure you&apos;re
            accessing from your authorized domain.
          </p>
        </div>

        {/* Contact Information */}
        <div className="pt-6">
          <p className="text-sm text-neutral-300">
            Need help? Contact us at{' '}
            <a
              href="mailto:reachout@carbonable.io"
              className="text-greenish-600 hover:text-greenish-500"
            >
              reachout@carbonable.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
