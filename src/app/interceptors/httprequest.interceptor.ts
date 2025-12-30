import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { LocalStorageService } from '../services/local-storage.service';
import { loginInfo } from '../model/authentication';

export const httprequestInterceptor: HttpInterceptorFn = (req, next) => {
  const baseUrl = environment.testMode
    ? environment.localUrl
    : environment.remoteUrl;
  const loadingService = inject(LoadingService);
  const storage = inject(LocalStorageService);

  const skipLoader = req.headers.get('X-Skip-Loader') === 'true';

  if (!skipLoader) {
    loadingService.show();
  }

  let modifiedReq = req;

  // Prefix relative, non-asset URLs with the selected base URL.
  if (!/^https?:\/\//i.test(modifiedReq.url) && !modifiedReq.url.includes('assets')) {
    modifiedReq = modifiedReq.clone({
      url: baseUrl + modifiedReq.url,
    });
  }

  // Attach bearer token from stored login info if available.
  const login = storage.getItem<loginInfo>('atk_login');
  if (login?.token) {
    modifiedReq = modifiedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${login.token}`,
        userId: login?.userId || ''
      },
    });
  }

  return next(modifiedReq).pipe(
    finalize(() => {
      if (!skipLoader) {
        loadingService.hide();
      }
    })
  );
};
