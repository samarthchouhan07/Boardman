import { RedirectToSignIn } from '@clerk/nextjs';
import { clerkMiddleware, createRouteMatcher, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/']);

export default clerkMiddleware(async (auth, req) => {
  
  const { userId, orgId, redirectToSignIn } = await auth();

  if (isPublicRoute(req)) {
    if (userId) {
      if (orgId) {
        const redirectToOrg = new URL(`/organization/${orgId}`, req.url);
        return NextResponse.redirect(redirectToOrg); 
      }

      const redirectToOrgSelection = new URL('/select-org', req.url);
      return NextResponse.redirect(redirectToOrgSelection);
    }
    return NextResponse.next(); 
  }

  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn(); 
  }

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
