import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'What types of codes can Quick Scan read?',
    a: 'Quick Scan reads standard QR codes and common 1D barcodes (UPC, EAN, Code 128, and more), including QR codes that encode URLs, phone numbers, SMS messages, Wi-Fi credentials, contacts (vCard), and plain text.',
  },
  {
    q: 'Does Quick Scan work without an internet connection?',
    a: 'Yes. Scanning and decoding happen entirely on your device. An internet connection is only needed if the scanned content itself requires one, such as opening a website.',
  },
  {
    q: 'Does Quick Scan store the codes I scan?',
    a: 'Scan history is saved locally on your device so you can revisit past scans. It is not uploaded to our servers unless you explicitly choose to export or back it up.',
  },
  {
    q: 'Why does the app need camera access?',
    a: 'Camera access is required to detect and decode QR codes and barcodes in real time. Quick Scan does not record or store your camera feed.',
  },
  {
    q: 'Is Quick Scan free to use?',
    a: 'Yes, Quick Scan is free to download and use. Some versions may include ads to support development.',
  },
  {
    q: 'How do I clear my scan history?',
    a: 'Open the History tab within the app and use the clear option to remove all saved scans from your device.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-scanDim/50">
          <HelpCircle className="h-5 w-5 text-scan" strokeWidth={2} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-text">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="mt-10 divide-y divide-line rounded-xl border border-line bg-panel">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q}>
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="font-display text-sm font-semibold text-text">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-scan transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-line bg-panel p-5 text-sm text-muted">
        Still have a question?{' '}
        <a href="mailto:envalistechnologies@gmail.com" className="text-scan hover:underline">
          envalistechnologies@gmail.com
        </a>
      </div>
    </div>
  );
};

export default FAQ;
