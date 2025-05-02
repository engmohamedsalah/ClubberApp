import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlaylistViewComponent } from "./playlist-view/playlist-view.component";

const routes: Routes = [
  {
    path: "", // Default route for playlist feature shows the user's playlist
    component: PlaylistViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlaylistRoutingModule { }

