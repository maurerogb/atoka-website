import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse } from '../model/base-response';
import {
  ActionOnViewRequestPayload,
  CreateViewRequestPayload,
  MyViewRequest,
  PendingViewRequest,
  UseProfile,
  ViewApprovedProfileData,
  ViewApprovedProfileRequest,
} from '../model/profile';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService extends HttpService<BaseResponse<any>> {
  constructor(private http: HttpClient) {
    super(http);
  }

  getProfileByPhone(phoneNo: string): Observable<BaseResponse<UseProfile>> {
    const url = 'OccupantDetails/Profile-lookup';
    return this.get<BaseResponse<UseProfile>>(url, {
      params: { phoneNo },
    });
  }

  createViewRequest(payload: CreateViewRequestPayload): Observable<BaseResponse<any>> {
    const url = 'OccupantDetails/create-view-Request';
    return this.post<BaseResponse<any>>(url, payload);
  }

  getViewApprovedProfiles(): Observable<BaseResponse<ViewApprovedProfileRequest[]>> {
    const url = 'OccupantDetails/view-approved-profile';
    return this.get<BaseResponse<ViewApprovedProfileRequest[]>>(url);
  }

  getApprovedProfileByRequest(
    accessRequestId: number,
  ): Observable<BaseResponse<ViewApprovedProfileData> & { expiresOn?: string }> {
    const url = 'OccupantDetails/view-approved-profile';
    return this.get<BaseResponse<ViewApprovedProfileData> & { expiresOn?: string }>(url, {
      params: { accessRequestId },
    });
  }

  getMyViewRequests(requesterId: number, isBusiness = false): Observable<BaseResponse<MyViewRequest[]>> {
    const url = `OccupantDetails/get-my-view-request/${requesterId}`;
    const options = isBusiness ? { params: { isBusiness: true } } : undefined;
    return this.get<BaseResponse<MyViewRequest[]>>(url, options);
  }

  getPendingViewRequests(): Observable<BaseResponse<PendingViewRequest[]>> {
    const url = 'OccupantDetails/get-pending-view-request';
    return this.get<BaseResponse<PendingViewRequest[]>>(url);
  }

  actionOnViewRequest(payload: ActionOnViewRequestPayload): Observable<BaseResponse<any>> {
    const url = 'OccupantDetails/action-on-view-request';
    return this.post<BaseResponse<any>>(url, payload);
  }
}
