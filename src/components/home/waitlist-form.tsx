'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/motion';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire to backend waitlist endpoint when available
    setStatus('sent');
    setEmail('');
  }

  return (
    <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      <Reveal className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-card)] to-[var(--color-background)] p-8 sm:p-12">
        <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Sé de los primeros en jugar.
        </h2>
        <p className="mt-3 text-[var(--color-muted-foreground)]">
          Lanzamiento en septiembre 2026 · Cupo limitado para los primeros 500 jugadores con
          beneficios early-access.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Input
            type="email"
            required
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'sent'}
            className="sm:flex-1"
          />
          <Button type="submit" size="lg" disabled={status === 'sent'}>
            {status === 'sent' ? 'En la lista' : 'Avísame'}
          </Button>
        </form>

        <AnimatePresence>
          {status === 'sent' && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-sm text-[var(--color-primary)]"
            >
              Listo. Te avisamos cuando abramos cupos.
            </motion.p>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
