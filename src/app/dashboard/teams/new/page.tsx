import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTeamForm } from '@/components/team/create-team-form';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Nuevo equipo' };

async function hasPlayer(token: string): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/players/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.ok;
}

export default async function NewTeamPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="New team" />;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  if (!token) redirect('/sign-in');

  if (!(await hasPlayer(token))) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Necesitas un perfil de jugador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-[var(--color-muted-foreground)]">
            Para crear un equipo primero debes completar tu perfil de jugador.
          </p>
          <Button asChild>
            <Link href="/onboarding/player">Crear perfil →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <header className="mb-6">
        <Link
          href="/dashboard/teams"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          ← Equipos
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nuevo equipo</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Al crear te conviertes en captain automáticamente.
        </p>
      </header>
      <CreateTeamForm />
    </>
  );
}
