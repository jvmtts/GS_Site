import { useState } from 'react';
import GuideCollection from '../components/library/GuideCollection.jsx';
import LibraryTabs from '../components/library/LibraryTabs.jsx';
import NotesList from '../components/library/NotesList.jsx';
import ReadingList from '../components/library/ReadingList.jsx';
import ReviewList from '../components/library/ReviewList.jsx';
import ApiUserPanel from '../components/library/ApiUserPanel.jsx';
import Icon from '../components/Icon.jsx';
import PageHead from '../components/ui/PageHead.jsx';
import { getGuideById, guides } from '../data/content.js';
import { countNotes } from '../lib/readingNotes.js';
import { listReadingActivity } from '../lib/readingProgress.js';

export default function User({ saved, history, onToggle, profile, results,
  readingProgress = {}, readingNotes = {}, onOpenPreferences, onClearHistory,
  onClearReading, onMarkRead, onClearAll, lessons = [], quizzes = [], account }) {
  const [tab, setTab] = useState('leituras');
  const [notice, setNotice] = useState('');
  const readingItems = listReadingActivity(guides, readingProgress);
  const reviewedLessons = lessons.filter((lesson) => lesson.status === 'published' && results[lesson.id]);
  const savedGuides = saved.map(getGuideById).filter(Boolean);
  const visitedGuides = history.map(getGuideById).filter(Boolean);
  const readCount = readingItems.filter((item) => item.markedRead).length;
  const counts = {
    leituras: readingItems.length,
    salvos: saved.length,
    historico: history.length,
    revisoes: reviewedLessons.length,
    notas: countNotes(readingNotes),
  };

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      profile, saved, history, readingProgress, readingNotes, quizResults: results,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ponto-publico-minhas-leituras.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.requestAnimationFrame(() => URL.revokeObjectURL(url));
    setNotice('O arquivo foi solicitado ao navegador. Os dados não foram enviados a servidores.');
  }

  function clearReading() {
    if (!window.confirm('Apagar apenas o progresso de leitura por seções neste navegador?')) return;
    onClearReading();
    setNotice('Progresso local de leitura apagado. Os itens salvos e o histórico foram preservados.');
  }

  function clearEverything() {
    if (!window.confirm('Apagar preferências, notas, alterações editoriais locais, progresso, salvos, histórico e resultados deste navegador?')) return;
    onClearAll();
    setNotice('Todos os dados locais deste navegador foram apagados.');
  }

  return (
    <div className="shell reading-library">
      <PageHead
        eyebrow="MEU ESPAÇO · BIBLIOTECA PESSOAL"
        title="Minhas leituras."
        description="Retome um guia na última seção visitada. Salvos, histórico e revisões ficam apenas neste navegador, sem cadastro ou sincronização."
      />
      <div className="profile-overview" aria-label="Resumo da atividade neste navegador">
        <div><span>{readingItems.length}</span><strong>guias iniciados</strong></div>
        <div><span>{readCount}</span><strong>marcados como lidos</strong></div>
        <div><span>{saved.length}</span><strong>guias salvos</strong></div>
      </div>
      <div className="user-layout">
        <section className="user-main-panel" aria-label="Suas leituras e atividades">
          <LibraryTabs selected={tab} counts={counts} onSelect={setTab} />
          {tab === 'leituras' && <ReadingList items={readingItems} progress={readingProgress} onMarkRead={onMarkRead} />}
          {tab === 'notas' && <NotesList guides={guides} notes={readingNotes} />}
          {tab === 'revisoes' && <ReviewList lessons={reviewedLessons} quizzes={quizzes} results={results} />}
          {tab === 'salvos' && <GuideCollection type="salvos" guides={savedGuides} onRemove={onToggle} />}
          {tab === 'historico' && <GuideCollection type="historico" guides={visitedGuides} />}
          {tab === 'historico' && history.length > 0 && (
            <button className="small-quiet user-clear" type="button" onClick={() => {
              onClearHistory();
              setNotice('Histórico local limpo.');
            }}>
              Limpar histórico de leitura
            </button>
          )}
        </section>
        <aside className="my-readings-side" aria-label="Personalização e dados locais">
          <span className="eyebrow">PERSONALIZE SUA LEITURA</span>
          <h2>Uma leitura à sua maneira.</h2>
          <p>Ajuste contraste, tamanho do texto, espaçamento e modo foco quando precisar.</p>
          <button className="outline-button side-preferences-button" type="button" onClick={onOpenPreferences}>
            <Icon name="settings" size={18} /> Aparência e acessibilidade
          </button>
          <div className="my-readings-aside-rule" />
          <strong>Privacidade por princípio.</strong>
          <p>Seu histórico, favoritos, notas e seções visitadas ficam neste navegador. Cadastros e inscrições são salvos pela API.</p>
          {account && <ApiUserPanel account={account} lessons={lessons} />}
          <details className="local-data-details">
            <summary>Gerenciar dados locais <Icon name="arrow" size={15} /></summary>
            <div className="profile-data-actions">
              <button className="small-quiet" type="button" onClick={exportData}>Exportar leituras e notas (JSON)</button>
              {readingItems.length > 0 && (
                <button className="small-quiet" type="button" onClick={clearReading}>Limpar só o progresso de leitura</button>
              )}
              <button className="small-quiet user-danger" type="button" onClick={clearEverything}>Apagar todos os dados locais</button>
            </div>
          </details>
          {notice && <p className="profile-notice" role="status">{notice}</p>}
        </aside>
      </div>
    </div>
  );
}
