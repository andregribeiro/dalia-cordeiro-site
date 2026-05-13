import { useState, useMemo, useEffect, useRef } from 'react';
import type { Artwork, LocalizedString, LocalizedText } from '../lib/types';
import type { Lang } from '../lib/i18n';

const ui = {
  pt: {
    filter_series: 'Série',
    filter_status: 'Estado',
    filter_type: 'Tipo',
    all: 'Tudo',
    type_in_series: 'Em série',
    type_standalone: 'Individuais',
    standalone: 'Obras individuais',
    standalone_one: 'Obra individual',
    status_available: 'Disponível',
    status_sold: 'Vendida',
    status_reserved: 'Reservada',
    status_nfs: 'Não à venda',
    medium: 'Técnica',
    dimensions: 'Dimensões',
    year: 'Ano',
    series: 'Série',
    code: 'Referência',
    availability: 'Disponibilidade',
    inquire: 'Pedir informação sobre esta obra',
    close: 'Fechar',
    inquiry_for: 'Pedido para',
    load_more: 'Mostrar mais',
  },
  en: {
    filter_series: 'Series',
    filter_status: 'Status',
    filter_type: 'Type',
    all: 'All',
    type_in_series: 'In a series',
    type_standalone: 'Standalone',
    standalone: 'Standalone works',
    standalone_one: 'Standalone work',
    status_available: 'Available',
    status_sold: 'Sold',
    status_reserved: 'Reserved',
    status_nfs: 'Not for sale',
    medium: 'Medium',
    dimensions: 'Dimensions',
    year: 'Year',
    series: 'Series',
    code: 'Reference',
    availability: 'Availability',
    inquire: 'Inquire about this work',
    close: 'Close',
    inquiry_for: 'Inquiry for',
    load_more: 'Show more',
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

const PAGE_SIZE = 24;

export default function WorkGrid({ lang, artworks, imageUrls, sectionTitle, contactUrl }: Props) {
  const [seriesId, setSeriesId] = useState('all');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState<'all' | 'series' | 'standalone'>('all');
  const [openWork, setOpenWork] = useState<Artwork | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [seriesId, status, type]);

  const allSeries = useMemo(() => {
    const seen = new Map<string, { id: string; label: string }>();
    for (const w of artworks) {
      const s = w.series;
      if (!s?._id || seen.has(s._id)) continue;
      seen.set(s._id, { id: s._id, label: s.title || 'Sem nome' });
    }
    return Array.from(seen.values());
  }, [artworks]);

  const hasStandalone = useMemo(() => artworks.some((w) => !w.series?._id), [artworks]);

  const filtered = artworks.filter((w) => {
    if (type === 'series' && !w.series?._id) return false;
    if (type === 'standalone' && w.series?._id) return false;
    if (type !== 'standalone' && seriesId !== 'all' && w.series?._id !== seriesId) return false;
    if (status !== 'all' && w.status !== status) return false;
    return true;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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
          {hasStandalone && (
            <div className="filter-group">
              <span className="filter-label">{t(lang, 'filter_type')}</span>
              <button
                className={`chip${type === 'all' ? ' on' : ''}`}
                onClick={() => setType('all')}
              >
                {t(lang, 'all')}
              </button>
              <button
                className={`chip${type === 'series' ? ' on' : ''}`}
                onClick={() => setType('series')}
              >
                {t(lang, 'type_in_series')}
              </button>
              <button
                className={`chip${type === 'standalone' ? ' on' : ''}`}
                onClick={() => setType('standalone')}
              >
                {t(lang, 'type_standalone')}
              </button>
            </div>
          )}
          {type !== 'standalone' && (
            <div className="filter-group">
              <span className="filter-label">{t(lang, 'filter_series')}</span>
              <button
                className={`chip${seriesId === 'all' ? ' on' : ''}`}
                onClick={() => setSeriesId('all')}
              >
                {t(lang, 'all')}
              </button>
              {allSeries.map((s) => (
                <button
                  key={s.id}
                  className={`chip${seriesId === s.id ? ' on' : ''}`}
                  onClick={() => setSeriesId(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
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
          {visible.map((w) => {
            const cardTitle = w.title || w.series?.title || t(lang, 'standalone_one');
            return (
            <button key={w._id} className="card" onClick={() => setOpenWork(w)}>
              <div className="card-img">
                <img
                  src={imageUrls[w._id]}
                  alt={loc(w.image?.alt, lang) || `${cardTitle} — ${w.code}`}
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="600"
                />
                <span className="badge" data-s={w.status}>
                  <span className="dot" />
                  {t(lang, `status_${w.status}` as keyof (typeof ui)['pt'])}
                </span>
              </div>
              <div className="card-meta">
                <span className="card-title">{cardTitle}</span>
                <span className="card-year">{w.year}</span>
              </div>
              <div className="card-medium">
                <span className="card-code">{w.code}</span>
                {loc(w.medium, lang) && <> · {loc(w.medium, lang)}</>}
              </div>
            </button>
            );
          })}
        </div>

        {hasMore && (
          <div className="load-more-wrap">
            <button
              type="button"
              className="load-more"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              {t(lang, 'load_more')}
              <span className="load-more-count">
                {String(visible.length).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}
              </span>
            </button>
          </div>
        )}
      </section>

      {/* Modal */}
      {openWork && (
        <Modal
          work={openWork}
          works={filtered}
          lang={lang}
          imageUrls={imageUrls}
          onClose={() => setOpenWork(null)}
          onNavigate={setOpenWork}
          contactUrl={contactUrl}
        />
      )}
    </>
  );
}

/* ── Modal (inline to share types) ───────────────────────────── */

interface ModalProps {
  work: Artwork;
  works: Artwork[];
  lang: Lang;
  imageUrls: Record<string, string>;
  onClose: () => void;
  onNavigate: (work: Artwork) => void;
  contactUrl: string;
}

function Modal({ work, works, lang, imageUrls, onClose, onNavigate, contactUrl }: ModalProps) {
  const total = works.length;
  const currentIndex = works.findIndex((w) => w._id === work._id);
  const hasNav = total > 1;
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const goRelative = (offset: number) => {
    if (!hasNav || currentIndex < 0) return;
    const next = (currentIndex + offset + total) % total;
    onNavigate(works[next]);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !hasNav) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    goRelative(dx > 0 ? -1 : 1);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goRelative(-1);
      else if (e.key === 'ArrowRight') goRelative(1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work, works, onClose]);

  const seriesTitle = work.series?.title ?? '';
  const modalTitle = work.title || work.series?.title || t(lang, 'standalone_one');
  const inquireUrl = `${contactUrl}?code=${encodeURIComponent(work.code)}&series=${encodeURIComponent(seriesTitle)}&year=${work.year}`;
  const navLabels = lang === 'pt'
    ? { prev: 'Obra anterior', next: 'Obra seguinte' }
    : { prev: 'Previous work', next: 'Next work' };

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t(lang, 'close')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="modal-image" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <img src={imageUrls[work._id]} alt={loc(work.image?.alt, lang) || `${modalTitle} — ${work.code}`} decoding="async" />
          {hasNav && (
            <>
              <button
                type="button"
                className="modal-nav prev"
                onClick={() => goRelative(-1)}
                aria-label={navLabels.prev}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                className="modal-nav next"
                onClick={() => goRelative(1)}
                aria-label={navLabels.next}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="modal-counter" aria-hidden="true">
                {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </div>
            </>
          )}
        </div>
        <div className="modal-body">
          <div className="modal-series">{work.code}</div>
          <h3 className="modal-title">{modalTitle}</h3>
          <div className="modal-year">{work.year}</div>
          {loc(work.description, lang) && <p className="modal-desc">{loc(work.description, lang)}</p>}
          <dl className="modal-specs">
            <div>
              <dt>{t(lang, 'medium')}</dt>
              <dd>{loc(work.medium, lang) || '—'}</dd>
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
