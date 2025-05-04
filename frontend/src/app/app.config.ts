import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { CoreModule } from './core/core.module';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';

// Import reducers and effects
import { reducers } from './store/reducers';
import { AuthEffects } from './store/effects/auth.effects';
import { MatchesEffects } from './store/effects/matches.effects';
import { PlaylistEffects } from './store/effects/playlist.effects';

/**
 * Application configuration that sets up:
 * - Routing via Angular Router
 * - HTTP client with interceptor support
 * - Core services with interceptors
 * - NgRx Store with reducers and effects
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(CoreModule),
    provideStore(reducers),
    provideEffects([AuthEffects, MatchesEffects, PlaylistEffects]),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode in production
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: false, // If set to true, will include stack trace for every dispatched action
      traceLimit: 75, // Maximum stack trace frames to be stored (in case trace is set to true)
    })
  ]
};

