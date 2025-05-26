import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import * as AuthActions from '../actions/auth.actions';

@Injectable()
export class AuthEffects {
  login$;
  loginSuccess$;
  register$;
  registerSuccess$;
  logout$;

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {
    console.log('[AuthEffects] Constructor - actions$', this.actions$);
    console.log('[AuthEffects] Constructor - authService', this.authService);
    console.log('[AuthEffects] Constructor - router', this.router);

    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        exhaustMap(action =>
          this.authService.login(action.username, action.password).pipe(
            map(response => {
              if (response && response.token && response.user) {
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('authUser', JSON.stringify(response.user));
                return AuthActions.loginSuccess({
                  user: response.user,
                  token: response.token
                });
              } else {
                // Handle unexpected response structure
                return AuthActions.loginFailure({
                  error: 'Invalid response from server during login.'
                });
              }
            }),
            catchError(error =>
              of(AuthActions.loginFailure({
                error: error?.error?.message || error?.message || 'Login failed'
              }))
            )
          )
        )
      )
    );

    this.loginSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/playlist']))
      ), { dispatch: false }
    );

    this.register$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.register),
        exhaustMap(action =>
          this.authService.register(action.username, action.email, action.password).pipe(
            map(() => AuthActions.registerSuccess()),
            catchError(error =>
              of(AuthActions.registerFailure({
                error: error?.error?.message || error?.message || 'Registration failed'
              }))
            )
          )
        )
      )
    );

    this.registerSuccess$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/auth/login']))
      ), { dispatch: false }
    );

    this.logout$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          this.router.navigate(['/auth/login']);
        })
      ), { dispatch: false }
    );
  }
}

