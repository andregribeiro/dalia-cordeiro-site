const { useState, useEffect, useMemo, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "paper",
  "accent": "coral",
  "density": "regular",
  "defaultLang": "en"
}/*EDITMODE-END*/;

function readTweaks() {
  try {
    const t = JSON.parse(localStorage.getItem('dc_tweaks') || 'null');
    return { ...TWEAK_DEFAULTS, ...(t || {}) };
  } catch { return { ...TWEAK_DEFAULTS }; }
}

function applyTheme(t) {
  document.body.classList.remove('theme-paper','theme-dark','theme-bright');
  document.body.classList.add('theme-' + t.theme);
  document.body.classList.remove('accent-coral','accent-sage','accent-lavender','accent-mustard');
  document.body.classList.add('accent-' + t.accent);
  document.body.classList.remove('grid-regular','grid-dense','grid-airy');
  document.body.classList.add('grid-' + t.density);
}

function t(lang, key) { return (window.I18N[lang] || window.I18N.en)[key] || key; }

function Header({ lang, setLang, onNav, active }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">Dália <span>Cordeiro</span></div>
        <nav className="nav">
          <a className={active==='works'?'active':''} onClick={() => onNav('works')}>{t(lang,'nav_works')}</a>
          <a className={active==='about'?'active':''} onClick={() => onNav('about')}>{t(lang,'nav_about')}</a>
          <a className={active==='contact'?'active':''} onClick={() => onNav('contact')}>{t(lang,'nav_contact')}</a>
        </nav>
        <div className="header-right">
          <div className="lang-switch">
            <button className={lang==='en'?'on':''} onClick={() => setLang('en')}>EN</button>
            <span className="sep">/</span>
            <button className={lang==='pt'?'on':''} onClick={() => setLang('pt')}>PT</button>
          </div>
          <a className="ig-link" href="https://www.instagram.com/dalia_cordeiro_art/" target="_blank" rel="noreferrer" title="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="18" height="18" rx="4"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({ lang, onExplore, featured }) {
  return (
    <section className="hero wrap" data-screen-label="Hero">
      <div className="hero-grid">
        <div>
          <div className="hero-meta">{t(lang,'tagline')}</div>
          <h1>Bodies that <em>refuse</em><br/>to stay put.</h1>
          <p className="intro">{t(lang,'intro')}</p>
          <button className="hero-cta" onClick={onExplore}>
            {t(lang,'view_works')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div>
          <div className="hero-featured">
            <img src={featured.image} alt={featured.title[lang]} />
          </div>
          <div className="hero-featured-cap">
            <span><em>{featured.title[lang]}</em> &nbsp;·&nbsp; {featured.medium[lang]}</span>
            <span>{featured.year}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ status, lang }) {
  const key = 'status_' + status;
  return (
    <span className="badge" data-s={status}>
      <span className="dot"></span>{t(lang, key)}
    </span>
  );
}

function Card({ work, lang, onOpen }) {
  return (
    <button className="card" onClick={() => onOpen(work)}>
      <div className="card-img">
        <img src={work.image} alt={work.title[lang]} loading="lazy" />
        <StatusBadge status={work.status} lang={lang} />
      </div>
      <div className="card-meta">
        <span className="card-title">{work.title[lang]}</span>
        <span className="card-year">{work.year}</span>
      </div>
      <div className="card-medium">{work.medium[lang]}</div>
    </button>
  );
}

function Works({ lang, onOpen }) {
  const [series, setSeries] = useState('all');
  const [status, setStatus] = useState('all');

  const allSeries = useMemo(() => {
    const s = new Map();
    window.ARTWORKS.forEach(w => s.set(w.series.en, w.series[lang]));
    return Array.from(s, ([k,v]) => ({ key:k, label:v }));
  }, [lang]);

  const filtered = window.ARTWORKS.filter(w =>
    (series === 'all' || w.series.en === series) &&
    (status === 'all' || w.status === status)
  );

  return (
    <section className="wrap" id="works" data-screen-label="Works">
      <div className="section-head">
        <h2><em>Works</em>, 2022 — 2026</h2>
        <div className="section-counter">{String(filtered.length).padStart(2,'0')} / {String(window.ARTWORKS.length).padStart(2,'0')}</div>
      </div>
      <div className="filters">
        <div className="filter-group">
          <span className="filter-label">{t(lang,'filter_series')}</span>
          <button className={'chip ' + (series==='all'?'on':'')} onClick={() => setSeries('all')}>{t(lang,'all')}</button>
          {allSeries.map(s => (
            <button key={s.key} className={'chip ' + (series===s.key?'on':'')} onClick={() => setSeries(s.key)}>{s.label}</button>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-label">{t(lang,'filter_status')}</span>
          {['all','available','sold','reserved','nfs'].map(k => (
            <button key={k} className={'chip ' + (status===k?'on':'')} onClick={() => setStatus(k)}>
              {k==='all' ? t(lang,'all') : t(lang,'status_'+k)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid">
        {filtered.map(w => <Card key={w.id} work={w} lang={lang} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

function Modal({ work, lang, onClose, onInquire }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  if (!work) return null;
  return (
    <div className={'modal-backdrop ' + (work?'open':'')} onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
        <div className="modal-image">
          <img src={work.image} alt={work.title[lang]} />
        </div>
        <div className="modal-body">
          <div className="modal-series">{work.series[lang]}</div>
          <h3 className="modal-title">{work.title[lang]}</h3>
          <div className="modal-year">{work.year}</div>
          <p className="modal-desc">{work.description[lang]}</p>
          <dl className="modal-specs">
            <div><dt>{t(lang,'medium')}</dt><dd>{work.medium[lang]}</dd></div>
            <div><dt>{t(lang,'dimensions')}</dt><dd>{work.dimensions.cm} <span style={{color:'var(--muted)'}}>· {work.dimensions.in}</span></dd></div>
            <div><dt>{t(lang,'year')}</dt><dd>{work.year}</dd></div>
            <div><dt>{t(lang,'availability')}</dt>
              <dd>
                <span className="av" data-s={work.status}>
                  <span className="dot"></span>{t(lang,'status_'+work.status)}
                </span>
              </dd>
            </div>
          </dl>
          <button className="modal-inquire" onClick={() => onInquire(work)} disabled={work.status==='nfs'}>
            {t(lang,'inquire')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function About({ lang }) {
  const bio = lang === 'en' ? {
    intro: 'Dália Cordeiro was born in Barreiro in 1955. She trained in Visual and Technological Education at Instituto Piaget, Almada, and taught visual arts for more than thirty-five years in the Portuguese public school system, in particular at Escola Álvaro Velho in Barreiro.',
    p2: 'In recent years she has devoted herself entirely to her practice. Since 2012 she has exhibited regularly in group and solo shows, but it is above all since 2021 that her work has gained wider public reach — through iconic salons of modern and contemporary art, biennials and art fairs.',
    p3: 'Alongside her participation in the IV Biennial of Genoa, her consecutive selections for the Salon d\'Automne de Paris and Art Capital Paris — historic juried salons — reflect the relevance of a body of work that oscillates between surrealist and expressionist registers.',
    p4: 'In 2025, besides being selected again for both Parisian events, she presented solo exhibitions in Évora — at the Biblioteca Pública de Évora (founded in 1805) and at Galeria do Palácio do Barrocal, a historic building of the Fundação Inatel. That same year she was selected for the International Biennial of Gaia with the painting "Alienação", a critical reflection on the progressive fusion of the human and the machine.',
    sel: 'Selected'
  } : {
    intro: 'Dália Cordeiro nasceu no Barreiro em 1955. Formou-se em Educação Visual e Tecnológica pelo Instituto Piaget em Almada e lecionou artes visuais durante mais de trinta e cinco anos na escola pública portuguesa, em particular na Escola Álvaro Velho no Barreiro.',
    p2: 'Nos últimos anos tem-se dedicado por inteiro à produção artística. Desde 2012 expõe regularmente em mostras coletivas e individuais, mas foi sobretudo desde 2021 que a sua obra ganhou uma maior projeção pública — através de icónicos salões de arte moderna e contemporânea, bem como de bienais e feiras de arte.',
    p3: 'Para além da sua participação na IV Bienal de Génova, as suas consecutivas participações no Salon d\'Automne de Paris e na Art Capital Paris — históricos salões constituídos por um júri crítico — são reflexos da pertinência de um trabalho que oscila entre representações surrealistas e expressionistas.',
    p4: 'Em 2025, para além de ter sido selecionada para estes dois eventos da capital francesa, a sua obra foi exposta individualmente em Évora — na Biblioteca Pública de Évora (fundada em 1805) e na Galeria do Palácio do Barrocal, histórico edifício integrado na Fundação Inatel. Nesse mesmo ano foi selecionada para a Bienal Internacional de Gaia com a obra "Alienação", uma pintura crítica à progressiva fusão entre a humanidade e a máquina.',
    sel: 'Seleção'
  };
  const highlights = [
    { y:'2025', t: lang==='en' ? 'International Biennial of Gaia — “Alienação”' : 'Bienal Internacional de Gaia — “Alienação”' },
    { y:'2025', t: lang==='en' ? 'Solo show · Biblioteca Pública de Évora' : 'Individual · Biblioteca Pública de Évora' },
    { y:'2025', t: lang==='en' ? 'Solo show · Galeria do Palácio do Barrocal, Fundação Inatel' : 'Individual · Galeria do Palácio do Barrocal, Fundação Inatel' },
    { y:'2025', t: lang==='en' ? 'Salon d’Automne · Art Capital, Paris' : 'Salon d’Automne · Art Capital, Paris' },
    { y:'—',    t: lang==='en' ? 'IV Biennial of Genoa' : 'IV Bienal de Génova' },
  ];
  return (
    <section className="about wrap" id="about" data-screen-label="About">
      <div className="about-portrait">
        <img src="art/portrait.png" alt="Dália Cordeiro" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
        <div className="portrait-caption">{lang==='en' ? 'The artist in the studio' : 'A artista no atelier'}</div>
      </div>
      <div>
        <h2>{t(lang,'about_title')} — <em>Dália Cordeiro</em></h2>
        <p>{bio.intro}</p>
        <p>{bio.p2}</p>
        <p>{bio.p3}</p>
        <p>{bio.p4}</p>
        <dl className="about-stats">
          <div><dt>{lang==='en'?'Born':'Nascida em'}</dt><dd>Barreiro, 1955</dd></div>
          <div><dt>{lang==='en'?'Working in':'Trabalha com'}</dt><dd>{lang==='en'?'Oil · Pastel · Mixed':'Óleo · Pastel · Mista'}</dd></div>
          <div><dt>{lang==='en'?'Exhibiting since':'Expõe desde'}</dt><dd>2012 · PT · FR · IT</dd></div>
        </dl>
        <div className="about-sel">
          <div className="about-sel-label">{bio.sel}</div>
          <ul>
            {highlights.map((h,i)=>(
              <li key={i}><span className="y">{h.y}</span><span className="t">{h.t}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact({ lang, prefill, clearPrefill }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', message:'' });
  useEffect(() => {
    if (prefill) setForm(f => ({ ...f, message: (lang==='en'
      ? `I'm writing to inquire about "${prefill.title.en}" (${prefill.year}).\n\n`
      : `Venho por este meio pedir informação sobre "${prefill.title.pt}" (${prefill.year}).\n\n`) }));
  }, [prefill, lang]);
  const submit = e => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setForm({name:'',email:'',message:''}); clearPrefill(); }, 3500);
  };
  return (
    <section className="contact wrap" id="contact" data-screen-label="Contact">
      <div>
        <h2>{t(lang,'contact_title')} — <em>{lang==='en'?'let\'s talk':'falemos'}</em>.</h2>
        <p className="sub">{t(lang,'contact_sub')}</p>
        <div className="direct">
          <div><a href="mailto:studio@daliacordeiro.art">studio@daliacordeiro.art</a></div>
          <div style={{marginTop:10}}><a href="https://www.instagram.com/dalia_cordeiro_art/" target="_blank" rel="noreferrer">@dalia_cordeiro_art</a></div>
        </div>
      </div>
      <form onSubmit={submit}>
        {prefill && (
          <div className="form-row">
            <label>{t(lang,'inquiry_for')}</label>
            <div className="inquiry-chip">
              <span className="title">{prefill.title[lang]}</span>
              <span>· {prefill.year} · {prefill.dimensions.cm}</span>
            </div>
          </div>
        )}
        <div className="form-row">
          <label>{t(lang,'name')}</label>
          <input type="text" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        </div>
        <div className="form-row">
          <label>{t(lang,'email')}</label>
          <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        </div>
        <div className="form-row">
          <label>{t(lang,'message')}</label>
          <textarea required rows="4" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}></textarea>
        </div>
        {sent ? <div className="form-sent">{t(lang,'sent')}</div>
              : <button type="submit" className="form-submit">{t(lang,'send')}</button>}
      </form>
    </section>
  );
}

function Footer({ lang }) {
  return (
    <footer className="wrap">
      <div>{t(lang,'footer_studio')}</div>
      <div><a className="ig-link" href="https://www.instagram.com/dalia_cordeiro_art/" target="_blank" rel="noreferrer">@dalia_cordeiro_art</a></div>
      <div>{t(lang,'footer_rights')}</div>
    </footer>
  );
}

function Tweaks({ tweaks, setTweaks, open }) {
  const upd = (k,v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    localStorage.setItem('dc_tweaks', JSON.stringify(next));
    applyTheme(next);
    window.parent.postMessage({ type:'__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };
  return (
    <div className={'tweaks-panel ' + (open?'on':'')}>
      <div className="tweaks-title">Tweaks <small>Live</small></div>
      <div className="tweak-group">
        <label>Theme</label>
        <div className="tweak-row">
          {[['paper','Paper'],['bright','Bright'],['dark','Dark']].map(([k,l]) => (
            <button key={k} className={tweaks.theme===k?'on':''} onClick={()=>upd('theme',k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="tweak-group">
        <label>Accent (from the palette)</label>
        <div className="tweak-row">
          {[['coral','#b84e3a'],['sage','#567a4d'],['lavender','#7d5b94'],['mustard','#c38a3a']].map(([k,c]) => (
            <button key={k} className={'tweak-swatch ' + (tweaks.accent===k?'on':'')} style={{background:c}} onClick={()=>upd('accent',k)} title={k}></button>
          ))}
        </div>
      </div>
      <div className="tweak-group">
        <label>Grid density</label>
        <div className="tweak-row">
          {[['airy','Airy'],['regular','Regular'],['dense','Dense']].map(([k,l]) => (
            <button key={k} className={tweaks.density===k?'on':''} onClick={()=>upd('density',k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="tweak-group" style={{marginBottom:0}}>
        <label>Default language</label>
        <div className="tweak-row">
          {[['en','EN'],['pt','PT']].map(([k,l]) => (
            <button key={k} className={tweaks.defaultLang===k?'on':''} onClick={()=>upd('defaultLang',k)}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tweaks, setTweaks] = useState(readTweaks());
  const [lang, setLang] = useState(() => localStorage.getItem('dc_lang') || tweaks.defaultLang || 'en');
  const [open, setOpen] = useState(null);
  const [prefill, setPrefill] = useState(null);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [active, setActive] = useState('works');

  useEffect(() => { applyTheme(tweaks); }, []);
  useEffect(() => { localStorage.setItem('dc_lang', lang); }, [lang]);

  // Edit-mode protocol
  useEffect(() => {
    const onMsg = e => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type:'__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior:'smooth' });
    setActive(id);
  };

  const inquire = work => {
    setPrefill(work);
    setOpen(null);
    setTimeout(() => scrollTo('contact'), 120);
  };

  return (
    <>
      <Header lang={lang} setLang={setLang} onNav={scrollTo} active={active} />
      <Hero lang={lang} featured={window.ARTWORKS[0]} onExplore={() => scrollTo('works')} />
      <Works lang={lang} onOpen={setOpen} />
      <About lang={lang} />
      <Contact lang={lang} prefill={prefill} clearPrefill={() => setPrefill(null)} />
      <Footer lang={lang} />
      <Modal work={open} lang={lang} onClose={() => setOpen(null)} onInquire={inquire} />
      <Tweaks tweaks={tweaks} setTweaks={setTweaks} open={tweaksOpen} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
