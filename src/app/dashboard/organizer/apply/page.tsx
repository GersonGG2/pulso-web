import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplyOrganizerForm } from '@/components/organizer/apply-form';
import { ClerkNotConfigured } from '@/components/auth/clerk-not-configured';
import { CLERK_ENABLED } from '@/lib/auth';

export const metadata = { title: 'Aplicar como organizador' };

async function alreadyOrganizer(token: string): Promise<boolean> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${apiUrl}/organizers/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return res.ok;
}

export default async function ApplyOrganizerPage() {
  if (!CLERK_ENABLED) return <ClerkNotConfigured destination="Apply organizer" />;
  const { userId, getToken } = await auth();
  if (!userId) redirect('/sign-in');
  const token = await getToken();
  if (!token) redirect('/sign-in');

  const already = await alreadyOrganizer(token);
  if (already) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ya eres organizador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-[var(--color-muted-foreground)]">
            Tu perfil de organizador ya está activo. Ve a tu dashboard para ver tus torneos.
          </p>
          <Button asChild>
            <Link href="/dashboard/organizer">Ir a dashboard →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <header className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Vuélvete organizador</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Publica torneos, gestiona inscripciones y reporta resultados.
        </p>
      </header>
      <ApplyOrganizerForm />
    </>
  );
}
