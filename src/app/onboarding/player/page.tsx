import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { PlayerProfileForm } from '@/components/onboarding/player-profile-form';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = {
  title: 'Crea tu perfil de jugador',
};

interface State {
  hasRiot: boolean;
  hasPlayer: boolean;
}

async function loadState(token: string): Promise<State> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const headers = { Authorization: `Bearer ${token}` };

  const [riotRes, playerRes] = await Promise.all([
    fetch(`${apiUrl}/riot-account/me`, { headers, cache: 'no-store' }),
    fetch(`${apiUrl}/players/me`, { headers, cache: 'no-store' }),
  ]);

  return {
    hasRiot: riotRes.ok,
    hasPlayer: playerRes.ok,
  };
}

export default async function OnboardingPlayerPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Onboarding" />;

  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  const state = token ? await loadState(token) : { hasRiot: false, hasPlayer: false };

  return (
    <>
      <header className="mb-6">
        <p className="text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Paso 2 de 2
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Crea tu perfil de jugador
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Define rol primario, país y disponibilidad. Esto te coloca en el talent graph público.
        </p>
      </header>

      {!state.hasRiot ? (
        <Card>
          <CardHeader>
            <CardTitle>Vincula tu cuenta de Riot primero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-[var(--color-muted-foreground)]">
              Necesitas tener una cuenta de Riot vinculada antes de crear tu perfil de jugador.
              Esto evita perfiles duplicados y nos permite leer tus stats reales.
            </p>
            <Button asChild>
              <Link href="/onboarding/riot">Vincular Riot →</Link>
            </Button>
          </CardContent>
        </Card>
      ) : state.hasPlayer ? (
        <Card>
          <CardHeader>
            <CardTitle>Perfil ya creado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-[var(--color-muted-foreground)]">
              Ya tienes un perfil de jugador. Puedes editarlo desde tu dashboard.
            </p>
            <Button asChild>
              <Link href="/dashboard">Ir al dashboard →</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PlayerProfileForm />
      )}
    </>
  );
}
