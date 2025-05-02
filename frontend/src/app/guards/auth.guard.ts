import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { map, take } from "rxjs/operators";
import { AppState } from "../store/reducers"; // Adjust path as needed
import { selectIsAuthenticated } from "../store/selectors/auth.selectors"; // Adjust path as needed

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store<AppState>);
  const router = inject(Router);

  return store.select(selectIsAuthenticated).pipe(
    take(1), // Take the latest value and complete
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true; // User is authenticated, allow access
      } else {
        // User is not authenticated, redirect to login page
        router.navigate(["/auth/login"]);
        return false; // Prevent access
      }
    })
  );
};

