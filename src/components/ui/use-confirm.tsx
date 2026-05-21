'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { ConfirmDialog } from './confirm-dialog';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/**
 * Hook that exposes an imperative confirm() that returns a Promise<boolean>.
 * Drop-in replacement for the native window.confirm() with a styled modal.
 *
 *   const { confirm, dialog } = useConfirm();
 *   if (!(await confirm({ title: '...' }))) return;
 *   ...
 *   return <>{dialog}{...}</>;
 */
export function useConfirm(): {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  dialog: ReactNode;
  loading: boolean;
  setLoading: (v: boolean) => void;
} {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const dialog = state ? (
    <ConfirmDialog
      open
      title={state.title}
      description={state.description}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      variant={state.variant}
      loading={loading}
      onConfirm={() => {
        state.resolve(true);
        setState(null);
        setLoading(false);
      }}
      onCancel={() => {
        state.resolve(false);
        setState(null);
        setLoading(false);
      }}
    />
  ) : null;

  return { confirm, dialog, loading, setLoading };
}
