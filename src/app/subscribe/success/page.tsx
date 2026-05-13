import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: '¡Bienvenido a Pulso Pro!' };

export default function SubscribeSuccessPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <Check className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido a Pulso Pro!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm text-[var(--color-muted-foreground)]">
            Tu suscripción está activa. El badge Pro aparecerá en tu perfil en cuanto Stripe
            confirme el pago (suele ser instantáneo).
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link href="/dashboard">Ir al dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/subscribe">Ver mi suscripción</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
