import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--color-primary)] blur-[180px]" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <Badge variant="outline" className="mb-6 border-[var(--color-primary)]/40">
          Próximo lanzamiento · México
        </Badge>

        <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Talento sobre <span className="text-[var(--color-primary)]">contactos</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg text-[var(--color-muted-foreground)] sm:text-xl">
          El pipeline meritocrático de esports para Latinoamérica. Juega, sube tu{' '}
          <span className="font-mono text-[var(--color-foreground)]">ZScore</span>, y conviértete
          en visible para equipos y scouts — sin necesidad de conocer a nadie.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/sign-up">
              Crear cuenta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/tournaments">Ver torneos abiertos</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-[var(--color-muted-foreground)]">
          Por ahora solo League of Legends · LAN/LAS · expansión LATAM en Q3 2026
        </p>
      </div>
    </section>
  );
}
