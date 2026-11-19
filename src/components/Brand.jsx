
export default function Brand({ small = false }) {
  return (
    <span className={`brand ${small ? 'brand--small' : ''}`}>
      <img className="brand-lockup brand-lockup--light"
        src="/assets/logo/logo-original.svg" width="138" height="51" alt="Ponto Público" />
      <img className="brand-lockup brand-lockup--dark"
        src="/assets/logo/logo-escuro-ponto-azul.svg" width="138" height="51" alt="Ponto Público" />
    </span>
  );
}
