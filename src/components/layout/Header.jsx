import { useEffect, useRef, useState } from 'react';
import Brand from '../Brand.jsx';
import Icon from '../Icon.jsx';
import Link from '../ui/Link.jsx';
import { guides } from '../../data/content.js';
import { useEditorialContent } from '../../app/EditorialContext.jsx';

const primaryNavigation = [
  { to: '/home', label: 'Portal' },
  { to: '/assuntos', label: 'Assuntos' },
  { to: '/licoes', label: 'Lições' },
];

export default function Header({ path, saved, onOpenPreferences }) {
  const { catalog } = useEditorialContent();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [path]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
    if (!searchOpen && !menuOpen) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        const focusTarget = searchOpen ? 'search-toggle' : 'mobile-menu-toggle';
        setMenuOpen(false);
        setSearchOpen(false);
        document.getElementById(focusTarget)?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [searchOpen, menuOpen]);

  const normalizeSearch = (text) => text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const needle = normalizeSearch(query.trim());
  const results = needle ? guides.filter((guide) =>
    normalizeSearch(`${guide.title} ${guide.description} ${guide.category} ${guide.deck}`)
      .includes(needle),
  ) : guides.filter((guide) => ['constituicao', 'poderes', 'executivo', 'orcamento'].includes(guide.id));
  if (needle) {
    for (const lesson of catalog.lessons) {
      const tags = catalog.tags.filter((tag) => lesson.tagIds.includes(tag.id)).map((tag) => tag.name).join(' ');
      if (normalizeSearch(`${lesson.title} ${lesson.description} ${tags}`).includes(needle)) {
        results.push({ ...lesson, path: `/licoes/${lesson.slug}`, category: 'Lição' });
      }
    }
  }
  const isCurrent = (to) => path === to ||
    (to === '/assuntos' && path.startsWith('/guia/')) ||
    (to === '/licoes' && path.startsWith('/licoes/'));

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link to="/home" className="home-logo" aria-label="Ponto Público — Portal" onClick={() => { setSearchOpen(false); setMenuOpen(false); }}>
          <Brand />
        </Link>
        <nav aria-label="Navegação principal" className="nav-desktop">
          {primaryNavigation.map(({ to, label }) => (
            <Link key={to} to={to} aria-current={isCurrent(to) ? 'page' : undefined} className={isCurrent(to) ? 'on' : ''}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button type="button" className="tool appearance-tool" aria-label="Aparência e acessibilidade"
            onClick={onOpenPreferences}><Icon name="settings" size={19}/><span className="desktop-label">Aparência</span></button>
          <button
            id="search-toggle" type="button" className="tool" aria-controls="site-search-panel"
            aria-label={searchOpen ? 'Fechar busca' : 'Buscar guias'} aria-expanded={searchOpen}
            onClick={() => { setSearchOpen((current) => !current); setMenuOpen(false); }}
          >
            <Icon name="search" /><span className="desktop-label">Buscar</span>
          </button>
          <Link className="tool saved-tool" to="/user" aria-label={`Meu espaço, ${saved.length} itens salvos`}>
            <Icon name="bookmark" /><span className="desktop-label">Salvos</span>
          </Link>
          <Link className="profile-icon" to="/user" aria-label="Minhas leituras"><Icon name="user" size={19} /></Link>
          <button
            id="mobile-menu-toggle" type="button" className="tool mobile-menu" aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}
            onClick={() => { setMenuOpen((current) => !current); setSearchOpen(false); }}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      {searchOpen && (
        <div className="search-panel shell" id="site-search-panel" role="search">
          <label htmlFor="site-search">Buscar explicações</label>
          <input
            ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)}
            id="site-search" type="search" placeholder="Ex.: Constituição, Executivo ou direitos"
            autoComplete="off"
          />
          <div className="search-items" aria-live="polite">
            {results.map((guide) => <Link key={guide.path} to={guide.path} onClick={() => setSearchOpen(false)}>
              <span><strong>{guide.title}</strong><small>{guide.category}</small></span><Icon name="arrow" size={15} />
            </Link>)}
            {results.length === 0 && <p>Nenhum guia encontrado. Tente outro assunto ou explore a página de assuntos.</p>}
          </div>
          <Link to="/assuntos" className="search-all" onClick={() => setSearchOpen(false)}>Explorar todos os assuntos <Icon name="arrow" size={14} /></Link>
        </div>
      )}
      {menuOpen && (
        <nav className="mobile-panel" id="mobile-navigation" aria-label="Menu mobile">
          {[...primaryNavigation, { to: '/user', label: 'Meu espaço' }].map(({ to, label }) => (
            <Link to={to} onClick={() => setMenuOpen(false)} key={to}>{label}<Icon name="arrow" size={16} /></Link>
          ))}
        </nav>
      )}
    </header>
  );
}
