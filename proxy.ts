import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
  const { userId } = await auth();

  if (!userId) {
    return Response.redirect(new URL("/sign-in", req.url));
  }
}
// redirect logged-in users from root → /analysis
if (req.nextUrl.pathname === "/") {
  const { userId } = await auth();
  if (userId) {
    return Response.redirect(new URL("/analysis", req.url));
  }
}
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};