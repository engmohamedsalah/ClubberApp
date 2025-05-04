import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { AuthService } from "../../auth/auth.service";
import * as AuthActions from "../actions/auth.actions";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Router } from "@angular/router";

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  // Login effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(action =>
        this.authService.login(action.username, action.password).pipe(
          map(response => {
            localStorage.setItem("authToken", response.token);
            localStorage.setItem("authUser", JSON.stringify(response.user));
            return AuthActions.loginSuccess({ user: response.user, token: response.token });
          }),
          catchError(error => {
            const errorMessage = error?.error?.message || error?.message || "Login failed";
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Login success effect
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => this.router.navigate(["/playlist"]))
    ),
    { dispatch: false }
  );

  // Register effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(action =>
        this.authService.register(action.username, action.email, action.password).pipe(
          map(() => AuthActions.registerSuccess()),
          catchError(error => {
            const errorMessage = error?.error?.message || error?.message || "Registration failed";
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // Register success effect
  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(() => this.router.navigate(["/auth/login"]))
    ),
    { dispatch: false }
  );

  // Logout effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        this.router.navigate(["/auth/login"]);
      })
    ),
    { dispatch: false }
  );
}

