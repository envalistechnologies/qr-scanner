import { Link } from 'react-router-dom';
import {
  ScanLine,
  Phone,
  MessageSquare,
  Wifi,
  Contact,
  Link2,
  MapPin,
  ShieldCheck,
  Zap,
  History,
} from 'lucide-react';

const detections = [
  { icon: Phone, label: 'Call a number' },
  { icon: MessageSquare, label: 'Send an SMS' },
  { icon: Wifi, label: 'Join Wi-Fi' },
  { icon: Contact, label: 'Save a contact' },
  { icon: Link2, label: 'Open a link' },
  { icon: MapPin, label: 'View a location' },
];

const features = [
  {
    icon: Zap,
    title: 'Instant recognition',
    description:
      'Point your camera and Quick Scan decodes QR codes and barcodes the moment they come into frame.',
  },
  {
    icon: ScanLine,
    title: 'Every format, one app',
    description:
      'From product barcodes to Wi-Fi credentials and vCards, Quick Scan reads the format and shows you exactly what to do next.',
  },
  {
    icon: History,
    title: 'Scan history',
    description:
      'Every scan is saved locally so you can revisit a link, number, or code without scanning it twice.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    description:
      'Scans are processed on your device. Quick Scan does not read or store the contents of your camera feed.',
  },
];

const Home = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-scan">
              <span className="h-1.5 w-1.5 rounded-full bg-scan" />
              Now scanning faster than ever
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-text md:text-5xl">
              Point. Scan.
              <br />
              <span className="text-scan">Done.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Quick Scan reads any QR code or barcode and instantly tells you what
              it's for — call, text, Wi-Fi, contact, or link — no guessing, no
              extra taps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#download"
                className="rounded-lg bg-scan px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
              >
                Get Quick Scan
              </a>
              <Link
                to="/faq"
                className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-text transition-colors hover:border-scan/50 hover:text-scan"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* Viewfinder signature element */}
          <div className="relative mx-auto flex h-80 w-80 items-center justify-center">
            <div className="absolute inset-0 rounded-3xl border border-line bg-panel" />
            <div className="absolute inset-6 overflow-hidden rounded-2xl border border-scan/30">
              <div className="absolute left-0 right-0 h-0.5 bg-scan/80 shadow-[0_0_12px_2px_rgba(0,229,160,0.6)] animate-scanline" />
              <div className="flex h-full w-full items-center justify-center">
                <ScanLine className="h-16 w-16 text-scan/50" strokeWidth={1.25} />
              </div>
            </div>
            {/* corner brackets */}
            {['top-3 left-3 border-t border-l', 'top-3 right-3 border-t border-r', 'bottom-3 left-3 border-b border-l', 'bottom-3 right-3 border-b border-r'].map(
              (pos, i) => (
                <span
                  key={i}
                  className={`absolute h-6 w-6 border-scan ${pos}`}
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* What it detects */}
      <section className="border-b border-line bg-panel/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-text">
            One scan, every action
          </h2>
          <p className="mt-2 max-w-lg text-sm text-muted">
            Quick Scan reads the code and shows only the actions that actually
            apply to it.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {detections.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-line bg-ink px-3 py-5 text-center"
              >
                <Icon className="h-5 w-5 text-scan" strokeWidth={2} />
                <span className="text-xs text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-text">
          Built for speed, kept private
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-line bg-panel p-6 transition-colors hover:border-scan/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-scanDim/50">
                <Icon className="h-5 w-5 text-scan" strokeWidth={2} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-text">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="download" className="border-t border-line bg-panel/40">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Scan smarter today
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Quick Scan is free to download. No account required to start scanning.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="#"
              className="rounded-lg bg-scan px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Download on Play Store
            </a>
            <a
              href="#"
              className="rounded-lg border border-line px-5 py-3 text-sm font-semibold text-text transition-colors hover:border-scan/50 hover:text-scan"
            >
              Download on App Store
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
