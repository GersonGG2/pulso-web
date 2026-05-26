import { auth, currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { ProfileEditor, type ProfileData } from '@/components/profile/profile-editor';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Mi perfil' };

async function loadProfile(token: string): Promise<ProfileData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const headers = { Authorization: `Bearer ${token}` };

  const [playerRes, riotRes] = await Promise.all([
    fetch(`${apiUrl}/players/me`, { headers, cache: 'no-store' }),
    fetch(`${apiUrl}/riot-account/me`, { headers, cache: 'no-store' }),
  ]);

  if (!playerRes.ok) return null;
  const player = (await playerRes.json()) as ProfileData['player'];
  const riot = riotRes.ok ? ((await riotRes.json()) as ProfileData['riot']) : null;
  return { player, riot };
}

export default async function ProfilePage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Mi perfil" />;

  const [user, { getToken }] = await Promise.all([currentUser(), auth()]);
  if (!user) return null;
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const data = await loadProfile(token);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aún no tienes perfil de jugador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Crea tu perfil para empezar a competir y aparecer en el talent graph.
          </p>
          <Button asChild>
            <Link href="/onboarding/player">Crear perfil</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Mi perfil</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Actualiza tu información personal, de juego y redes sociales.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/players/${user.username ?? ''}`}>
            Ver mi perfil público
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </header>

      <ProfileEditor data={data} />
    </>
  );
}
