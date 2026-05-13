import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pulsogg.gg';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/onboarding/',
          '/sign-in',
          '/sign-up',
          '/subscribe/success',
          '/subscribe/cancel',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
