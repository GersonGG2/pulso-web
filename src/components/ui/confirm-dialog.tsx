'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';

type ConfirmVariant = 'default' | 'destructive';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.button
            type="button"
            aria-label="Cerrar"
            onClick={loading ? undefined : onCancel}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative z-10 w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              aria-label="Cerrar"
              className="absolute right-3 top-3 rounded-md p-1 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)]/40 hover:text-[var(--color-foreground)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              {variant === 'destructive' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-destructive)]/15 text-[var(--color-destructive)]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 id="confirm-title" className="text-lg font-semibold tracking-tight">
                  {title}
                </h2>
                {description && (
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button
                variant={variant === 'destructive' ? 'destructive' : 'default'}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Procesando…' : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
