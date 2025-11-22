import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AUTH_PROVIDER } from 'shared-components';

import { routes } from './app.routes';
import { MockAuthService } from './services/mock-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: AUTH_PROVIDER, useClass: MockAuthService }
  ]
};
