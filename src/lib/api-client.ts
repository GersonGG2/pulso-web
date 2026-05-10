'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Authenticated fetch wrapper for client components.
 * Pulls the Clerk session token automatically and attaches it as Bearer.
 */
export function useApiClient() {
  const { getToken, isSignedIn } = useAuth();

  const request = useCallback(
    async <T>(path: string, opts: RequestOptions = {}): Promise<T> => {
      const token = isSignedIn ? await getToken() : null;
      const { body, headers, ...rest } = opts;

      const res = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(headers as Record<string, string> | undefined),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const contentType = res.headers.get('content-type') ?? '';
      const isJson = contentType.includes('application/json');

      if (!res.ok) {
        let message = res.statusText;
        if (isJson) {
          try {
            const payload = (await res.json()) as { message?: string | string[] };
            const m = payload.message;
            message = Array.isArray(m) ? m.join(', ') : (m ?? message);
          } catch {
            // ignore
          }
        }
        throw new ApiError(res.status, message);
      }

      if (res.status === 204) return undefined as T;
      return isJson ? ((await res.json()) as T) : (undefined as T);
    },
    [getToken, isSignedIn],
  );

  return {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  };
}
