import { useState, useEffect } from 'react';
import type { Lang } from '../lib/i18n';

const ui = {
  pt: {
    name: 'O seu nome',
    email: 'O seu email',
    message: 'Mensagem',
    send: 'Enviar pedido',
    sent: 'Obrigada — mensagem enviada.',
    inquiry_for: 'Pedido para',
    error: 'Erro ao enviar. Tente novamente.',
  },
  en: {
    name: 'Your name',
    email: 'Your email',
    message: 'Message',
    send: 'Send inquiry',
    sent: 'Thank you — message sent.',
    inquiry_for: 'Inquiry for',
    error: 'Failed to send. Please try again.',
  },
} as const;

interface Props {
  lang: Lang;
  accessKey: string;
}

export default function ContactForm({ lang, accessKey }: Props) {
  const t = ui[lang];
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Pre-fill message from query params (?work=...&year=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const work = params.get('work');
    const year = params.get('year');
    if (work) {
      const prefix =
        lang === 'pt'
          ? `Venho por este meio pedir informação sobre "${work}" (${year ?? ''}).\n\n`
          : `I'm writing to inquire about "${work}" (${year ?? ''}).\n\n`;
      setForm((f) => ({ ...f, message: prefix }));
    }
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          name: form.name,
          email: form.email,
          message: form.message,
          from_name: 'Dália Cordeiro Website',
          subject: `Inquiry from ${form.name}`,
        }),
      });

      if (res.ok) {
        setStatus('sent');
        setTimeout(() => {
          setStatus('idle');
          setForm({ name: '', email: '', message: '' });
        }, 4000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <label>{t.name}</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>{t.email}</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label>{t.message}</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      {status === 'sent' ? (
        <div className="form-sent">{t.sent}</div>
      ) : status === 'error' ? (
        <>
          <div className="form-sent" style={{ color: 'var(--bad)' }}>{t.error}</div>
          <button type="submit" className="form-submit" style={{ marginTop: 8 }}>
            {t.send}
          </button>
        </>
      ) : (
        <button type="submit" className="form-submit" disabled={status === 'sending'}>
          {status === 'sending' ? '...' : t.send}
        </button>
      )}
    </form>
  );
}
