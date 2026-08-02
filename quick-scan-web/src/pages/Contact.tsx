import { Mail, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-text">Contact Us</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
        Have a question, found a bug, or want to suggest a feature? We'd like to
        hear from you.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-panel p-6">
          <Mail className="h-5 w-5 text-scan" strokeWidth={2} />
          <h2 className="mt-4 font-display text-sm font-semibold text-text">Email</h2>
          <a
            href="mailto:envalistechnologies@gmail.com"
            className="mt-1 block break-words text-sm text-muted hover:text-scan"
          >
            envalistechnologies@gmail.com
          </a>
        </div>

        <div className="rounded-xl border border-line bg-panel p-6">
          <Clock className="h-5 w-5 text-scan" strokeWidth={2} />
          <h2 className="mt-4 font-display text-sm font-semibold text-text">Response time</h2>
          <p className="mt-1 text-sm text-muted">Typically within 1–2 business days.</p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-6">
          <MessageCircle className="h-5 w-5 text-scan" strokeWidth={2} />
          <h2 className="mt-4 font-display text-sm font-semibold text-text">Bug reports</h2>
          <p className="mt-1 text-sm text-muted">
            Include your device model and app version for faster fixes.
          </p>
        </div>
      </div>

      <form
        className="mt-12 space-y-5 rounded-xl border border-line bg-panel p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-muted">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="mt-2 w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text outline-none focus:border-scan"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-2 w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text outline-none focus:border-scan"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="message" className="text-xs font-medium uppercase tracking-wide text-muted">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            className="mt-2 w-full rounded-lg border border-line bg-ink px-4 py-2.5 text-sm text-text outline-none focus:border-scan"
            placeholder="How can we help?"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-scan px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
        >
          Send message
        </button>
        <p className="text-xs text-muted">
          This form is a placeholder — wire it to your backend or email service
          (e.g. Formspree, Resend) before publishing, or link it directly to{' '}
          <a href="mailto:envalistechnologies@gmail.com" className="text-scan hover:underline">
            envalistechnologies@gmail.com
          </a>
          .
        </p>
      </form>
    </div>
  );
};

export default Contact;
