import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// On définit les routes qui nécessitent d'être connecté
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/analyses(.*)',
    '/parametres(.*)',
    '/bibliotheque(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};