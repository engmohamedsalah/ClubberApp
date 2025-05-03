import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { CoreModule } from './core/core.module';

/**
 * Application configuration that sets up:
 * - Routing via Angular Router
 * - HTTP client with interceptor support
 * - Core services with interceptors
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(CoreModule)
  ]
};

