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
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
  },
  {
    path: "",
    pathMatch: "full",
    redirectTo: "" // This will use the app component's home content
  },
  {
    path: "**",
    redirectTo: ""
  }
];

