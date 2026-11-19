import Brand from '../Brand.jsx';
import Link from '../ui/Link.jsx';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <Brand small />
        <span>Informação pública que faz sentido. Portal editorial independente, com fontes identificadas.</span>
        <nav aria-label="Navegação de rodapé">
          <Link to="/assuntos">Assuntos</Link>
          <Link to="/licoes">Lições</Link>
          <Link to="/guia/orcamento-publico#fontes">Fontes</Link>
        </nav>
      </div>
    </footer>
  );
}
