
export function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/home';
  const cleaned = pathname.replace(/\/+$/, '');
  return cleaned || '/home';
}

export function splitDestination(destination) {
  const [pathname, fragment = ''] = destination.split('#');
  return { pathname: normalizePath(pathname), fragment };
}
