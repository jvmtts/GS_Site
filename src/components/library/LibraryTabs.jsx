const tabs = [
  ['leituras', 'Leituras'],
  ['salvos', 'Salvos'],
  ['historico', 'Histórico'],
  ['revisoes', 'Revisões'],
  ['notas', 'Notas'],
];

export default function LibraryTabs({ selected, counts, onSelect }) {
  return (
    <div className="tabs" role="group" aria-label="Conteúdo de Minhas leituras">
      {tabs.map(([id, label]) => (
        <button
          type="button"
          key={id}
          className={selected === id ? 'active' : ''}
          aria-pressed={selected === id}
          onClick={() => onSelect(id)}
        >
          {label} ({counts[id]})
        </button>
      ))}
    </div>
  );
}
