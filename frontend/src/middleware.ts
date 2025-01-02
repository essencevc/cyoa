import { auth } from "@/auth";

export default auth((req) => {
  // Check if user is not authenticated and trying to access protected routes
  if (!req.auth) {
    // Just redirect to login if user is not authenticated and trying to access dashboard
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const newUrl = new URL("/login", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    // Throw 401 if user is not authenticated and trying to access API routes
    if (req.nextUrl.pathname.startsWith("/api/stories")) {
      return new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }
  }
});
