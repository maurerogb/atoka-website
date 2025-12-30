import { Injectable } from '@angular/core';
import { Observable, of, switchMap, map, throwError } from 'rxjs';
import {
  loginInfo,
  loginRequest,
  loginResponse,
  changePasswordRequest,
} from '../model/authentication';
import { BaseResponse } from '../model/base-response';
import { ResponseCode } from '../model/enums';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService extends HttpService<BaseResponse<any>> {
  private readonly loginKey = 'atk_login';
  private loginInfoValue?: loginInfo;

  constructor(
    private http: HttpClient,
    private route: Router,
    private storage: LocalStorageService
  ) {
    super(http);
  }

  login(request: loginRequest): Observable<loginResponse>{
    const url = 'Auth/login';
    return this.post<loginResponse>(url, request);
  }

  forgotPassword(email: string): Observable<BaseResponse<any>> {
    const url = `Auth/ForgottenPassword/${encodeURIComponent(email)}`;
    return this.get<BaseResponse<any>>(url);
  }

  changePassword(request: changePasswordRequest): Observable<BaseResponse<any>> {
    const url = 'Auth/ChangePassword';
    return this.post<BaseResponse<any>>(url, request);
  }

  loginAndValidateAddress(request: loginRequest): Observable<loginInfo> {
    return this.login(request).pipe(
      switchMap((res: loginResponse) => {
        if (res.responseCode !== ResponseCode.Success || !res.token) {
          return throwError(() => res);
        }

        const claims: any = jwtDecode(res.token ?? '');
        const data: loginInfo = {
          accountTypeId: Number(claims.AccountTypeId),
          userName: claims.unique_name,
          userId: claims.nameid,
          token: res.token,
          businessName: claims.BusinessName,
          firstName: claims.FirstName,
          surname: claims.Surname,
          hasBusinessInfo: claims.hasBusinessInfo === '1' ? true : false,
          BusinessId: claims.BusinessId,
          validatedAddress: false,
          exp: claims.exp,
        };
        
        this.setLoginInfo(data);

        return this.validateAddress().pipe(
          map((result: BaseResponse<boolean>) => {
            if (result.responseCode !== ResponseCode.Success) {
              throw result;
            }

            if (result.data) {
              data.validatedAddress = true;

              // update validatedAddress
              this.setLoginInfo(data);
            }

            return data;
          })
        );
      })
    );
  }

  getNavigateRoute(data?: loginInfo): string | null {
    if (!data) {
      data = this.getLoginInfo();
    }

    if (data) {
      if (!data.validatedAddress && data.accountTypeId <= 2) {
        return '/app/complete-registration/validate-address'
      }

      if (!data.hasBusinessInfo && data.accountTypeId > 2) {
        return '/app/complete-registration/business';
      }

      if (data.accountTypeId === 1) {
        return '/app/user';
      }

      if (data.accountTypeId === 2) {
        return '/app/tenant';
      }

      if (data.accountTypeId === 3) {
        return '/app/business-account';
      }

      if (data.accountTypeId === 4) {
        return '/app/public-service';
      }
    }

    return null;
  }

  setLoginInfo(info: loginInfo): void {
    this.loginInfoValue = info;
    this.storage.setItem<loginInfo>(this.loginKey, info);
  }

  clearLoginInfo(): void {
    this.clearLogin();
  }

  getLoginInfo(): loginInfo | undefined {
    if (this.loginInfoValue) {
      return this.loginInfoValue;
    }

    const stored = this.storage.getItem<loginInfo>(this.loginKey);
    if (stored) {
      this.loginInfoValue = stored;
    }

    return this.loginInfoValue;
  }

  private clearLogin(): void {
    this.loginInfoValue = undefined;
    this.storage.removeItem(this.loginKey);
  }

  isLoggedIn(): boolean {
    const info = this.getLoginInfo();

    if (!info || !info.token || !info.exp) {
      this.clearLogin();
      return false;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (info.exp <= nowInSeconds) {
      this.clearLogin();
      return false;
    }

    return true;
  }

  logout(): void {
    this.clearLogin();
    this.route.navigate(['/login']);
  }

  validateAddress(): Observable<BaseResponse<boolean>> {
    let url = 'ResidenceStartFrom/GetResidenceStart';
    return this.get<BaseResponse<any>>(url);
  }

  createUser(user: any): Observable<BaseResponse<any>> {
    if (!user.userId) {
      let userId = localStorage.getItem('userId');
      user.userId = userId
    }

    const url = 'Auth/register2'
    return this.post<BaseResponse<any>>(url, user);
  }
}
