import { Link } from 'react-router-dom';
import { ScanLine, Mail, GitFork } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-scan" strokeWidth={2.25} />
              <span className="font-display text-base font-semibold text-text">Quick Scan</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              A fast, accurate QR code and barcode scanner for everyday use — links,
              contacts, Wi-Fi, and more, decoded instantly.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <Link to="/privacy-policy" className="transition-colors hover:text-scan">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use" className="transition-colors hover:text-scan">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-scan">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-text">
              Contact
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-scan" />
                <a
                  href="mailto:envalistechnologies@gmail.com"
                  className="transition-colors hover:text-scan"
                >
                  envalistechnologies@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-scan" />
                <Link to="/contact" className="transition-colors hover:text-scan">
                  Support form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-muted md:flex-row">
          <p>© {year} Envalis Technologies. All rights reserved.</p>
          <p className="font-mono">Quick Scan — built for speed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
