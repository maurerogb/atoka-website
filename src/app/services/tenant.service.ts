import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseResponse } from '../model/base-response';
import {
  ClaimPropertyRequest,
  ClaimedProperty,
  DocumentType,
  TenantConfirmationStatusRequest,
  TenantPerson,
} from '../model/tenant';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class TenantService extends HttpService<BaseResponse<any>> {
  constructor(private http: HttpClient) {
    super(http);
  }

  claimProperty(payload: ClaimPropertyRequest): Observable<BaseResponse<any>> {
    const url = 'PropertyOwner';
    return this.post<BaseResponse<any>>(url, payload);
  }

  claimPropertyMultipart(payload: FormData): Observable<BaseResponse<any>> {
    const url = 'PropertyOwner';
    return this.filePost(url, payload);
  }

  updateConfirmationStatus(
    payload: TenantConfirmationStatusRequest,
  ): Observable<BaseResponse<any>> {
    const url = 'PropertyOwner/updateConfirmationStatus';
    return this.put<BaseResponse<any>>(url, payload);
  }

  getTenantsAtProperty(atokaCode: string): Observable<BaseResponse<TenantPerson[]>> {
    const url = `PropertyOwner/GetAllTenant/${encodeURIComponent(atokaCode)}`;
    return this.get<BaseResponse<TenantPerson[]>>(url);
  }

  getAllClaimedProperties(): Observable<BaseResponse<ClaimedProperty[]>> {
    const url = 'PropertyOwner/GetAllProperties';
    return this.get<BaseResponse<ClaimedProperty[]>>(url);
  }

  getDocumentTypes(): Observable<BaseResponse<DocumentType[]>> {
    const url = 'DocumentType';
    return this.get<BaseResponse<DocumentType[]>>(url);
  }
}
