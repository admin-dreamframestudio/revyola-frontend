import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  // ✅ 1. Root redirect logic (THIS is what you need)
  if (url.pathname === "/") {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    } else {
      return NextResponse.redirect(new URL("/analysis", req.url));
    }
  }

  // ✅ 2. Protect all other routes
  if (!isPublicRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};