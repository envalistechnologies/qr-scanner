import { ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      'Quick Scan is designed to work with minimal data collection. We collect the following:',
    ],
    list: [
      'Camera access — used only to detect and decode QR codes and barcodes in real time. Camera frames are processed on your device and are not recorded, stored, or transmitted to our servers.',
      'Scan history — the decoded content of codes you scan (such as URLs, text, or contact details) is stored locally on your device so you can revisit past scans. This data is not uploaded to our servers unless you explicitly choose to back it up or share it.',
      'Device and usage data — basic, non-identifying analytics (such as app crashes, app version, and device type) may be collected to help us fix bugs and improve performance.',
    ],
  },
  {
    title: '2. How We Use Information',
    body: [
      'Any information collected is used solely to operate, maintain, and improve Quick Scan. We do not sell, rent, or trade your personal information to third parties for marketing purposes.',
    ],
  },
  {
    title: '3. Camera Permission',
    body: [
      'Quick Scan requests camera access as its core function is scanning QR codes and barcodes. You can revoke this permission at any time through your device settings, though doing so will prevent the app from scanning.',
    ],
  },
  {
    title: '4. Data Storage and Security',
    body: [
      'Scan history is stored locally on your device using standard secure storage mechanisms provided by your operating system. We take reasonable technical measures to protect any data we do process, but no method of electronic storage is 100% secure.',
    ],
  },
  {
    title: '5. Third-Party Services',
    body: [
      'Quick Scan may use third-party services (such as analytics or advertising providers) that collect information in accordance with their own privacy policies. Where applicable, these services are configured to minimize the collection of personally identifiable information.',
    ],
  },
  {
    title: '6. Children\u2019s Privacy',
    body: [
      'Quick Scan is not directed at children under the age of 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us so we can remove it.',
    ],
  },
  {
    title: '7. Your Choices',
    body: [
      'You can clear your scan history at any time from within the app. You can also disable camera permissions or uninstall the app to stop all data collection associated with Quick Scan.',
    ],
  },
  {
    title: '8. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Material changes will be reflected by an updated "Last updated" date below. Continued use of Quick Scan after changes take effect constitutes acceptance of the revised policy.',
    ],
  },
  {
    title: '9. Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how your data is handled, contact us at envalistechnologies@gmail.com.',
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-scanDim/50">
          <ShieldCheck className="h-5 w-5 text-scan" strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Privacy Policy</h1>
          <p className="font-mono text-xs text-muted">Last updated: August 2, 2026</p>
        </div>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        This Privacy Policy describes how Quick Scan ("we," "our," or "us"), developed by
        Envalis Technologies, collects, uses, and protects information when you use our
        QR code and barcode scanner application (the "App"). By using Quick Scan, you agree
        to the practices described in this policy.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-display text-lg font-semibold text-text">{section.title}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-4 space-y-2.5">
                {section.list.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-scan" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-line bg-panel p-5">
        <p className="text-sm text-muted">
          Questions about this policy? Reach us at{' '}
          <a href="mailto:envalistechnologies@gmail.com" className="text-scan hover:underline">
            envalistechnologies@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
