import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { CoreModule } from './core/core.module';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { reducers } from './store/reducers';
import { AuthEffects } from './store/effects/auth.effects';
import { MatchesEffects } from './store/effects/matches.effects';
import { PlaylistEffects } from './store/effects/playlist.effects';

/**
 * Simplified application configuration
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([])
    ),
    importProvidersFrom(CoreModule, ReactiveFormsModule),
    provideStore(reducers),
    provideEffects([AuthEffects, MatchesEffects, PlaylistEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }) // Configure DevTools
  ]
};

