import { Link } from 'react-router-dom';
import { ScanLine } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-28 text-center">
      <ScanLine className="h-10 w-10 text-scan" strokeWidth={1.5} />
      <h1 className="mt-6 font-display text-3xl font-semibold text-text">
        Nothing to decode here
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        This page doesn't exist. Let's get you back to something scannable.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg bg-scan px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
