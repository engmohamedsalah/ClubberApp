import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "./store/reducers"; // Adjust path as needed
import { selectIsAuthenticated } from "./store/selectors/auth.selectors"; // Adjust path as needed
import * as AuthActions from "./store/actions/auth.actions"; // Adjust path as needed

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "frontend";
  isAuthenticated$: Observable<boolean>;

  constructor(private store: Store<AppState>) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}

