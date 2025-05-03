import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "matches",
    loadChildren: () => import("./matches/matches.module").then(m => m.MatchesModule)
  },
  {
    path: "playlist",
    loadChildren: () => import("./playlist/playlist.module").then(m => m.PlaylistModule)
  },
  {
    path: "", // Default route redirects to matches
    redirectTo: "matches",
    pathMatch: "full"
  },
  {
    path: "**", // Wildcard route for 404
    redirectTo: "matches"
  }
];

