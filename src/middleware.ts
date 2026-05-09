import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/settings(.*)',
]);

const middleware = CLERK_ENABLED
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : function noopMiddleware(_req: NextRequest) {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run on API and tRPC routes
    '/(api|trpc)(.*)',
  ],
};
