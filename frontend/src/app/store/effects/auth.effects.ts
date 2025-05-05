import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import * as AuthActions from '../actions/auth.actions';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(action =>
        this.authService.login(action.username, action.password).pipe(
          map(response => {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('authUser', JSON.stringify(response.user));
            return AuthActions.loginSuccess({
              user: response.user,
              token: response.token
            });
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

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/playlist']))
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
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

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/auth/login']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          this.router.navigate(['/auth/login']);
        })
      ),
    { dispatch: false }
  );
}

