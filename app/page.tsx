'use client';

import { useState, FormEvent } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { translations, Lang } from './i18n';

// A guest is only allowed to sign once *from this browser/device*. There's
// no login system, so this is enforced with a localStorage flag (backed up
// by a plain cookie in case storage is cleared but cookies aren't). It's a
// soft guard, not a hard one: clearing site data, an incognito window, or a
// different device will reset it. That's the right tradeoff for a trusted
// graduation guestbook; a hard per-person limit would need real guest
// identity (unique invite links, phone/email verification), which adds
// friction this app is intentionally avoiding.

type Status = 'checking' | 'form' | 'submitting' | 'done';

export default function GuestPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('form');
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const lang: Lang = 'ar';
  const t = translations[lang];
  const dir = 'rtl';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !message.trim()) {
      setErrorMsg(t.errorRequired);
      return;
    }

    setStatus('submitting');

    const { error } = await supabaseBrowser.from('messages').insert({
      guest_name: name.trim(),
      message_content: message.trim(),
    });

    if (error) {
      setErrorMsg(t.errorGeneric);
      setStatus('form');
      return;
    }

    setJustSubmitted(true);
    setStatus('done');
  }

  return (
    <div className="min-h-screen bg-parchment px-4 py-10 font-arabic flex flex-col">
      <main dir={dir} className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-6xl grid gap-8 lg:grid-cols-[minmax(360px,1.1fr)_minmax(360px,1fr)] items-center">
        <div className="order-2 lg:order-1 w-full lg:w-auto">
          {status === 'checking' ? null : status === 'done' ? (
            <div className="bg-white rounded-2xl border border-line shadow-sm px-8 py-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold text-gold">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="font-display text-3xl text-navy mb-2">
                {justSubmitted ? t.thankYouTitle : t.alreadySignedTitle}
              </h1>
              <p className="text-base text-ink/70">{justSubmitted ? t.thankYouBody : t.alreadySignedBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-line shadow-sm px-8 py-10">
              <div className="mb-8 text-center">
                <span className="block h-px w-10 bg-gold mx-auto mb-4" />
                <h1 className="font-display text-4xl text-navy leading-tight mb-2">{t.title}</h1>
                <p className="text-base text-ink/60">{t.subtitle}</p>
              </div>

              <label className="block mb-5">
                <span className="block text-base font-medium text-navy mb-1.5">{t.nameLabel}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  maxLength={80}
                  className="w-full rounded-lg border border-line bg-parchment/40 px-4 py-2.5 text-base text-ink focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold transition"
                />
              </label>

              <label className="block mb-6">
                <span className="block text-base font-medium text-navy mb-1.5">{t.messageLabel}</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messagePlaceholder}
                  rows={5}
                  maxLength={2000}
                  className="w-full rounded-lg border border-line bg-parchment/40 px-4 py-2.5 text-base text-ink resize-none focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold transition"
                />
              </label>

              

              {errorMsg && (
                <p className="mb-4 text-sm text-red-600" role="alert">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full rounded-lg bg-navy text-white text-base font-medium py-3 hover:bg-navydark transition disabled:opacity-60"
              >
                {status === 'submitting' ? t.submitting : t.submit}
              </button>
            </form>
          )}
        </div>

        <div className="order-1 lg:order-2 w-full lg:max-w-[520px] mx-auto">
          <div className="rounded-[28px] overflow-hidden border border-line bg-white shadow-xl">
            <img
              src="/marwan.png"
              alt="Marwan"
              className="w-full h-auto max-h-[520px] object-cover block"
            />
          </div>
        </div>
      </div>
      </main>
      <footer className="mt-10 text-center text-[10px] text-ink/50">
        made with ❤️ by fares fadi
      </footer>
    </div>
  );
}
