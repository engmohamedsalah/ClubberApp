import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard"; // Import AuthGuard

export const routes: Routes = [
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
  },
  {
    path: "matches",
    loadChildren: () => import("./matches/matches.module").then(m => m.MatchesModule),
    canActivate: [authGuard] // Protect this route
  },
  {
    path: "playlist",
    loadChildren: () => import("./playlist/playlist.module").then(m => m.PlaylistModule),
    canActivate: [authGuard] // Protect this route
  },
  {
    path: "", // Default route redirects to matches (if logged in) or auth (if not)
    redirectTo: "matches", // Guard will handle redirect if not logged in
    pathMatch: "full"
  },
  {
    path: "**", // Wildcard route for 404 - redirect or show a NotFoundComponent
    redirectTo: "matches" // Simple redirect for now
  }
];

