
const remote = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Imagens_de_Bras%C3%ADlia_-_Pal%C3%A1cio_do_Congresso_Nacional_%2851323850612%29.jpg';
const source = 'https://commons.wikimedia.org/wiki/File:Imagens_de_Bras%C3%ADlia_-_Pal%C3%A1cio_do_Congresso_Nacional_(51323850612).jpg';
const fallback = '/assets/congresso-tratado.webp';

export default function DocumentaryPhoto({ eager = false, credit = true }) {
  return (
    <>
      <img
        src={remote}
        alt="Fotografia do Congresso Nacional em Brasília, com suas duas torres e cúpulas."
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        onError={(event) => {
          if (!event.currentTarget.src.endsWith(fallback)) event.currentTarget.src = fallback;
        }}
      />
      {credit && (
        <a href={source} target="_blank" rel="noopener noreferrer" className="photo-credit">
          Leonardo Sá / Agência Senado · CC BY 2.0 · edição Ponto Público
        </a>
      )}
    </>
  );
}
