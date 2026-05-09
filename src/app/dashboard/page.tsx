import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  if (!CLERK_ENABLED) {
    return <ClerkNotConfigured destination="Dashboard" />;
  }

  const user = await currentUser();
  if (!user) return null; // middleware protects, but TS-safety

  const displayName = user.firstName ?? user.username ?? 'Jugador';

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hola, {displayName}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Tu base operativa en Pulso.
          </p>
        </div>
        <Badge variant="outline">Cuenta verificada</Badge>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vincula tu cuenta de Riot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Linkea tu cuenta para que tu perfil empiece a generar ZScore en partidas
              oficiales.
            </p>
            <Button asChild className="w-full">
              <Link href="/onboarding/riot">Vincular Riot</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crea tu perfil de jugador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Define rol primario, país y disponibilidad para reclutamiento.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/onboarding/player">Configurar perfil</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explora torneos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Encuentra el siguiente torneo para inscribirte.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/tournaments">Ver torneos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
