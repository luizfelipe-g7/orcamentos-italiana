const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function resolvePhotoUrl(photoUrl?: string | null): string {
  if (!photoUrl) return '';
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;

  const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
  if (photoUrl.startsWith('/')) {
    return `${backendOrigin}${photoUrl}`;
  }

  return photoUrl;
}

