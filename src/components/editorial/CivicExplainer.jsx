
const diagrams = {
  constituicao: {
    eyebrow: 'UM MAPA DE LEITURA',
    title: 'Onde procurar na Constituição?',
    note: 'Localize o assunto, abra a versão atualizada e confira os artigos e parágrafos; estes intervalos são pontos de partida, não resumos exaustivos.',
    parts: [
      { id: '01', title: 'Princípios fundamentais', ref: 'Artigos 1º a 4º', text: 'Fundamentos da República e objetivos que orientam a organização do Estado.' },
      { id: '02', title: 'Direitos e garantias', ref: 'Artigos 5º a 17', text: 'Direitos individuais, coletivos, sociais e políticos e temas relacionados.' },
      { id: '03', title: 'Organização do Estado', ref: 'Artigos 18 a 43', text: 'União, estados, Distrito Federal, municípios e repartição de competências.' },
      { id: '04', title: 'Organização dos Poderes', ref: 'Artigos 44 a 135', text: 'Legislativo, Executivo, Judiciário e funções essenciais à Justiça.' },
    ],
  },
  poderes: {
    eyebrow: 'DIVISÃO DE FUNÇÕES',
    title: 'Três Poderes, funções diferentes',
    note: 'As funções abaixo são típicas, não competências exclusivas absolutas. A Constituição prevê relações e controles entre os Poderes.',
    parts: [
      { id: 'L', title: 'Legislativo', ref: 'Art. 44 em diante', text: 'Elabora leis e fiscaliza dentro das atribuições constitucionais. No plano federal: Câmara e Senado.' },
      { id: 'E', title: 'Executivo', ref: 'Art. 76 em diante', text: 'Conduz a administração e implementa políticas. Na União: Presidência e ministros.' },
      { id: 'J', title: 'Judiciário', ref: 'Art. 92 em diante', text: 'Aprecia causas e aplica o Direito, com órgãos e competências definidos na Constituição.' },
    ],
  },
  executivo: {
    eyebrow: 'NÍVEIS DE GOVERNO',
    title: 'Quem chefia a administração?',
    note: 'O chefe do Executivo não substitui todo o órgão administrativo: ministérios, secretarias e entidades executam atribuições específicas.',
    parts: [
      { id: 'U', title: 'União', ref: 'Presidente da República', text: 'Exerce o Executivo federal com auxílio dos ministros, nos limites das competências da União.' },
      { id: 'E', title: 'Estados e DF', ref: 'Governadores', text: 'Conduzem a administração estadual e distrital, com suas próprias competências e orçamentos.' },
      { id: 'M', title: 'Municípios', ref: 'Prefeitos', text: 'Dirigem o Executivo municipal e a prestação dos serviços de responsabilidade local.' },
    ],
  },
};

export default function CivicExplainer({ kind }) {
  const diagram = diagrams[kind];
  if (!diagram) return null;
  return (
    <section className="civic-map" aria-labelledby={`civic-map-${kind}`}>
      <span className="eyebrow">{diagram.eyebrow}</span>
      <h2 id={`civic-map-${kind}`}>{diagram.title}</h2>
      <div className="civic-map-cards">
        {diagram.parts.map((part) => (
          <article className="civic-map-card" key={part.id}>
            <span className="civic-map-glyph" aria-hidden="true">{part.id}</span>
            <h3>{part.title}</h3>
            <strong>{part.ref}</strong>
            <p>{part.text}</p>
          </article>
        ))}
      </div>
      <p className="civic-map-note">{diagram.note}</p>
    </section>
  );
}
