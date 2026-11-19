import Link from './Link.jsx';
import Icon from '../Icon.jsx';

export default function ButtonLink({ to, children, outline = false }) {
  return (
    <Link to={to} className={`pp-button ${outline ? 'outline' : ''}`}>
      {children}
      <Icon name="arrow" size={17} />
    </Link>
  );
}
