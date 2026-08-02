import { FileText } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By downloading, installing, or using Quick Scan (the "App"), developed by Envalis Technologies, you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the App.',
    ],
  },
  {
    title: '2. Description of Service',
    body: [
      'Quick Scan is a QR code and barcode scanning application that decodes scanned content and presents relevant actions, such as opening a link, calling a number, sending a message, connecting to Wi-Fi, or saving a contact.',
    ],
  },
  {
    title: '3. User Responsibilities',
    body: [
      'You agree to use Quick Scan only for lawful purposes. You are solely responsible for any actions you take as a result of a scanned code, including visiting links, calling numbers, or connecting to networks. Quick Scan does not verify the safety or legitimacy of scanned content.',
    ],
  },
  {
    title: '4. Camera and Device Permissions',
    body: [
      'The App requires camera access to function. You are responsible for granting or revoking this permission through your device settings. We are not responsible for any inability to use the App resulting from denied permissions.',
    ],
  },
  {
    title: '5. Third-Party Content and Links',
    body: [
      'Scanned codes may direct you to third-party websites, contacts, networks, or content that we do not control. We are not responsible for the content, accuracy, or safety of any third-party destination accessed through a scanned code. Exercise caution before interacting with unfamiliar QR codes.',
    ],
  },
  {
    title: '6. Intellectual Property',
    body: [
      'The App, including its design, branding, and underlying code, is the property of Envalis Technologies and is protected by applicable intellectual property laws. You may not copy, modify, distribute, or reverse-engineer the App without prior written permission.',
    ],
  },
  {
    title: '7. Disclaimer of Warranties',
    body: [
      'Quick Scan is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not guarantee that the App will be error-free, uninterrupted, or that all scans will be decoded accurately.',
    ],
  },
  {
    title: '8. Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, Envalis Technologies shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the App, including but not limited to damages resulting from actions taken based on scanned content.',
    ],
  },
  {
    title: '9. Termination',
    body: [
      'We reserve the right to suspend or discontinue the App, or your access to it, at any time, with or without notice, for any reason including violation of these Terms.',
    ],
  },
  {
    title: '10. Changes to These Terms',
    body: [
      'We may revise these Terms of Use from time to time. Continued use of the App after changes take effect constitutes your acceptance of the revised terms.',
    ],
  },
  {
    title: '11. Governing Law',
    body: [
      'These Terms shall be governed by and construed in accordance with applicable local laws, without regard to conflict of law principles.',
    ],
  },
  {
    title: '12. Contact Us',
    body: [
      'If you have questions about these Terms of Use, contact us at envalistechnologies@gmail.com.',
    ],
  },
];

const TermsOfUse = () => {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-scanDim/50">
          <FileText className="h-5 w-5 text-scan" strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Terms of Use</h1>
          <p className="font-mono text-xs text-muted">Last updated: August 2, 2026</p>
        </div>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        These Terms of Use ("Terms") govern your access to and use of Quick Scan, developed
        by Envalis Technologies. Please read them carefully before using the App.
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
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-line bg-panel p-5">
        <p className="text-sm text-muted">
          Questions about these terms? Reach us at{' '}
          <a href="mailto:envalistechnologies@gmail.com" className="text-scan hover:underline">
            envalistechnologies@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default TermsOfUse;
