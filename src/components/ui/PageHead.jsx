export default function PageHead({ eyebrow, title, description }) {
  return (
    <div className="page-head max-w-5xl">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
