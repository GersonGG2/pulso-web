import type { MetadataRoute } from 'next';

/**
 * Sitemap estático. Cuando tengamos catálogo dinámico (torneos públicos,
 * leaderboards, perfiles) se extiende a leer de la API y emitir entradas
 * por entidad. SEO técnico — robots y crawlers usan este archivo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pulsogg.gg';
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/manifesto', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/tournaments', priority: 0.9, changeFrequency: 'daily' },
    { path: '/leaderboard', priority: 0.8, changeFrequency: 'daily' },
    { path: '/subscribe', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/legal/terminos', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/privacidad', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/cookies', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/sign-in', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/sign-up', priority: 0.5, changeFrequency: 'yearly' },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
