/**
 * Thin fetch wrapper around the Pulso backend.
 * Caches GET responses for 30 seconds in Next.js fetch cache.
 */

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

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Cache TTL in seconds. Pass 0 to disable. Default 30. */
  revalidate?: number;
}

export async function api<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { body, revalidate = 30, ...rest } = opts;
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(rest.headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: revalidate > 0 ? { revalidate } : undefined,
    cache: revalidate === 0 ? 'no-store' : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }

  return (await res.json()) as T;
}

/** Convenience helpers — server-only by default (cached). Pass revalidate:0 for fresh. */
export const apiGet = <T>(path: string, revalidate?: number) =>
  api<T>(path, { method: 'GET', revalidate });

export const apiPost = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body, revalidate: 0 });
