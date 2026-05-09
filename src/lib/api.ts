/**
 * Thin fetch wrapper around the Pulso backend.
 * Caches GET responses for 30 seconds in Next.js fetch cache by default.
 *
 * Server components automatically attach the Clerk session JWT when
 * available so authenticated endpoints (e.g. /users/me) work end-to-end.
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
  /** Bearer token to attach as Authorization. Mostly used by server-side helpers. */
  token?: string | null;
}

export async function api<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { body, revalidate = 30, token, headers, ...rest } = opts;
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
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

export const apiGet = <T>(path: string, revalidate?: number) =>
  api<T>(path, { method: 'GET', revalidate });

export const apiPost = <T>(path: string, body?: unknown, token?: string | null) =>
  api<T>(path, { method: 'POST', body, revalidate: 0, token });

/**
 * Server-only helper that fetches with the current user's Clerk session token.
 * Throws if Clerk is not enabled or the user isn't authenticated.
 */
export async function apiAsCurrentUser<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new ApiError(503, 'Clerk not configured');
  }
  // Lazy import to keep this module usable from client components.
  const { auth } = await import('@clerk/nextjs/server');
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) throw new ApiError(401, 'Not authenticated');
  return api<T>(path, { ...opts, token });
}
