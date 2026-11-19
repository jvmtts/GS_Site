import Icon from '../Icon.jsx';

export default function SaveButton({ saved, onToggle, label = 'Salvar guia' }) {
  return (
    <button
      className={`outline-button ${saved ? 'selected' : ''}`}
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
    >
      <Icon name="bookmark" size={18} />
      {saved ? 'Salvo' : label}
    </button>
  );
}
