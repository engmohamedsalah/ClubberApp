import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../auth/auth.service";
import * as AuthActions from "../../store/actions/auth.actions";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Router } from "@angular/router";

@Injectable()
export class AuthEffects {

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(action =>
        this.authService.login(action.username, action.password).pipe(
          map(response => {
            // Save token and user info to local storage
            localStorage.setItem("authToken", response.token);
            localStorage.setItem("authUser", JSON.stringify(response.user));
            return AuthActions.loginSuccess({ user: response.user, token: response.token });
          }),
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Login failed";
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    );
  });

  loginSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => {
        this.router.navigate(["/playlist"]); // Navigate to playlist page on successful login
      })
    );
  }, { dispatch: false }); // No action dispatched from this effect

  register$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(action =>
        this.authService.register(action.username, action.email, action.password).pipe(
          map(() => AuthActions.registerSuccess()), // Assuming success doesn't return specific data
          catchError(error => {
            const errorMessage = error.error?.message || error.message || "Registration failed";
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    );
  });

  registerSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(() => {
        // Optionally show a success message
        this.router.navigate(["/auth/login"]); // Navigate to login page after successful registration
      })
    );
  }, { dispatch: false });

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        this.router.navigate(["/auth/login"]); // Navigate to login page on logout
      })
    );
  }, { dispatch: false });

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}
}

