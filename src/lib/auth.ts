/**
 * Helpers around Clerk that gracefully degrade when the keys are missing.
 *
 * The site is designed to render its public surface without Clerk configured —
 * useful in early dev. Private routes (dashboard, registration, profile-edit)
 * surface a friendly "set up Clerk" message instead of crashing.
 */

export const CLERK_ENABLED =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'string' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 0;

export const SIGN_IN_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in';
export const SIGN_UP_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up';
export const AFTER_AUTH_URL =
  process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? '/dashboard';
