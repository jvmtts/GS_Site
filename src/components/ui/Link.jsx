import { useNavigation } from '../../app/NavigationContext.jsx';

export default function Link({ to, children, onClick, ...props }) {
  const navigate = useNavigation();

  function handleClick(event) {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!to?.startsWith('/')) return;

    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
