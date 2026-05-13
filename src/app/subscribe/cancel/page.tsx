import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Checkout cancelado' };

export default function SubscribeCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout cancelado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No se completó el pago. No te cobramos nada. Si fue accidental, puedes intentar de
            nuevo cuando quieras.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link href="/subscribe">Intentar de nuevo</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Volver al dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
