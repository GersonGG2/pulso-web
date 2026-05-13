import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { inter, jetbrainsMono, russoOne } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Pulso · El pulso del esports en LATAM',
    template: '%s · Pulso',
  },
  description:
    'Plataforma meritocrática de torneos de League of Legends en México y Latinoamérica. Juega, sube tu ZScore, y vuélvete visible para scouts.',
  applicationName: 'Pulso',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'esports',
    'League of Legends',
    'LoL',
    'México',
    'LATAM',
    'torneos',
    'meritocracia',
    'ZScore',
    'pipeline esports',
    'reclutamiento gaming',
    'LRN',
    'LTA',
    'amateur LoL',
  ],
  authors: [{ name: 'Pulso', url: APP_URL }],
  creator: 'Pulso',
  publisher: 'Pulso',
  category: 'esports',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'es-MX': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: APP_URL,
    title: 'Pulso · El pulso del esports en LATAM',
    description:
      'Talento sobre contactos. Juega, sube tu ZScore, y vuélvete visible para scouts y equipos.',
    siteName: 'Pulso',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulso · El pulso del esports en LATAM',
    description: 'Talento sobre contactos. El pipeline meritocrático de esports para LATAM.',
    creator: '@pulsogg',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-MX"
      suppressHydrationWarning
      className={cn(inter.variable, jetbrainsMono.variable, russoOne.variable)}
    >
      <body className="flex min-h-dvh flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
