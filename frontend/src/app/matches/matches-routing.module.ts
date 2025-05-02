import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MatchesListComponent } from "./matches-list/matches-list.component";

const routes: Routes = [
  {
    path: "", // Default route for matches feature shows the list
    component: MatchesListComponent
  }
  // Add other match-related routes here if needed (e.g., match details)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MatchesRoutingModule { }

