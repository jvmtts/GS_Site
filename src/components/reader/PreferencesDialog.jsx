import { useEffect, useRef } from 'react';
import Icon from '../Icon.jsx';

const THEMES = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];
function PreferenceChoices({ label, value, options, onChange }) {
  return (
    <fieldset className="preferences-field">
      <legend>{label}</legend>
      <div className="preferences-options">
        {options.map((option) => (
          <label key={option.value} className={value === option.value ? 'is-selected' : ''}>
            <input type="radio" name={label} value={option.value}
              checked={value === option.value} onChange={() => onChange(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function PreferencesDialog({ open, onClose, preferences, changePreferences }) {
  const dialog = useRef(null);
  const lastFocused = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return undefined;
    if (open && !node.open) {
      lastFocused.current = document.activeElement;
      node.showModal();
    } else if (!open && node.open) {
      node.close();
      lastFocused.current?.focus?.();
    }
    return undefined;
  }, [open]);
  return (
    <dialog className="preferences-dialog" ref={dialog} onClose={onClose}
      onClick={(event) => { if (event.target === dialog.current) onClose(); }}
      aria-labelledby="preferences-title">
      <div className="preferences-content">
        <div className="preferences-heading">
          <div><span className="eyebrow">PREFERÊNCIAS DO LEITOR</span>
            <h2 id="preferences-title">Aparência e leitura.</h2></div>
          <button className="icon-close" onClick={onClose} type="button" aria-label="Fechar preferências"><Icon name="close" /></button>
        </div>
        <p>Adapte a interface ao seu conforto. Tudo fica somente neste navegador.</p>
        <PreferenceChoices label="Tema de cores" value={preferences.theme} options={THEMES}
          onChange={(theme) => changePreferences({ theme })} />
        <PreferenceChoices label="Tamanho do texto" value={preferences.fontSize}
          options={[{ value: 'normal', label: 'Padrão' }, { value: 'large', label: 'Maior' }]}
          onChange={(fontSize) => changePreferences({ fontSize })} />
        <PreferenceChoices label="Espaçamento da leitura" value={preferences.spacing}
          options={[{ value: 'standard', label: 'Padrão' }, { value: 'comfortable', label: 'Amplo' }]}
          onChange={(spacing) => changePreferences({ spacing })} />
        <label className="preferences-toggle">
          <input type="checkbox" checked={preferences.focus}
            onChange={(event) => changePreferences({ focus: event.target.checked })} />
          <span><strong>Leitura focada</strong><small>Oculta apenas os elementos laterais nos guias; nunca o texto ou as fontes.</small></span>
        </label>
        <p className="preferences-help">Animações seguem a configuração de movimento reduzido do dispositivo. O site funciona com teclado e não exige conta.</p>
        <button className="pp-button preferences-finish" type="button" onClick={onClose}>Concluir ajustes <Icon name="check" size={16}/></button>
      </div>
    </dialog>
  );
}
