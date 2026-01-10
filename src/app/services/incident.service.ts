import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { BaseResponse } from '../model/base-response';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidentService extends HttpService<BaseResponse<any>> {

  constructor(private http: HttpClient) {
    super(http);
  }

  getUserId(userId: any): any {
    localStorage.getItem('userId');
  }
  
  getIncidentTypes() {
    const url = `IncidentReport/IncidentType`
    return this.get<BaseResponse<any>>(url)
  }

  getIncident() {
    const url = `IncidentReport/GetUserReportedIncident`
    return this.get<BaseResponse<any>>(url)
  }

  getAllReportedIncidents() {
    const url = `IncidentReport/GetAllReportedIncident`
    return this.get<BaseResponse<any>>(url)
  }

  reportIncident(payload: any) {
    const url = `IncidentReport`
    return this.post<BaseResponse<any>>(url, payload);
  }
}
