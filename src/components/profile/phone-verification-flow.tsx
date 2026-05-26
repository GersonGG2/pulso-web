'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Edit3, Loader2, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, useApiClient } from '@/lib/api-client';

type Step = 'idle' | 'enterPhone' | 'enterCode';

interface SendResponse {
  status: 'pending' | 'approved' | 'canceled';
  devCode?: string;
}

interface VerifyResponse {
  verified: true;
}

interface PhoneVerificationFlowProps {
  currentNumber: string | null;
  verified: boolean;
  onVerified: (newNumber: string) => void;
}

export function PhoneVerificationFlow({
  currentNumber,
  verified,
  onVerified,
}: PhoneVerificationFlowProps) {
  const router = useRouter();
  const api = useApiClient();
  const [step, setStep] = useState<Step>('idle');
  const [pendingNumber, setPendingNumber] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    if (!pendingNumber.trim()) return;
    setBusy(true);
    setError(null);
    setDevCode(null);
    try {
      const res = await api.post<SendResponse>('/riot-account/sms/send', {
        phoneNumber: pendingNumber.trim(),
      });
      if (res.devCode) setDevCode(res.devCode);
      setStep('enterCode');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.post<VerifyResponse>('/riot-account/sms/verify', {
        phoneNumber: pendingNumber.trim(),
        code: code.trim(),
      });
      onVerified(pendingNumber.trim());
      setStep('idle');
      setPendingNumber('');
      setCode('');
      setDevCode(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    setStep('idle');
    setPendingNumber('');
    setCode('');
    setDevCode(null);
    setError(null);
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="space-y-3"
          >
            {currentNumber ? (
              <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)]/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm">{currentNumber}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                      {verified
                        ? 'Verificado por SMS — anti-smurf activo.'
                        : 'Sin verificar — debes verificar el código para activarlo.'}
                    </p>
                  </div>
                  {verified && (
                    <Badge className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Aún no has verificado un teléfono. La verificación SMS asegura que una
                persona = una identidad en Pulso (anti-smurf).
              </p>
            )}

            <Button variant="outline" onClick={() => setStep('enterPhone')}>
              <Edit3 className="h-4 w-4" />
              {currentNumber ? 'Cambiar número' : 'Verificar teléfono'}
            </Button>
          </motion.div>
        )}

        {step === 'enterPhone' && (
          <motion.form
            key="enterPhone"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onSubmit={sendCode}
            className="space-y-3"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Nuevo número</span>
              <Input
                type="tel"
                value={pendingNumber}
                onChange={(e) => setPendingNumber(e.target.value)}
                placeholder="+52 55 1234 5678"
                required
                disabled={busy}
                autoFocus
              />
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                Incluye el código de país. Te enviaremos un código de 6 dígitos por SMS.
              </p>
            </label>

            {error && <ErrorBox message={error} />}

            <div className="flex gap-2">
              <Button type="submit" disabled={busy || !pendingNumber.trim()}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Enviar código
              </Button>
              <Button type="button" variant="outline" onClick={cancel} disabled={busy}>
                Cancelar
              </Button>
            </div>
          </motion.form>
        )}

        {step === 'enterCode' && (
          <motion.form
            key="enterCode"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onSubmit={verifyCode}
            className="space-y-3"
          >
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)]/40 p-3 text-sm">
              <p>
                Enviamos un código a{' '}
                <span className="font-mono">{pendingNumber}</span>
              </p>
              {devCode && (
                <p className="mt-1 text-xs text-[var(--color-primary)]">
                  Modo dev: tu código es{' '}
                  <span className="font-mono font-bold">{devCode}</span>
                </p>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Código de 6 dígitos</span>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={busy}
                autoFocus
                className="font-mono text-center text-lg tracking-widest"
              />
            </label>

            {error && <ErrorBox message={error} />}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy || code.length !== 6}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                <Check className="h-4 w-4" />
                Verificar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('enterPhone')}
                disabled={busy}
              >
                Cambiar número
              </Button>
              <Button type="button" variant="outline" onClick={cancel} disabled={busy}>
                Cancelar
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 p-3 text-sm text-[var(--color-destructive)]">
      {message}
    </div>
  );
}
