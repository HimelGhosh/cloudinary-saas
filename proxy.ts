import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Define your routes using standard JavaScript arrays
const publicRoutes = ["/sign-in", "/sign-up", "/", "/home"];
const publicApiRoutes = ["/api/videos"];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const pathname = currentUrl.pathname;
  
  const isAccessingDashboard = pathname === "/home";
  const isApiRequest = pathname.startsWith("/api");
  
  // 2. Check if the current path exists in your arrays
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApiRoute = publicApiRoutes.includes(pathname);

  // If user is logged in and accessing a public route but not the dashboard
  if (userId && isPublicRoute && !isAccessingDashboard) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  
  // If user is not logged in
  if (!userId) {
    // If trying to access a protected route
    if (!isPublicRoute && !isPublicApiRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // If the request is for a protected API
    if (isApiRequest && !isPublicApiRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};