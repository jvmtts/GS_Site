import ButtonLink from '../components/ui/ButtonLink.jsx';
import PageHead from '../components/ui/PageHead.jsx';

export default function NotFound() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="NÃO ENCONTRADO"
        title="Página não encontrada."
        description="Verifique o endereço ou volte para a página inicial."
      />
      <ButtonLink to="/home">Ir para o Portal</ButtonLink>
    </div>
  );
}
