import { useState, useEffect } from 'react';
import type { Lang } from '../lib/i18n';

const ui = {
  pt: {
    name: 'O seu nome',
    email: 'O seu email',
    message: 'Mensagem',
    send: 'Enviar pedido',
    sent: 'Obrigada — mensagem enviada.',
    error: 'Erro ao enviar. Tente novamente.',
  },
  en: {
    name: 'Your name',
    email: 'Your email',
    message: 'Message',
    send: 'Send inquiry',
    sent: 'Thank you — message sent.',
    error: 'Failed to send. Please try again.',
  },
} as const;

interface Props {
  lang: Lang;
  accessKey: string;
}

interface InquiryMeta {
  code?: string;
  series?: string;
  year?: string;
}

function buildPrefill(lang: Lang, meta: InquiryMeta): string {
  if (!meta.code) return '';
  const labels =
    lang === 'pt'
      ? {
          intro: 'Venho por este meio pedir informação sobre a seguinte obra:',
          ref: 'Referência',
          series: 'Série',
          year: 'Ano',
        }
      : {
          intro: 'I would like to inquire about the following work:',
          ref: 'Reference',
          series: 'Series',
          year: 'Year',
        };
  const lines = [
    labels.intro,
    '',
    `• ${labels.ref}: ${meta.code}`,
    meta.series ? `• ${labels.series}: ${meta.series}` : null,
    meta.year ? `• ${labels.year}: ${meta.year}` : null,
    '',
    '',
  ].filter((l): l is string => l !== null);
  return lines.join('\n');
}

function buildSubject(lang: Lang, name: string, meta: InquiryMeta): string {
  const ref = [meta.code, meta.series].filter(Boolean).join(' · ');
  if (ref) {
    return lang === 'pt'
      ? `Pedido sobre ${ref} — ${name}`
      : `Inquiry about ${ref} — ${name}`;
  }
  return lang === 'pt' ? `Pedido de contacto — ${name}` : `Contact inquiry — ${name}`;
}

export default function ContactForm({ lang, accessKey }: Props) {
  const t = ui[lang];
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [meta, setMeta] = useState<InquiryMeta>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next: InquiryMeta = {
      code: params.get('code') ?? undefined,
      series: params.get('series') ?? undefined,
      year: params.get('year') ?? undefined,
    };
    setMeta(next);
    const prefill = buildPrefill(lang, next);
    if (prefill) setForm((f) => ({ ...f, message: prefill }));
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const payload: Record<string, unknown> = {
      access_key: accessKey,
      name: form.name,
      email: form.email,
      message: form.message,
      from_name: 'Dália Cordeiro Website',
      subject: buildSubject(lang, form.name, meta),
    };
    if (meta.code) payload.obra = meta.code;
    if (meta.series) payload.serie = meta.series;
    if (meta.year) payload.ano = meta.year;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
