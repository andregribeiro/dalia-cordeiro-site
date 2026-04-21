import { useState, useMemo, useEffect } from 'react';
import type { Artwork, LocalizedString, LocalizedText } from '../lib/types';
import type { Lang } from '../lib/i18n';
import { seriesNames } from '../lib/i18n';

// Re-export ui translations needed client-side
const ui = {
  pt: {
    filter_series: 'Série',
    filter_status: 'Estado',
    all: 'Tudo',
    status_available: 'Disponível',
    status_sold: 'Vendida',
    status_reserved: 'Reservada',
    status_nfs: 'Não à venda',
    medium: 'Técnica',
    dimensions: 'Dimensões',
    year: 'Ano',
    series: 'Série',
    availability: 'Disponibilidade',
    inquire: 'Pedir informação sobre esta obra',
    close: 'Fechar',
    inquiry_for: 'Pedido para',
  },
  en: {
    filter_series: 'Series',
    filter_status: 'Status',
    all: 'All',
    status_available: 'Available',
    status_sold: 'Sold',
    status_reserved: 'Reserved',
    status_nfs: 'Not for sale',
    medium: 'Medium',
    dimensions: 'Dimensions',
    year: 'Year',
    series: 'Series',
    availability: 'Availability',
    inquire: 'Inquire about this work',
    close: 'Close',
    inquiry_for: 'Inquiry for',
  },
} as const;

function t(lang: Lang, key: keyof (typeof ui)['pt']): string {
  return ui[lang][key] ?? key;
}

function loc(field: LocalizedString | LocalizedText | undefined, lang: Lang): string {
  if (!field) return '';
  return field[lang] || field.pt || '';
}

interface Props {
  lang: Lang;
  artworks: Artwork[];
  imageUrls: Record<string, string>; // _id → url (pre-built on server)
  sectionTitle: string;
  contactUrl: string;
}

export default function WorkGrid({ lang, artworks, imageUrls, sectionTitle, contactUrl }: Props) {
  const [series, setSeries] = useState('all');
  const [status, setStatus] = useState('all');
  const [openWork, setOpenWork] = useState<Artwork | null>(null);

  const allSeries = useMemo(() => {
    const seen = new Set<string>();
    return artworks
      .map((w) => w.series)
      .filter((s) => {
        if (!s || seen.has(s)) return false;
        seen.add(s);
        return true;
      })
      .map((key) => ({
        key,
        label: seriesNames[key]?.[lang] ?? key,
      }));
  }, [artworks, lang]);

  const filtered = artworks.filter(
    (w) =>
      (series === 'all' || w.series === series) &&
      (status === 'all' || w.status === status),
  );

  return (
    <>
      <section className="wrap" id="works">
        <div className="section-head">
          <h2 dangerouslySetInnerHTML={{ __html: sectionTitle }} />
          <div className="section-counter">
            {String(filtered.length).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <span className="filter-label">{t(lang, 'filter_series')}</span>
            <button
              className={`chip${series === 'all' ? ' on' : ''}`}
              onClick={() => setSeries('all')}
            >
              {t(lang, 'all')}
            </button>
            {allSeries.map((s) => (
              <button
                key={s.key}
                className={`chip${series === s.key ? ' on' : ''}`}
                onClick={() => setSeries(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="filter-group">
            <span className="filter-label">{t(lang, 'filter_status')}</span>
            {(['all', 'available', 'sold', 'reserved', 'nfs'] as const).map((k) => (
              <button
                key={k}
                className={`chip${status === k ? ' on' : ''}`}
                onClick={() => setStatus(k)}
              >
                {k === 'all' ? t(lang, 'all') : t(lang, `status_${k}` as keyof (typeof ui)['pt'])}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid">
          {filtered.map((w) => (
            <button key={w._id} className="card" onClick={() => setOpenWork(w)}>
              <div className="card-img">
                <img
                  src={imageUrls[w._id]}
                  alt={loc(w.image?.alt, lang) || w.title}
                  loading="lazy"
                  width="600"
                  height="600"
                />
                <span className="badge" data-s={w.status}>
                  <span className="dot" />
                  {t(lang, `status_${w.status}` as keyof (typeof ui)['pt'])}
                </span>
              </div>
              <div className="card-meta">
                <span className="card-title">{w.title}</span>
                <span className="card-year">{w.year}</span>
              </div>
              <div className="card-medium">{loc(w.medium, lang)}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}
      {openWork && (
        <Modal
          work={openWork}
          lang={lang}
          imageUrl={imageUrls[openWork._id]}
          onClose={() => setOpenWork(null)}
          contactUrl={contactUrl}
        />
      )}
    </>
  );
}

/* ── Modal (inline to share types) ───────────────────────────── */

interface ModalProps {
  work: Artwork;
  lang: Lang;
  imageUrl: string;
  onClose: () => void;
  contactUrl: string;
}

function Modal({ work, lang, imageUrl, onClose, contactUrl }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const inquireUrl = `${contactUrl}?work=${encodeURIComponent(work.title)}&year=${work.year}`;

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t(lang, 'close')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="modal-image">
          <img src={imageUrl} alt={loc(work.image?.alt, lang) || work.title} />
        </div>
        <div className="modal-body">
          <div className="modal-series">
            {seriesNames[work.series]?.[lang] ?? work.series}
          </div>
          <h3 className="modal-title">{work.title}</h3>
          <div className="modal-year">{work.year}</div>
          <p className="modal-desc">{loc(work.description, lang)}</p>
          <dl className="modal-specs">
            <div>
              <dt>{t(lang, 'medium')}</dt>
              <dd>{loc(work.medium, lang)}</dd>
            </div>
            <div>
              <dt>{t(lang, 'dimensions')}</dt>
              <dd>
                {work.dimensions?.cm}{' '}
                <span style={{ color: 'var(--muted)' }}>· {work.dimensions?.in}</span>
              </dd>
            </div>
            <div>
              <dt>{t(lang, 'year')}</dt>
              <dd>{work.year}</dd>
            </div>
            <div>
              <dt>{t(lang, 'availability')}</dt>
              <dd>
                <span className="av" data-s={work.status}>
                  <span className="dot" />
                  {t(lang, `status_${work.status}` as keyof (typeof ui)['pt'])}
                </span>
              </dd>
            </div>
          </dl>
          <a
            className="modal-inquire"
            href={work.status === 'nfs' ? undefined : inquireUrl}
            aria-disabled={work.status === 'nfs'}
            style={work.status === 'nfs' ? { background: 'var(--muted)', cursor: 'not-allowed', pointerEvents: 'none' } : undefined}
          >
            {t(lang, 'inquire')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
