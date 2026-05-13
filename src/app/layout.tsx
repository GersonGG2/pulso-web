import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { inter, jetbrainsMono, russoOne } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Pulso · El pulso del esports en LATAM',
    template: '%s · Pulso',
  },
  description:
    'Plataforma meritocrática de torneos de League of Legends en México y Latinoamérica. Juega, sube tu ZScore, y vuélvete visible para scouts.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'),
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
