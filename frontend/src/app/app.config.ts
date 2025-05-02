import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { reducers } from './store/reducers'; 
import { AuthEffects } from './store/effects/auth.effects';
import { MatchesEffects } from './store/effects/matches.effects';
import { PlaylistEffects } from './store/effects/playlist.effects';
import { authInterceptor } from './interceptors/auth.interceptor'; // Import the interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])), // Provide the interceptor
    provideStore(reducers), 
    provideEffects([AuthEffects, MatchesEffects, PlaylistEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};

