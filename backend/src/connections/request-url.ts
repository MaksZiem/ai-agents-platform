export class RequestUrlError extends Error {}

export function buildRequestUrl(baseUrl: string, path: string): URL {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new RequestUrlError('path must start with a single "/"');
  }

  if (
    [...path].some(
      (char) => char === '\\' || /\s/.test(char) || char.charCodeAt(0) < 0x20,
    )
  ) {
    throw new RequestUrlError('path contains forbidden characters');
  }

  const pathname = path.split(/[?#]/)[0];
  let segments: string[];

  try {
    segments = pathname
      .split('/')
      .map((segment) => decodeURIComponent(segment));
  } catch {
    throw new RequestUrlError('path contains invalid percent-encoding');
  }

  if (segments.some((segment) => segment === '..' || segment === '.')) {
    throw new RequestUrlError('path must not contain "." or ".." segments');
  }

  const base = new URL(baseUrl);
  const basePath = base.pathname.replace(/\/+$/, '');
  const target = new URL(`${base.origin}${basePath}${path}`);

  if (
    target.origin !== base.origin ||
    (basePath !== '' &&
      target.pathname !== basePath &&
      !target.pathname.startsWith(`${basePath}/`))
  ) {
    throw new RequestUrlError('path must stay inside the connection base URL');
  }

  target.hash = '';

  return target;
}
