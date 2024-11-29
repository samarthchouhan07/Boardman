import { RedirectToSignIn } from '@clerk/nextjs';
import { clerkMiddleware, createRouteMatcher, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public route matcher (only / is public)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, req) => {
  // Get user auth details
  const { userId, orgId, redirectToSignIn } = await auth();

  // If the route is public (only "/"), no need for authentication
  if (isPublicRoute(req)) {
    // If the user is authenticated, redirect to either /select-org or /organization/{orgId}
    if (userId) {
      if (orgId) {
        const redirectToOrg = new URL(`/organization/${orgId}`, req.url);
        return NextResponse.redirect(redirectToOrg); // Redirect to user's organization page
      }

      // If user is authenticated but has no organization, redirect to /select-org
      const redirectToOrgSelection = new URL('/select-org', req.url);
      return NextResponse.redirect(redirectToOrgSelection);
    }
    return NextResponse.next(); // Public route for unauthenticated users
  }

  // If user is not authenticated and trying to access a non-public route
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn(); // Redirect to sign-in page
  }

  // If authenticated but no organization, and the current path is not /select-org, redirect to /select-org
  if (userId && !orgId && req.nextUrl.pathname !== '/select-org') {
    const redirectToOrgSelection = new URL('/select-org', req.url);
    return NextResponse.redirect(redirectToOrgSelection);
  }

  // Otherwise, proceed with the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', // Exclude Next.js internals and static files
    '/(api|trpc)(.*)', // Include API and trpc routes
  ],
};
