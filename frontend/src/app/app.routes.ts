import { Routes } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: "matches",
    loadChildren: () => import("./matches/matches.module").then(m => m.MatchesModule),
    canActivate: [authGuard]
  },
  {
    path: "playlist",
    loadChildren: () => import("./playlist/playlist.module").then(m => m.PlaylistModule),
    canActivate: [authGuard]
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
  },
  {
    path: "",
    pathMatch: "full",
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile').then(m => m.ProfileComponent)
  },
  {
    path: "**",
    redirectTo: ""
  }
];

