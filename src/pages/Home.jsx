import Icon from '../components/Icon.jsx';
import DocumentaryPhoto from '../components/DocumentaryPhoto.jsx';
import Link from '../components/ui/Link.jsx';
import ButtonLink from '../components/ui/ButtonLink.jsx';
import SaveButton from '../components/ui/SaveButton.jsx';
import { guides } from '../data/content.js';

const quickLinks = [
  { to: '/assuntos', icon: 'book', title: 'Entenda', text: 'Explore explicações independentes.' },
  { to: '/guia/orcamento-publico#fontes', icon: 'layers', title: 'Confira a fonte', text: 'Vá direto aos documentos oficiais.' },
  { to: '/licoes', icon: 'cap', title: 'Pratique', text: 'Revise com lições opcionais.' },
];

function Hero({ saved, onToggle }) {
  return (
    <>
      <div className="home-micro shell">
        <span>INFORMAÇÃO PÚBLICA / GUIAS / REPERTÓRIO CÍVICO</span>
        <span>Independente, acessível e fundamentado em fontes públicas.</span>
      </div>
      <section className="shell hero" aria-labelledby="home-headline">
        <div className="hero-copy">
          <span className="eyebrow">GUIA BASEADO EM INFORMAÇÕES OFICIAIS</span>
          <h1 id="home-headline">Orçamento público: como funciona e como acompanhar</h1>
          <p>Entenda como o dinheiro público é planejado, autorizado e gasto — e onde conferir os documentos.</p>
          <div className="hero-ctas">
            <ButtonLink to="/guia/orcamento-publico">Ler guia completo</ButtonLink>
            <SaveButton saved={saved} onToggle={onToggle} />
          </div>
          <div className="hero-note"><Icon name="info" size={15} /> Explicação independente, com fontes oficiais identificadas.</div>
        </div>
        <div className="hero-visual">
          <DocumentaryPhoto eager />
          <div className="dot-field" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}

export default function Home({ saved, onToggle }) {
  return (
    <>
      <Hero saved={saved.includes('orcamento')} onToggle={() => onToggle('orcamento')} />
      <div className="shell">
        <nav className="quick-links" aria-label="Como usar o Ponto Público">
          {quickLinks.map(({ to, icon, title, text }) => (
            <Link to={to} key={to} className="quick-link">
              <Icon name={icon} size={25} />
              <div><strong>{title}</strong><span>{text}</span></div>
              <Icon name="arrow" className="quick-arrow" size={15} />
            </Link>
          ))}
        </nav>
        <div className="home-lower">
          <section aria-labelledby="home-start-title">
            <div className="section-label">
              <div><span className="eyebrow">PORTAL DE CONHECIMENTO</span><h2 id="home-start-title">Para entender melhor.</h2></div>
              <Link to="/assuntos" className="tiny-link">Todos os assuntos <Icon name="arrow" size={14} /></Link>
            </div>
            {guides.filter((guide) => ['orcamento', 'constituicao', 'poderes', 'executivo', 'transparencia'].includes(guide.id)).map((guide) => (
              <Link className="guide-list-row" to={guide.path} key={guide.id}>
                <span className="order">{guide.number} /</span>
                <strong>{guide.title}</strong>
                <span>{guide.description}</span>
                <Icon name="arrow" size={16} />
              </Link>
            ))}
          </section>
          <aside className="callout">
            <Icon name="cap" size={28} />
            <div>
              <span className="eyebrow">LIÇÕES COMPLEMENTARES</span>
              <h3>Aprenda e relembre no seu ritmo.</h3>
              <p>Estude conceitos e teste sua memória com explicações para cada resposta, sem rankings ou etapas obrigatórias.</p>
            </div>
            <ButtonLink to="/licoes">Explorar lições</ButtonLink>
          </aside>
        </div>
      </div>
    </>
  );
}
