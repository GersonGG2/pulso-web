import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Friendly fallback shown when Clerk is not yet configured.
 * Used by /sign-in, /sign-up, /dashboard while NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
 * is not set. Replaces what would otherwise be a runtime crash.
 */
export function ClerkNotConfigured({ destination }: { destination: string }) {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-xl items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Auth aún no está configurada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[var(--color-muted-foreground)]">
          <p>
            <span className="text-[var(--color-foreground)]">{destination}</span> requiere Clerk.
            Para activar autenticación:
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Crea cuenta gratuita en{' '}
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--color-primary)] underline"
              >
                dashboard.clerk.com
              </a>
            </li>
            <li>Crea una application llamada Pulso</li>
            <li>
              Copia <span className="font-mono text-xs">Publishable key</span> y{' '}
              <span className="font-mono text-xs">Secret key</span>
            </li>
            <li>
              Pégalas en <span className="font-mono text-xs">.env.local</span> en{' '}
              <span className="font-mono text-xs">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span> y{' '}
              <span className="font-mono text-xs">CLERK_SECRET_KEY</span>
            </li>
            <li>Reinicia <span className="font-mono text-xs">pnpm dev</span></li>
          </ol>
          <div className="pt-2">
            <Button variant="outline" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
