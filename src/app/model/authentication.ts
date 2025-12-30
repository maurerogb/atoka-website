import { BaseResponse } from "./base-response";

export interface userRequest {
  userName: string
  password: string
  userId: string
}

export interface loginRequest {
  userName: string;
  password: string;
  rememberMe: boolean;
}

export interface changePasswordRequest {
  userName: string;
  oldPassword: string;
  newPassword: string;
}

export interface loginResponse extends BaseResponse<any> {
  token: string;
}

export interface loginInfo {
  accountTypeId: number,
  userId: string,
  userName: string,
  token: string,
  businessName: string,
  firstName: string,
  surname: string,
  hasBusinessInfo: boolean,
  BusinessId: number,
  exp: number,
  validatedAddress: boolean,
}
