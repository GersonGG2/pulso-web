'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--color-primary)] blur-[180px]"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8">
        <FadeIn delay={0}>
          <Badge variant="outline" className="mb-6 border-[var(--color-primary)]/40">
            Próximo lanzamiento · México
          </Badge>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            Talento sobre <span className="text-[var(--color-primary)]">contactos</span>.
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-6 max-w-2xl text-balance text-lg text-[var(--color-muted-foreground)] sm:text-xl">
            El pipeline meritocrático de esports para Latinoamérica. Juega, sube tu{' '}
            <span className="font-mono text-[var(--color-foreground)]">ZScore</span>, y conviértete
            en visible para equipos y scouts — sin necesidad de conocer a nadie.
          </p>
        </FadeIn>

        <FadeIn delay={0.3} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/sign-up">
              Crear cuenta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/tournaments">Ver torneos abiertos</Link>
          </Button>
        </FadeIn>

        <FadeIn delay={0.4}>
          <p className="mt-6 text-xs text-[var(--color-muted-foreground)]">
            Por ahora solo League of Legends · LAN/LAS · expansión LATAM en Q3 2026
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
