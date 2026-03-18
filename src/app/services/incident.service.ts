import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { BaseResponse } from '../model/base-response';
import { IncidentPriority } from '../model/incident';

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

  getIncidentPriorities() {
    const url = `IncidentReport/Incident-priority`
    return this.get<IncidentPriority[]>(url)
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
    const url = `IncidentReport/Web`
    return this.filePost(url, payload);
  }
}
