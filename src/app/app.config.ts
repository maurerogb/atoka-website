import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httprequestInterceptor } from './interceptors/httprequest.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideNoopAnimations(), provideNoopAnimations(), BrowserModule,
    provideHttpClient(withInterceptors([httprequestInterceptor]))
  ]
};
