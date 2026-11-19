import { useState } from 'react';

const steps = [
  {
    name: 'PPA',
    title: 'Plano Plurianual',
    description: 'Estabelece diretrizes e objetivos de médio prazo para a ação pública.',
  },
  {
    name: 'LDO',
    title: 'Diretrizes Orçamentárias',
    description: 'Orienta a elaboração da lei orçamentária para o exercício seguinte.',
  },
  {
    name: 'LOA',
    title: 'Lei Orçamentária Anual',
    description: 'Estima receitas e fixa despesas para o período anual.',
  },
];

export default function Diagram() {
  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <section className="diagram">
      <span className="eyebrow">ILUSTRAÇÃO DIDÁTICA</span>
      <h3>Três peças de planejamento.</h3>
      <div className="diagram-steps" role="group" aria-label="Instrumentos orçamentários">
        {steps.map((step, index) => (
          <button
            key={step.name}
            type="button"
            aria-pressed={index === active}
            onClick={() => setActive(index)}
          >
            <span>{step.name}</span>
            <strong>{step.title}</strong>
          </button>
        ))}
      </div>
      <p className="diagram-detail" aria-live="polite">
        <strong>
          {current.name} · {current.title}
        </strong>
        {current.description}
      </p>
      <p className="diagram-note">Representação conceitual, não reprodução de documento oficial.</p>
    </section>
  );
}
